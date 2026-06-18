defmodule Api.ConnCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting up a connection.

  Such tests rely on `Phoenix.ConnTest` and also
  import other functionality to make it easier
  to build common data structures and query the data layer.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Plug.Conn
      import Plug.Test
      import Api.ConnCase
      import Api.Factory

      alias Api.Repo
    end
  end

  setup tags do
    Api.DataCase.setup_sandbox(tags)
    {:ok, conn: Plug.Test.conn(:get, "/")}
  end

  @doc """
  Helper to decode JSON response body and assert status.
  """
  def json_response(conn, status) do
    assert conn.status == status
    Jason.decode!(conn.resp_body)
  end

  @doc """
  Helper to put auth header with JWT token.
  """
  def put_auth_header(conn, token) do
    Plug.Conn.put_req_header(conn, "authorization", "Bearer #{token}")
  end
end
