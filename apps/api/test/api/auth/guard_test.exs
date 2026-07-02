defmodule Api.Auth.GuardTest do
  use Api.ConnCase, async: true

  alias Api.Auth.Guard

  test "returns conn unchanged when current_user owns the resource" do
    conn = conn(:get, "/") |> Plug.Conn.assign(:current_user_id, 42)
    result = Guard.require_owner(conn, 42)

    refute result.halted
  end

  test "halts with 403 when current_user does not own the resource" do
    conn = conn(:get, "/") |> Plug.Conn.assign(:current_user_id, 42)
    result = Guard.require_owner(conn, 99)

    assert result.halted
    assert result.status == 403
    assert Jason.decode!(result.resp_body)["error"] == "forbidden"
  end
end
