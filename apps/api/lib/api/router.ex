defmodule Api.Router do
  use Plug.Router

  plug Api.Plugs.CORS
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

  post "/auth/google" do
    Api.Controllers.AuthController.google_login(conn)
  end

  # Feature Flags
  get "/feature-flags" do
    Api.Controllers.FeatureFlagsController.index(conn)
  end

  get "/feature-flags/:key" do
    Api.Controllers.FeatureFlagsController.show(conn, key)
  end

  post "/feature-flags" do
    Api.Controllers.FeatureFlagsController.create(conn)
  end

  patch "/feature-flags/:key" do
    Api.Controllers.FeatureFlagsController.update(conn, key)
  end

  post "/feature-flags/:key/toggle" do
    Api.Controllers.FeatureFlagsController.toggle(conn, key)
  end

  delete "/feature-flags/:key" do
    Api.Controllers.FeatureFlagsController.delete(conn, key)
  end

  # Items
  get "/items" do
    Api.Controllers.ItemsController.index(conn)
  end

  get "/items/:id" do
    Api.Controllers.ItemsController.show(conn, id)
  end

  post "/items" do
    Api.Controllers.ItemsController.create(conn)
  end

  patch "/items/:id" do
    Api.Controllers.ItemsController.update(conn, id)
  end

  delete "/items/:id" do
    Api.Controllers.ItemsController.delete(conn, id)
  end

  get "/items/:item_id/photos" do
    Api.Controllers.ItemsController.list_photos(conn, item_id)
  end

  post "/items/:item_id/photos" do
    Api.Controllers.ItemsController.add_photo(conn, item_id)
  end

  # Catalog
  get "/catalog" do
    Api.Controllers.CatalogController.index(conn)
  end

  # Children
  get "/users/:user_id/children" do
    Api.Controllers.ChildrenController.index(conn, user_id)
  end

  get "/children/:id" do
    Api.Controllers.ChildrenController.show(conn, id)
  end

  post "/children" do
    Api.Controllers.ChildrenController.create(conn)
  end

  patch "/children/:id" do
    Api.Controllers.ChildrenController.update(conn, id)
  end

  delete "/children/:id" do
    Api.Controllers.ChildrenController.delete(conn, id)
  end

  # Measurements
  get "/children/:child_id/measurements" do
    Api.Controllers.ChildrenController.list_measurements(conn, child_id)
  end

  post "/children/:child_id/measurements" do
    Api.Controllers.ChildrenController.add_measurement(conn, child_id)
  end

  patch "/measurements/:id" do
    Api.Controllers.ChildrenController.update_measurement(conn, id)
  end

  delete "/measurements/:id" do
    Api.Controllers.ChildrenController.delete_measurement(conn, id)
  end

  # Notifications
  get "/users/:user_id/notifications" do
    Api.Controllers.NotificationsController.index(conn, user_id)
  end

  get "/users/:user_id/notifications/unread-count" do
    Api.Controllers.NotificationsController.unread_count(conn, user_id)
  end

  post "/users/:user_id/notifications" do
    Api.Controllers.NotificationsController.create(conn, user_id)
  end

  patch "/notifications/:id/read" do
    Api.Controllers.NotificationsController.mark_as_read(conn, id)
  end

  patch "/users/:user_id/notifications/read-all" do
    Api.Controllers.NotificationsController.mark_all_as_read(conn, user_id)
  end

  delete "/notifications/:id" do
    Api.Controllers.NotificationsController.delete(conn, id)
  end

  match _ do
    send_resp(conn, 404, Jason.encode!(%{error: "not found"}))
  end
end
