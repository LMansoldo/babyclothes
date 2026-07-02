defmodule Api.InternalRouter do
  @moduledoc """
  Router for internal API routes used by the agents service.
  All routes require a valid x-internal-key header.
  """

  use Plug.Router

  plug Api.Plugs.InternalKey
  plug :match
  plug :dispatch

  post "/notifications" do
    Api.Controllers.InternalController.create_notification(conn)
  end

  get "/children/:id/context" do
    Api.Controllers.InternalController.child_context(conn, id)
  end

  get "/items/search" do
    Api.Controllers.InternalController.search_items(conn)
  end

  match _ do
    send_resp(conn, 404, Jason.encode!(%{error: "not found"}))
  end
end
