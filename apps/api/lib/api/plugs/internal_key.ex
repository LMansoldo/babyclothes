defmodule Api.Plugs.InternalKey do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    internal_key = Application.get_env(:api, :internal_api_key)

    case get_req_header(conn, "x-internal-key") do
      [^internal_key] ->
        conn

      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(403, Jason.encode!(%{error: "forbidden"}))
        |> halt()
    end
  end
end
