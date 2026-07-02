defmodule Api.Controllers.SseControllerTest do
  use Api.ConnCase, async: true

  @moduledoc """
  Tests for SSE notification endpoint auth layer.

  Note: The actual SSE streaming test (send_chunked) is excluded because
  the Plug.Test adapter does not support chunked transfer encoding.
  SSE streaming is validated via smoke test and manual testing.
  """

  describe "GET /sse/notifications" do
    test "returns 401 when authorization header is missing" do
      conn =
        conn(:get, "/sse/notifications")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_authorization"
    end

    test "returns 401 when token is invalid" do
      conn =
        conn(:get, "/sse/notifications")
        |> put_req_header("authorization", "Bearer invalid-token")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "invalid_token"
    end
  end
end
