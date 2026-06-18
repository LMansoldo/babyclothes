defmodule Api.Plugs.JSON do
  @moduledoc """
  Plug to ensure JSON responses have the correct content-type header.
  Provides helper functions for sending JSON responses.
  """

  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    put_resp_content_type(conn, "application/json")
  end

  @doc """
  Send a JSON response with the given status and data.
  """
  def send_json(conn, status, data) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Jason.encode!(data))
  end

  @doc """
  Send a JSON error response.
  """
  def send_error(conn, status, message) do
    send_json(conn, status, %{error: message})
  end
end
