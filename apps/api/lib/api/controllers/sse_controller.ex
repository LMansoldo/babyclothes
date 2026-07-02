defmodule Api.Controllers.SseController do
  @moduledoc "SSE endpoint for real-time notification streaming."
  import Plug.Conn
  alias Api.Auth

  def stream(conn) do
    with {:ok, token} <- extract_bearer_token(conn),
         {:ok, claims} <- Auth.verify_internal_token(token) do
      user_id = claims["sub"]
      topic = "notifications:#{user_id}"
      Phoenix.PubSub.subscribe(Api.PubSub, topic)

      conn =
        conn
        |> put_resp_content_type("text/event-stream")
        |> put_resp_header("cache-control", "no-cache")
        |> put_resp_header("connection", "keep-alive")
        |> put_resp_header("x-accel-buffering", "no")

      case send_chunked(conn, 200) do
        {:ok, conn} -> sse_loop(conn)
        {:error, _} -> conn
      end
    else
      {:error, :missing_authorization} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "missing_authorization"}))

      {:error, :invalid_token} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "invalid_token"}))
    end
  end

  defp sse_loop(conn) do
    receive do
      {:new_notification, notification} ->
        data = Jason.encode!(%{
          id: notification.id,
          type: to_string(notification.type),
          title: notification.title,
          body: notification.body,
          metadata: notification.metadata,
          read_at: notification.read_at,
          user_id: notification.user_id,
          inserted_at: notification.inserted_at
        })
        event = "event: notification\ndata: #{data}\n\n"
        case chunk(conn, event) do
          {:ok, conn} -> sse_loop(conn)
          {:error, :closed} -> conn
        end
    after
      30_000 ->
        case chunk(conn, ": heartbeat\n\n") do
          {:ok, conn} -> sse_loop(conn)
          {:error, :closed} -> conn
        end
    end
  end

  defp extract_bearer_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] when token != "" -> {:ok, token}
      _ -> {:error, :missing_authorization}
    end
  end
end
