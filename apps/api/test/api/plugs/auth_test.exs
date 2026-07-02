defmodule Api.Plugs.AuthTest do
  use Api.ConnCase, async: true

  alias Api.Plugs.Auth

  test "assigns current_user_id as integer for a valid access token" do
    user = insert(:user)
    token = Api.Auth.generate_access_token(user)

    conn =
      conn(:get, "/")
      |> put_req_header("authorization", "Bearer #{token}")
      |> Auth.call([])

    refute conn.halted
    assert conn.assigns.current_user_id == user.id
    assert is_integer(conn.assigns.current_user_id)
  end

  test "halts with 401 when authorization header is missing" do
    conn = conn(:get, "/") |> Auth.call([])

    assert conn.halted
    assert conn.status == 401
  end

  test "halts with 401 for an expired token" do
    user = insert(:user)
    secret = Application.get_env(:api, :internal_jwt_secret)
    jwk = JOSE.JWK.from_oct(secret)
    past = System.system_time(:second) - 10

    claims = %{"sub" => to_string(user.id), "typ" => "access", "iat" => past - 3600, "exp" => past}
    jwt = JOSE.JWT.from_map(claims)
    jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
    token = JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)

    conn =
      conn(:get, "/")
      |> put_req_header("authorization", "Bearer #{token}")
      |> Auth.call([])

    assert conn.halted
    assert conn.status == 401
  end
end
