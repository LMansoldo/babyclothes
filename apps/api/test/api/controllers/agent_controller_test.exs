defmodule Api.Controllers.AgentControllerTest do
  @moduledoc """
  Tests for agent chat endpoint auth/validation layer.

  Note: The actual SSE streaming test (send_chunked + Finch.stream) is excluded
  because the Plug.Test adapter does not support chunked transfer encoding.
  SSE streaming is validated via smoke test and manual testing.
  """

  use Api.ConnCase, async: true

  describe "POST /agent/chat" do
    test "returns 400 when message is missing" do
      conn =
        conn(:post, "/agent/chat", %{})
        |> put_req_header("content-type", "application/json")
        |> put_auth_header("valid-token")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_message"
    end

    test "returns 400 when message is empty" do
      conn =
        conn(:post, "/agent/chat", %{"message" => ""})
        |> put_req_header("content-type", "application/json")
        |> put_auth_header("valid-token")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "empty_message"
    end

    test "returns 401 when authorization header is missing" do
      conn =
        conn(:post, "/agent/chat", %{"message" => "hello"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_authorization"
    end

    test "returns 401 when authorization header is invalid" do
      conn =
        conn(:post, "/agent/chat", %{"message" => "hello"})
        |> put_req_header("content-type", "application/json")
        |> put_req_header("authorization", "InvalidScheme token")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_authorization"
    end
  end

  describe "agents_payload/1" do
    test "forwards only message, child_id and context" do
      payload =
        Api.Controllers.AgentController.agents_payload(%{
          "message" => "oi",
          "child_id" => "5",
          "context" => %{"name" => "Sofia"},
          "authorization" => "should-be-dropped"
        })

      assert Jason.decode!(payload) == %{
               "message" => "oi",
               "child_id" => "5",
               "context" => %{"name" => "Sofia"}
             }
    end

    test "omits keys that are absent" do
      payload = Api.Controllers.AgentController.agents_payload(%{"message" => "oi"})

      assert Jason.decode!(payload) == %{"message" => "oi"}
    end
  end
end
