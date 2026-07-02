defmodule Api.Controllers.InternalControllerTest do
  use Api.ConnCase, async: true

  @internal_key "dev-internal-key"

  describe "POST /internal/notifications" do
    test "creates notification with valid key" do
      user = insert(:user)

      body = %{
        "user_id" => user.id,
        "type" => "growth_prediction",
        "title" => "Sofia vai precisar de M!",
        "body" => "Em 30 dias, Sofia vai precisar de tamanho M (confianca: 85%)",
        "metadata" => %{
          "child_id" => 1,
          "predicted_size" => "M",
          "confidence" => 85,
          "days_until_next_size" => 30
        }
      }

      conn =
        conn(:post, "/internal/notifications", body)
        |> put_req_header("content-type", "application/json")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["id"] != nil
    end

    test "returns 403 without internal key" do
      user = insert(:user)

      body = %{
        "user_id" => user.id,
        "type" => "growth_prediction",
        "title" => "Test",
        "body" => "Test body"
      }

      conn =
        conn(:post, "/internal/notifications", body)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "returns 422 with invalid body" do
      conn =
        conn(:post, "/internal/notifications", %{})
        |> put_req_header("content-type", "application/json")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 422
    end
  end

  describe "GET /internal/children/:id/context" do
    test "returns child context with valid key" do
      user = insert(:user, name: "Maria")
      child = insert(:child, user: user, name: "Sofia")

      conn =
        conn(:get, "/internal/children/#{child.id}/context")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["child"]["name"] == "Sofia"
      assert body["user"]["name"] == "Maria"
      assert is_list(body["measurements"])
    end

    test "returns 404 for nonexistent child" do
      conn =
        conn(:get, "/internal/children/999999/context")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 404
    end

    test "returns 403 without internal key" do
      conn =
        conn(:get, "/internal/children/1/context")
        |> Api.Router.call([])

      assert conn.status == 403
    end
  end

  describe "GET /internal/items/search" do
    test "returns items with valid key" do
      _item = insert(:item, title: "Test Item")

      conn =
        conn(:get, "/internal/items/search")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["items"]) >= 1
    end

    test "filters by category" do
      _body_item = insert(:item, category: "body")
      _macacao = insert(:item, category: "macacao")

      conn =
        conn(:get, "/internal/items/search?category=body")
        |> put_req_header("x-internal-key", @internal_key)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert Enum.all?(body["items"], fn i -> i["category"] == "body" end)
    end

    test "returns 403 without internal key" do
      conn =
        conn(:get, "/internal/items/search")
        |> Api.Router.call([])

      assert conn.status == 403
    end
  end
end
