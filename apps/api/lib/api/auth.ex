defmodule Api.Auth do
  @moduledoc """
  JWT authentication module.

  Supports two modes:
  1. Google OAuth tokens — verified via Google's JWKS endpoint
  2. Internal HS256 tokens — verified with INTERNAL_JWT_SECRET
  """

  alias Api.Users.User
  alias Api.Repo

  @doc """
  Verify a Google OAuth token and return or create a user.
  """
  def verify_google_token(token) do
    with {:ok, claims} <- verify_google_jwt(token),
         {:ok, user} <- find_or_create_user(claims) do
      {:ok, user}
    end
  end

  @access_ttl 3_600
  @refresh_ttl 2_592_000

  @doc """
  Generate a short-lived access token (1h) for a user.
  """
  def generate_access_token(%User{} = user) do
    now = System.system_time(:second)

    sign(%{
      "sub" => to_string(user.id),
      "email" => user.email,
      "name" => user.name,
      "typ" => "access",
      "iat" => now,
      "exp" => now + @access_ttl
    })
  end

  @doc """
  Generate a long-lived refresh token (30d) for a user.
  """
  def generate_refresh_token(%User{} = user) do
    now = System.system_time(:second)

    sign(%{
      "sub" => to_string(user.id),
      "typ" => "refresh",
      "iat" => now,
      "exp" => now + @refresh_ttl
    })
  end

  @doc """
  Verify an HS256 token, checking signature, expiration and the `typ` claim.
  """
  @spec verify_token(String.t(), String.t()) ::
          {:ok, map()} | {:error, :invalid_token | :token_expired | :wrong_type}
  def verify_token(token, expected_typ) do
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)

    case JOSE.JWT.verify_strict(jwk, ["HS256"], token) do
      {true, jwt, _} ->
        claims = JOSE.JWT.to_map(jwt) |> elem(1)
        now = System.system_time(:second)

        cond do
          is_integer(claims["exp"]) and claims["exp"] < now -> {:error, :token_expired}
          claims["typ"] != expected_typ -> {:error, :wrong_type}
          true -> {:ok, claims}
        end

      _ ->
        {:error, :invalid_token}
    end
  end

  @doc """
  Compat wrapper — issues an access token. Kept for existing callers.
  """
  def generate_internal_token(%User{} = user), do: generate_access_token(user)

  @doc """
  Compat wrapper — verifies an access token. Kept for existing callers.
  """
  def verify_internal_token(token), do: verify_token(token, "access")

  defp sign(claims) do
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)
    jwt = JOSE.JWT.from_map(claims)
    jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
    JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)
  end

  defp verify_google_jwt(token) do
    case fetch_google_jwks() do
      {:ok, jwks} ->
        case JOSE.JWT.verify_strict(jwks, ["RS256"], token) do
          {true, jwt, _} ->
            claims = JOSE.JWT.to_map(jwt) |> elem(1)

            if claims["aud"] == Application.get_env(:api, :google_client_id) do
              {:ok, claims}
            else
              {:error, :invalid_audience}
            end

          _ ->
            {:error, :invalid_token}
        end

      error ->
        error
    end
  end

  defp fetch_google_jwks() do
    case Finch.build(:get, "https://www.googleapis.com/oauth2/v3/certs") |> Finch.request(Api.Finch) do
      {:ok, %{status: 200, body: body}} ->
        jwks = Jason.decode!(body)
        keys = Enum.map(jwks["keys"], fn key ->
          JOSE.JWK.from_map(%{"kty" => key["kty"], "n" => key["n"], "e" => key["e"], "kid" => key["kid"]})
        end)
        {:ok, JOSE.JWK.from_map(%{"keys" => keys})}

      _ ->
        {:error, :jwks_fetch_failed}
    end
  end

  defp find_or_create_user(%{"sub" => google_id, "email" => email} = claims) do
    name = claims["name"] || email |> String.split("@") |> hd()
    avatar_url = claims["picture"]

    case Repo.get_by(User, google_id: google_id) do
      nil ->
        %User{}
        |> User.changeset(%{
          email: email,
          name: name,
          avatar_url: avatar_url,
          google_id: google_id
        })
        |> Repo.insert()

      user ->
        if user.name != name || user.avatar_url != avatar_url do
          user
          |> User.changeset(%{name: name, avatar_url: avatar_url})
          |> Repo.update()
        else
          {:ok, user}
        end
    end
  end

end
