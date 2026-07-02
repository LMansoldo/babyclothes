defmodule Api.Plugs.Auth do
  @moduledoc """
  Verifies the Bearer access token and assigns `current_user_id` (integer).
  Halts with 401 if the token is missing, invalid, expired, or of the wrong type.

  Used inline in controller actions (Plug.Router has no pipe_through):

      def create(conn) do
        conn = Api.Plugs.Auth.call(conn, [])
        if conn.halted, do: conn, else: # ... authenticated logic
      end
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] ->
        case Api.Auth.verify_token(token, "access") do
          {:ok, claims} -> assign(conn, :current_user_id, String.to_integer(claims["sub"]))
          {:error, _} -> unauthorized(conn)
        end

      _ ->
        unauthorized(conn)
    end
  end

  defp unauthorized(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(401, Jason.encode!(%{error: "unauthorized"}))
    |> halt()
  end
end
