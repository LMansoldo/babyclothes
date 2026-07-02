defmodule Api.AuthTest do
  use Api.DataCase, async: true

  alias Api.Auth

  describe "generate_access_token/1 + verify_token/2" do
    test "generates an access token with exp and typ=access" do
      user = insert(:user)
      token = Auth.generate_access_token(user)

      assert {:ok, claims} = Auth.verify_token(token, "access")
      assert claims["sub"] == to_string(user.id)
      assert claims["email"] == user.email
      assert claims["typ"] == "access"
      assert is_integer(claims["exp"])
      assert claims["exp"] == claims["iat"] + 3600
    end

    test "rejects an access token when expecting refresh" do
      user = insert(:user)
      token = Auth.generate_access_token(user)

      assert {:error, :wrong_type} = Auth.verify_token(token, "refresh")
    end

    test "rejects a garbage token" do
      assert {:error, :invalid_token} = Auth.verify_token("not.a.jwt", "access")
    end
  end

  describe "generate_refresh_token/1" do
    test "generates a refresh token valid for 30 days" do
      user = insert(:user)
      token = Auth.generate_refresh_token(user)

      assert {:ok, claims} = Auth.verify_token(token, "refresh")
      assert claims["typ"] == "refresh"
      assert claims["exp"] == claims["iat"] + 2_592_000
    end
  end

  describe "verify_token/2 expiration" do
    test "rejects an expired token" do
      user = insert(:user)
      # Craft a token whose exp is already in the past.
      secret = Application.get_env(:api, :internal_jwt_secret)
      jwk = JOSE.JWK.from_oct(secret)
      past = System.system_time(:second) - 10

      claims = %{"sub" => to_string(user.id), "typ" => "access", "iat" => past - 3600, "exp" => past}
      jwt = JOSE.JWT.from_map(claims)
      jws = JOSE.JWS.from_map(%{"alg" => "HS256"})
      token = JOSE.JWT.sign(jwk, jws, jwt) |> JOSE.JWS.compact() |> elem(1)

      assert {:error, :token_expired} = Auth.verify_token(token, "access")
    end
  end

  describe "compat wrappers" do
    test "verify_internal_token accepts a token from generate_internal_token" do
      user = insert(:user)
      token = Auth.generate_internal_token(user)

      assert {:ok, claims} = Auth.verify_internal_token(token)
      assert claims["sub"] == to_string(user.id)
    end
  end
end
