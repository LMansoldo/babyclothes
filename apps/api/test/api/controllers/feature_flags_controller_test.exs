defmodule Api.Controllers.FeatureFlagsControllerTest do
  use Api.ConnCase, async: true

  describe "GET /feature-flags" do
    test "returns empty list when no flags" do
      conn = conn(:get, "/feature-flags") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["flags"] == []
    end

    test "returns all flags" do
      insert(:feature_flag, key: "flag_a", enabled: true, description: "Flag A")
      insert(:feature_flag, key: "flag_b", enabled: false)

      conn = conn(:get, "/feature-flags") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert length(body["flags"]) == 2
    end
  end

  describe "GET /feature-flags/:key" do
    test "returns flag when found" do
      insert(:feature_flag, key: "test_key", enabled: true, description: "Test")

      conn = conn(:get, "/feature-flags/test_key") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["key"] == "test_key"
      assert body["enabled"] == true
    end

    test "returns 404 when not found" do
      conn = conn(:get, "/feature-flags/nonexistent") |> Api.Router.call([])
      assert conn.status == 404
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "flag_not_found"
    end
  end

  describe "POST /feature-flags" do
    test "creates a flag with valid params" do
      conn =
        conn(:post, "/feature-flags", %{key: "new_flag", enabled: true, description: "New"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["key"] == "new_flag"
      assert body["enabled"] == true
    end

    test "returns 422 with invalid params" do
      conn =
        conn(:post, "/feature-flags", %{enabled: true})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["errors"]["key"]
    end
  end

  describe "PATCH /feature-flags/:key" do
    test "updates an existing flag" do
      insert(:feature_flag, key: "update_me", enabled: false, description: "Old")

      conn =
        conn(:patch, "/feature-flags/update_me", %{enabled: true, description: "New"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["enabled"] == true
      assert body["description"] == "New"
    end

    test "returns 404 for nonexistent flag" do
      conn =
        conn(:patch, "/feature-flags/nope", %{enabled: true})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "POST /feature-flags/:key/toggle" do
    test "toggles flag from false to true" do
      insert(:feature_flag, key: "toggle_me", enabled: false)

      conn = conn(:post, "/feature-flags/toggle_me/toggle") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["enabled"] == true
    end

    test "returns 404 for nonexistent flag" do
      conn = conn(:post, "/feature-flags/nope/toggle") |> Api.Router.call([])
      assert conn.status == 404
    end
  end

  describe "DELETE /feature-flags/:key" do
    test "deletes an existing flag" do
      insert(:feature_flag, key: "delete_me")

      conn = conn(:delete, "/feature-flags/delete_me") |> Api.Router.call([])
      assert conn.status == 204
    end

    test "returns 404 for nonexistent flag" do
      conn = conn(:delete, "/feature-flags/nope") |> Api.Router.call([])
      assert conn.status == 404
    end
  end
end
