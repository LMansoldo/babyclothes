defmodule Api.Controllers.AuthController do
  @moduledoc """
  Controller for authentication endpoints.
  """

  import Plug.Conn
  alias Api.Repo
  alias Api.Users.User
  alias Api.Auth

  @doc """
  GET /auth/session
  Validates the internal JWT and returns the current user.
  """
  def session(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] ->
        case Api.Auth.verify_internal_token(token) do
          {:ok, claims} ->
            case Repo.get(User, claims["sub"]) do
              %User{} = user ->
                conn
                |> put_resp_content_type("application/json")
                |> send_resp(200, Jason.encode!(%{
                  user: %{
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar_url: user.avatar_url,
                    type: user.type,
                    cpf: user.cpf,
                    cnpj: user.cnpj,
                    is_seller: user.is_seller
                  }
                }))

              nil ->
                conn
                |> put_resp_content_type("application/json")
                |> send_resp(401, Jason.encode!(%{error: "user_not_found"}))
            end

          {:error, _} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(401, Jason.encode!(%{error: "invalid_token"}))
        end

      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "missing_authorization"}))
    end
  end

  @doc """
  POST /auth/google
  Verifies a Google OAuth token and returns an internal JWT.
  """
  def google_login(conn) do
    case conn.body_params do
      %{"token" => google_token} when is_binary(google_token) ->
        case Api.Auth.verify_google_token(google_token) do
          {:ok, user} ->
            internal_token = Api.Auth.generate_internal_token(user)

            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Jason.encode!(%{
              token: internal_token,
              user: %{
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
                type: user.type,
                cpf: user.cpf,
                cnpj: user.cnpj,
                is_seller: user.is_seller
              }
            }))

          {:error, :invalid_audience} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(401, Jason.encode!(%{error: "invalid_audience"}))

          {:error, :invalid_token} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(401, Jason.encode!(%{error: "invalid_google_token"}))

          {:error, _reason} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(500, Jason.encode!(%{error: "authentication_failed"}))
        end

      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Jason.encode!(%{error: "missing_token"}))
    end
  end

  @doc """
  PATCH /auth/me
  Updates the authenticated user's PF/PJ profile (type, cpf, cnpj).
  """
  def update_me(conn) do
    with {:ok, claims} <- authenticate(conn),
         {:ok, user} <- get_user(claims["sub"]),
         {:ok, updated_user} <- update_user(user, conn.body_params) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{
        user: %{
          id: updated_user.id,
          email: updated_user.email,
          name: updated_user.name,
          avatar_url: updated_user.avatar_url,
          type: updated_user.type,
          cpf: updated_user.cpf,
          cnpj: updated_user.cnpj,
          is_seller: updated_user.is_seller
        }
      }))
    else
      {:error, :unauthorized} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "invalid_token"}))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "user_not_found"}))

      {:error, changeset} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{error: "validation_failed", details: changeset.errors}))
    end
  end

  defp authenticate(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> Auth.verify_internal_token(token)
      _ -> {:error, :unauthorized}
    end
  end

  defp get_user(id) do
    case Repo.get(User, id) do
      %User{} = user -> {:ok, user}
      nil -> {:error, :not_found}
    end
  end

  defp update_user(user, params) do
    user
    |> User.changeset(params)
    |> Repo.update()
  end
end
