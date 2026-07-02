defmodule Api.Controllers.ItemsControllerTest do
  use Api.ConnCase, async: true

  setup do
    Api.Repo.delete_all(Api.Items.Item)
    :ok
  end

  describe "GET /items" do
    test "returns empty list" do
      conn = conn(:get, "/items") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["items"] == []
    end

    test "returns items" do
      _item = insert(:item, title: "Test Item")

      conn = conn(:get, "/items") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["items"]) == 1
    end

    test "filters by category" do
      _body = insert(:item, category: "body")
      _macacao = insert(:item, category: "macacao")

      conn = conn(:get, "/items?category=body") |> Api.Router.call([])
      body = Jason.decode!(conn.resp_body)
      assert length(body["items"]) == 1
    end
  end

  describe "GET /items/:id" do
    test "returns item with photos" do
      item = insert(:item, title: "Detail Item")
      _photo = insert(:photo, item: item, url: "photo.jpg")

      conn = conn(:get, "/items/#{item.id}") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["title"] == "Detail Item"
      assert length(body["photos"]) == 1
    end

    test "returns 404 for nonexistent item" do
      conn = conn(:get, "/items/999999") |> Api.Router.call([])
      assert conn.status == 404
    end
  end

  describe "POST /items" do
    test "creates item with valid params" do
      seller = insert(:user)
      token = Api.Auth.generate_internal_token(seller)

      params = %{
        "title" => "New Item",
        "category" => "body",
        "gender" => "unisex",
        "clothing_size" => "M",
        "condition" => "new",
        "price_cents" => 3500
      }

      conn =
        conn(:post, "/items", params)
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["title"] == "New Item"
      assert body["status"] == "active"
    end

    test "returns 422 with invalid params" do
      seller = insert(:user)
      token = Api.Auth.generate_internal_token(seller)

      conn =
        conn(:post, "/items", %{"title" => "Bad"})
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 422
    end
  end

  describe "PATCH /items/:id" do
    test "updates an existing item" do
      item = insert(:item, title: "Old Title")

      conn =
        conn(:patch, "/items/#{item.id}", %{title: "New Title"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["title"] == "New Title"
    end

    test "returns 404 for nonexistent item" do
      conn =
        conn(:patch, "/items/999999", %{title: "Nope"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "DELETE /items/:id" do
    test "deletes an existing item" do
      item = insert(:item)
      conn = conn(:delete, "/items/#{item.id}") |> Api.Router.call([])
      assert conn.status == 204
    end

    test "returns 404 for nonexistent item" do
      conn = conn(:delete, "/items/999999") |> Api.Router.call([])
      assert conn.status == 404
    end
  end

  describe "POST /items/:id/photos" do
    test "generates upload URL and creates photo" do
      item = insert(:item)

      conn =
        conn(:post, "/items/#{item.id}/photos", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["upload_url"] =~ "X-Amz-"
      assert body["photo"]["url"] =~ "https://babyclothes-uploads.s3.amazonaws.com/items/#{item.id}/"
      assert body["photo"]["id"] != nil
      assert body["photo"]["position"] == 0
    end

    test "returns 422 for nonexistent item" do
      conn =
        conn(:post, "/items/999999/photos", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
    end
  end

  describe "GET /items/:id/photos" do
    test "returns photos for an item" do
      item = insert(:item)
      _photo = insert(:photo, item: item, url: "photo.jpg", position: 0)

      conn = conn(:get, "/items/#{item.id}/photos") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["photos"]) == 1
    end
  end
end
