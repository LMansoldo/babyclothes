defmodule Api.Controllers.AuthControllerTest do
  use Api.ConnCase, async: true

  describe "POST /auth/google" do
    test "returns 400 when token is missing" do
      conn =
        conn(:post, "/auth/google", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_token"
    end

    test "returns 400 when body is empty" do
      conn =
        conn(:post, "/auth/google", "")
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
    end

    test "returns 401 for invalid Google token" do
      conn =
        conn(:post, "/auth/google", %{"token" => "invalid.google.token"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] in ["invalid_google_token", "authentication_failed"]
    end
  end

  describe "POST /auth/refresh" do
    test "issues a new token pair for a valid refresh token" do
      user = insert(:user)
      refresh = Api.Auth.generate_refresh_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => refresh})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["id"] == user.id
    end

    test "rejects an access token used as refresh" do
      user = insert(:user)
      access = Api.Auth.generate_access_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => access})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end

    test "rejects a missing refresh token" do
      conn =
        conn(:post, "/auth/refresh", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end
  end

  describe "POST /auth/logout" do
    test "returns 200" do
      conn =
        conn(:post, "/auth/logout", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      assert Jason.decode!(conn.resp_body)["ok"] == true
    end
  end
end
