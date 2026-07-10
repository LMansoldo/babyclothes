defmodule Api.Controllers.AuthController do
  @moduledoc """
  Controller for authentication endpoints.
  """

  import Plug.Conn
  alias Api.Repo
  alias Api.Users
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
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Jason.encode!(%{
              token: Api.Auth.generate_access_token(user),
              refresh_token: Api.Auth.generate_refresh_token(user),
              user: user_json(user)
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

  @dev_user_email "dev@babyclothes.app"

  @doc """
  POST /auth/dev-login
  Development-only login: issues tokens for a local dev user without Google.

  Returns 404 unless `config :api, dev_login_enabled: true` (dev/test only).
  """
  def dev_login(conn) do
    case Application.get_env(:api, :dev_login_enabled, false) do
      true -> do_dev_login(conn)
      _ -> respond_dev_login_disabled(conn)
    end
  end

  defp do_dev_login(conn) do
    case fetch_or_create_dev_user() do
      {:ok, user} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{
          token: Api.Auth.generate_access_token(user),
          refresh_token: Api.Auth.generate_refresh_token(user),
          user: user_json(user)
        }))

      {:error, _changeset} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Jason.encode!(%{error: "dev_login_failed"}))
    end
  end

  defp respond_dev_login_disabled(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "not found"}))
  end

  defp fetch_or_create_dev_user do
    case Repo.get_by(User, email: @dev_user_email) do
      %User{} = user -> {:ok, user}
      nil -> create_dev_user()
    end
  end

  defp create_dev_user do
    base_attrs = %{
      email: @dev_user_email,
      name: "Dev User",
      avatar_url: "",
      google_id: "dev-login-local",
      is_seller: true
    }

    with {:ok, base} <- %User{} |> User.changeset(base_attrs) |> Repo.insert(),
         {:ok, user} <-
           base |> User.registration_changeset(%{type: "pf", cpf: "39053344705"}) |> Repo.update() do
      {:ok, user}
    end
  end

  @doc """
  POST /auth/refresh
  Exchanges a valid refresh token for a fresh access + refresh token pair.
  """
  def refresh(conn) do
    with %{"refresh_token" => refresh_token} when is_binary(refresh_token) <- conn.body_params,
         {:ok, claims} <- Api.Auth.verify_token(refresh_token, "refresh"),
         %User{} = user <- Repo.get(User, claims["sub"]) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{
        token: Api.Auth.generate_access_token(user),
        refresh_token: Api.Auth.generate_refresh_token(user),
        user: user_json(user)
      }))
    else
      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "invalid_refresh_token"}))
    end
  end

  @doc """
  POST /auth/logout
  Stateless logout — the client discards its cookies. Returns 200.
  """
  def logout(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{ok: true}))
  end

  @doc """
  POST /auth/register
  Completes the one-time PF/PJ registration for the authenticated user.
  """
  def register(conn) do
    with {:ok, claims} <- authenticate(conn),
         {:ok, user} <- get_user(claims["sub"]),
         {:ok, registered} <- Users.register_account(user, conn.body_params) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{user: user_json(registered)}))
    else
      {:error, :unauthorized} -> register_error(conn, 401, %{error: "invalid_token"})
      {:error, :not_found} -> register_error(conn, 404, %{error: "user_not_found"})
      {:error, :already_registered} -> register_error(conn, 409, %{error: "already_registered"})
      {:error, %Ecto.Changeset{} = changeset} ->
        register_error(conn, 422, %{error: "validation_failed", details: changeset_errors(changeset)})
      {:error, _} -> register_error(conn, 401, %{error: "invalid_token"})
    end
  end

  defp register_error(conn, status, payload) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Jason.encode!(payload))
  end

  defp changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {message, _opts} -> message end)
  end

  defp authenticate(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> Auth.verify_internal_token(token)
      _ -> {:error, :unauthorized}
    end
  end

  defp get_user(id), do: Users.get_user(id)

  defp user_json(user) do
    %{
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      type: user.type,
      cpf: user.cpf,
      cnpj: user.cnpj,
      is_seller: user.is_seller
    }
  end
end
