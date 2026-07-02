defmodule Api.Plugs.RequireAuth do
  @moduledoc """
  Halts the request with 401 unless `current_user_id` is set on conn assigns.

  Intended to be used alongside `Api.Plugs.Auth` in routes that require
  authentication. Add `plug Api.Plugs.RequireAuth` after `plug :dispatch`
  in route blocks that need protection.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    if conn.assigns[:current_user_id] do
      conn
    else
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(401, Jason.encode!(%{error: "unauthorized"}))
      |> halt()
    end
  end
end
