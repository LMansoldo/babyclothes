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

  @doc """
  Verify an internal HS256 token (used for agent→API calls).
  """
  def verify_internal_token(token) do
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)

    case JOSE.JWT.verify_strict(jwk, ["HS256"], token) do
      {true, jwt, _} -> {:ok, JOSE.JWT.to_map(jwt) |> elem(1)}
      _ -> {:error, :invalid_token}
    end
  end

  @doc """
  Generate an internal HS256 token for a user.
  """
  def generate_internal_token(%User{} = user) do
    secret = Application.get_env(:api, :internal_jwt_secret)
    claims = %{"sub" => to_string(user.id), "email" => user.email, "name" => user.name}

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
