defmodule Api.Controllers.AgentController do
  @moduledoc """
  Proxy controller for AI agent chat.
  Forwards requests to the agents HTTP service and streams SSE back.
  """

  import Plug.Conn

  defp agents_url do
    Application.get_env(:api, :agents_http_url, "http://localhost:50052")
  end

  @doc """
  POST /agent/chat
  Proxies chat request to agents service and returns SSE stream.
  """
  def chat(conn) do
    body = conn.body_params
    agents_endpoint = "#{agents_url()}/chat"

    request =
      Finch.build(:post, agents_endpoint, [{"Content-Type", "application/json"}], Jason.encode!(body))

    case Finch.request(request, Api.Finch) do
      {:ok, %{status: 200, body: sse_body}} ->
        conn
        |> put_resp_content_type("text/event-stream")
        |> put_resp_header("cache-control", "no-cache")
        |> put_resp_header("connection", "keep-alive")
        |> send_resp(200, sse_body)

      {:ok, %{status: status, body: error_body}} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(status, error_body)

      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(502, Jason.encode!(%{error: "agents_unavailable", detail: inspect(reason)}))
    end
  end
end
