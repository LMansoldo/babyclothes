defmodule Api.Router do
  use Plug.Router

  plug Plug.Logger
  plug Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason

  plug :match
  plug :dispatch

  get "/health" do
    send_resp(conn, 200, Jason.encode!(%{status: "ok"}))
  end

  match _ do
    send_resp(conn, 404, Jason.encode!(%{error: "not found"}))
  end
end
