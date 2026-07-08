defmodule Api.Controllers.AgentController do
  @moduledoc """
  Proxy controller for AI agent chat.
  Forwards requests to the agents HTTP service and streams SSE back in real-time.
  """

  import Plug.Conn

  @doc """
  POST /agent/chat
  Validates the request, then proxies it to the agents service via SSE streaming.
  """
  def chat(conn) do
    with {:ok, _message} <- extract_message(conn),
         {:ok, token} <- extract_bearer_token(conn) do
      stream_to_agents(conn, token)
    else
      {:error, :missing_message} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Jason.encode!(%{error: "missing_message"}))

      {:error, :empty_message} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Jason.encode!(%{error: "empty_message"}))

      {:error, :missing_authorization} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "missing_authorization"}))
    end
  end

  @doc """
  Builds the JSON payload forwarded to the agents service.

  Only whitelisted keys are forwarded: message, child_id, context.
  """
  @spec agents_payload(map()) :: String.t()
  def agents_payload(body_params) do
    body_params
    |> Map.take(["message", "child_id", "context"])
    |> Jason.encode!()
  end

  defp extract_message(conn) do
    case conn.body_params do
      %{"message" => msg} when is_binary(msg) and msg != "" ->
        {:ok, msg}

      %{"message" => ""} ->
        {:error, :empty_message}

      _ ->
        {:error, :missing_message}
    end
  end

  defp extract_bearer_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] when token != "" ->
        {:ok, token}

      _ ->
        {:error, :missing_authorization}
    end
  end

  defp stream_to_agents(conn, token) do
    agents_endpoint = "#{agents_url()}/chat"

    body = agents_payload(conn.body_params)

    headers = [
      {"Content-Type", "application/json"},
      {"Authorization", "Bearer #{token}"}
    ]

    request = Finch.build(:post, agents_endpoint, headers, body)

    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("connection", "keep-alive")

    case send_chunked(conn, 200) do
      {:ok, conn} ->
        stream_with_finch(conn, request)

      {:error, reason} ->
        # If we can't open the chunked response, send a JSON error
        # (conn is already sent at this point, so this is a best-effort fallback)
        _ = reason
        conn
    end
  end

  defp stream_with_finch(conn, request) do
    result =
      Finch.stream(request, Api.Finch, conn, fn
        {:status, _status}, conn ->
          conn

        {:headers, _headers}, conn ->
          conn

        {:data, chunk}, conn ->
          case chunk(conn, chunk) do
            {:ok, conn} -> conn
            {:error, :closed} -> conn
          end
      end)

    case result do
      {:ok, conn} ->
        conn

      {:error, reason, conn} ->
        error_event = "data: {\"error\": \"agents_unavailable\"}\n\n"

        case chunk(conn, error_event) do
          {:ok, conn} -> conn
          {:error, :closed} -> conn
        end

        _ = reason
        conn
    end
  end

  defp agents_url do
    Application.get_env(:api, :agents_http_url, "http://localhost:50052")
  end
end
