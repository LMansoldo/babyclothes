defmodule Api.SmokeTest do
  @moduledoc """
  End-to-end smoke test that validates the full user journey across all public API endpoints.

  Run with: `mix test --only smoke`

  Does NOT test: agent chat (SSE), growth worker (needs agents),
  SSE notifications (long-lived), S3 storage.
  """
  use Api.ConnCase, async: false

  @moduletag :smoke

  describe "Full user journey" do
    test "health check" do
      conn = conn(:get, "/health") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["status"] == "ok"
    end

    test "complete user flow" do
      # Step 1: Health check
      conn = conn(:get, "/health") |> Api.Router.call([])
      assert conn.status == 200

      # Step 2: Create user (via factory) and generate token
      user = insert(:user, name: "Maria", email: "smoke-#{System.unique_integer([:positive])}@example.com")
      token = Api.Auth.generate_internal_token(user)

      # Step 3: Create child
      conn =
        conn(:post, "/children", %{
          "name" => "Sofia",
          "birth_date" => "2023-01-15",
          "birth_weight_g" => 3200,
          "birth_height_cm" => 50
        })
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 201
      child_id = Jason.decode!(conn.resp_body)["child"]["id"]

      # Step 4: Add measurement
      conn =
        conn(:post, "/children/#{child_id}/measurements", %{
          "weight_g" => 5000,
          "height_cm" => 60,
          "clothing_size" => "P",
          "recorded_at" => DateTime.to_iso8601(DateTime.utc_now())
        })
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 201

      # Step 5: Create item (requires auth — seller_id extracted from token)
      conn =
        conn(:post, "/items", %{
          "title" => "Body Rosa",
          "category" => "body",
          "gender" => "female",
          "clothing_size" => "M",
          "condition" => "like_new",
          "price_cents" => 3500
        })
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 201
      item_id = Jason.decode!(conn.resp_body)["id"]

      # Step 6: GET /catalog
      conn = conn(:get, "/catalog") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["items"]) >= 1

      # Step 7: GET /catalog?category=body
      conn = conn(:get, "/catalog?category=body") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert Enum.all?(body["items"], fn i -> i["category"] == "body" end)

      # Step 8: GET /users/:user_id/notifications
      conn =
        conn(:get, "/users/#{user.id}/notifications")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 200

      # Step 9: GET /feature-flags
      conn = conn(:get, "/feature-flags") |> Api.Router.call([])
      assert conn.status == 200

      # Step 10: POST /internal/notifications (with internal key)
      conn =
        conn(:post, "/internal/notifications", %{
          "user_id" => user.id,
          "type" => "growth_prediction",
          "title" => "Sofia vai precisar de M!",
          "body" => "Test notification"
        })
        |> put_req_header("content-type", "application/json")
        |> put_req_header("x-internal-key", "dev-internal-key")
        |> Api.Router.call([])

      assert conn.status == 201
      notification_id = Jason.decode!(conn.resp_body)["id"]

      # Step 11: PATCH /notifications/:id/read
      conn =
        conn(:patch, "/notifications/#{notification_id}/read")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 200

      # Step 12: DELETE /items/:id
      conn =
        conn(:delete, "/items/#{item_id}")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert conn.status == 204
    end
  end
end
