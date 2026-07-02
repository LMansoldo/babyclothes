defmodule Api.Controllers.ChildrenControllerTest do
  use Api.ConnCase, async: true

  defp auth(conn, user), do: put_req_header(conn, "authorization", "Bearer #{Api.Auth.generate_access_token(user)}")

  describe "GET /users/:user_id/children" do
    test "returns children for a user" do
      user = insert(:user)
      _child1 = insert(:child, user: user, name: "Ana")
      _child2 = insert(:child, user: user, name: "Bruno")

      conn =
        conn(:get, "/users/#{user.id}/children")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["children"]) == 2
    end

    test "returns empty list when no children" do
      user = insert(:user)

      conn =
        conn(:get, "/users/#{user.id}/children")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["children"] == []
    end
  end

  describe "GET /children/:id" do
    test "returns child with measurements" do
      child = insert(:child, name: "Sofia")
      _measurement = insert(:measurement, child: child, weight_g: 5000)

      conn = conn(:get, "/children/#{child.id}") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["child"]["name"] == "Sofia"
      assert length(body["child"]["measurements"]) == 1
    end

    test "returns 404 for non-existent child" do
      conn = conn(:get, "/children/999999") |> Api.Router.call([])
      assert conn.status == 404
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "not found"
    end
  end

  describe "POST /children" do
    test "creates child with valid params" do
      user = insert(:user)
      body_params = %{"name" => "Pedro", "birth_date" => "2023-05-20", "user_id" => user.id}

      conn =
        conn(:post, "/children", body_params)
        |> put_req_header("content-type", "application/json")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["child"]["name"] == "Pedro"
    end

    test "returns 422 with missing fields" do
      user = insert(:user)

      conn =
        conn(:post, "/children", %{})
        |> put_req_header("content-type", "application/json")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["errors"]["name"]
      assert body["errors"]["birth_date"]
    end
  end

  describe "PATCH /children/:id" do
    test "updates child attributes" do
      owner = insert(:user)
      child = insert(:child, user: owner, name: "Old Name")

      conn =
        conn(:patch, "/children/#{child.id}", %{"name" => "New Name"})
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["child"]["name"] == "New Name"
    end

    test "returns 404 for non-existent child" do
      user = insert(:user)

      conn =
        conn(:patch, "/children/999999", %{"name" => "Nope"})
        |> put_req_header("content-type", "application/json")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "DELETE /children/:id" do
    test "deletes an existing child" do
      owner = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:delete, "/children/#{child.id}")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 204
    end

    test "returns 404 for non-existent child" do
      user = insert(:user)

      conn =
        conn(:delete, "/children/999999")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "GET /children/:child_id/measurements" do
    test "returns measurements for a child" do
      child = insert(:child)
      _m1 = insert(:measurement, child: child, weight_g: 4000, recorded_at: ~U[2023-06-01 00:00:00Z])
      _m2 = insert(:measurement, child: child, weight_g: 6000, recorded_at: ~U[2023-09-01 00:00:00Z])

      conn = conn(:get, "/children/#{child.id}/measurements") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["measurements"]) == 2
    end
  end

  describe "POST /children/:child_id/measurements" do
    test "creates measurement with valid params" do
      owner = insert(:user)
      child = insert(:child, user: owner)
      body_params = %{"recorded_at" => "2023-09-15T00:00:00Z", "weight_g" => 5500, "height_cm" => 62, "clothing_size" => "P"}

      conn =
        conn(:post, "/children/#{child.id}/measurements", body_params)
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["measurement"]["weight_g"] == 5500
      assert body["measurement"]["child_id"] == child.id
    end

    test "returns 422 with missing fields" do
      owner = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:post, "/children/#{child.id}/measurements", %{})
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["errors"]["recorded_at"]
    end
  end

  describe "PATCH /measurements/:id" do
    test "updates measurement" do
      owner = insert(:user)
      child = insert(:child, user: owner)
      measurement = insert(:measurement, child: child, weight_g: 5000)

      conn =
        conn(:patch, "/measurements/#{measurement.id}", %{"weight_g" => 6000})
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["measurement"]["weight_g"] == 6000
    end

    test "returns 404 for non-existent measurement" do
      user = insert(:user)

      conn =
        conn(:patch, "/measurements/999999", %{"weight_g" => 1000})
        |> put_req_header("content-type", "application/json")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "DELETE /measurements/:id" do
    test "deletes an existing measurement" do
      owner = insert(:user)
      child = insert(:child, user: owner)
      measurement = insert(:measurement, child: child)

      conn =
        conn(:delete, "/measurements/#{measurement.id}")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 204
    end

    test "returns 404 for non-existent measurement" do
      user = insert(:user)

      conn =
        conn(:delete, "/measurements/999999")
        |> auth(user)
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "authorization" do
    test "POST /children requires auth" do
      user = insert(:user)

      conn =
        conn(:post, "/children", %{"name" => "Pedro", "birth_date" => "2023-05-20", "user_id" => user.id})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end

    test "POST /children uses token user id, ignoring body user_id" do
      owner = insert(:user)
      other = insert(:user)

      conn =
        conn(:post, "/children", %{"name" => "Pedro", "birth_date" => "2023-05-20", "user_id" => other.id})
        |> put_req_header("content-type", "application/json")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 201
      assert Jason.decode!(conn.resp_body)["child"]["user_id"] == owner.id
    end

    test "DELETE /children/:id forbids non-owner" do
      owner = insert(:user)
      other = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:delete, "/children/#{child.id}")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end

    test "DELETE /children/:id allows owner" do
      owner = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:delete, "/children/#{child.id}")
        |> auth(owner)
        |> Api.Router.call([])

      assert conn.status == 204
    end

    test "POST /children/:child_id/measurements forbids non-owner" do
      owner = insert(:user)
      other = insert(:user)
      child = insert(:child, user: owner)

      conn =
        conn(:post, "/children/#{child.id}/measurements", %{
          "weight_g" => 5000, "height_cm" => 60, "clothing_size" => "P",
          "recorded_at" => DateTime.to_iso8601(DateTime.utc_now())
        })
        |> put_req_header("content-type", "application/json")
        |> auth(other)
        |> Api.Router.call([])

      assert conn.status == 403
    end
  end
end
