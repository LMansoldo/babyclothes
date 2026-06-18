defmodule Api.Controllers.NotificationsControllerTest do
  use Api.ConnCase, async: true

  describe "GET /users/:user_id/notifications" do
    test "returns notifications for a user" do
      user = insert(:user)
      _n1 = insert(:notification, user: user, title: "First")
      _n2 = insert(:notification, user: user, title: "Second")

      conn = conn(:get, "/users/#{user.id}/notifications") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["notifications"]) == 2
    end

    test "returns empty list when no notifications" do
      user = insert(:user)
      conn = conn(:get, "/users/#{user.id}/notifications") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["notifications"] == []
    end
  end

  describe "GET /users/:user_id/notifications/unread-count" do
    test "returns unread count" do
      user = insert(:user)
      _unread = insert(:notification, user: user, read_at: nil)
      _read = insert(:notification, user: user, read_at: DateTime.utc_now())

      conn = conn(:get, "/users/#{user.id}/notifications/unread-count") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["unread_count"] == 1
    end

    test "returns 0 when no unread" do
      user = insert(:user)
      conn = conn(:get, "/users/#{user.id}/notifications/unread-count") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["unread_count"] == 0
    end
  end

  describe "POST /users/:user_id/notifications" do
    test "creates notification with valid params" do
      user = insert(:user)
      body_params = %{"type" => "growth_prediction", "title" => "Growth update", "body" => "Size M needed"}

      conn =
        conn(:post, "/users/#{user.id}/notifications", body_params)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["notification"]["title"] == "Growth update"
      assert body["notification"]["type"] == "growth_prediction"
    end

    test "returns 422 with missing fields" do
      user = insert(:user)

      conn =
        conn(:post, "/users/#{user.id}/notifications", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["errors"]["type"]
      assert body["errors"]["title"]
    end
  end

  describe "PATCH /notifications/:id/read" do
    test "marks notification as read" do
      notification = insert(:notification, read_at: nil)

      conn =
        conn(:patch, "/notifications/#{notification.id}/read")
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["notification"]["read_at"] != nil
    end

    test "returns 404 for non-existent notification" do
      conn =
        conn(:patch, "/notifications/999999/read")
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "PATCH /users/:user_id/notifications/read-all" do
    test "marks all notifications as read" do
      user = insert(:user)
      _unread1 = insert(:notification, user: user, read_at: nil)
      _unread2 = insert(:notification, user: user, read_at: nil)

      conn =
        conn(:patch, "/users/#{user.id}/notifications/read-all")
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["updated"] == 2
    end
  end

  describe "DELETE /notifications/:id" do
    test "deletes an existing notification" do
      notification = insert(:notification)
      conn = conn(:delete, "/notifications/#{notification.id}") |> Api.Router.call([])
      assert conn.status == 204
    end

    test "returns 404 for non-existent notification" do
      conn = conn(:delete, "/notifications/999999") |> Api.Router.call([])
      assert conn.status == 404
    end
  end
end
