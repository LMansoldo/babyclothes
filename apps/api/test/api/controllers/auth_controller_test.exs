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
end
