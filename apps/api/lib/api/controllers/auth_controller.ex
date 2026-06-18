defmodule Api.Controllers.AuthController do
  @moduledoc """
  Controller for authentication endpoints.
  """

  import Plug.Conn

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
                avatar_url: user.avatar_url
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
end
