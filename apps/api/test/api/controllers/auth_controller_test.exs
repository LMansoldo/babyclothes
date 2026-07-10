defmodule Api.Controllers.AuthControllerTest do
  use Api.ConnCase, async: true

  describe "POST /auth/google" do
    test "returns 400 when token is missing" do
      conn =
        conn(:post, "/auth/google", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_token"
    end

    test "returns 400 when body is empty" do
      conn =
        conn(:post, "/auth/google", "")
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
    end

    test "returns 401 for invalid Google token" do
      conn =
        conn(:post, "/auth/google", %{"token" => "invalid.google.token"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] in ["invalid_google_token", "authentication_failed"]
    end
  end

  describe "POST /auth/refresh" do
    test "issues a new token pair for a valid refresh token" do
      user = insert(:user)
      refresh = Api.Auth.generate_refresh_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => refresh})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["id"] == user.id
    end

    test "rejects an access token used as refresh" do
      user = insert(:user)
      access = Api.Auth.generate_access_token(user)

      conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => access})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end

    test "rejects a missing refresh token" do
      conn =
        conn(:post, "/auth/refresh", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end
  end

  describe "POST /auth/logout" do
    test "returns 200" do
      conn =
        conn(:post, "/auth/logout", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      assert Jason.decode!(conn.resp_body)["ok"] == true
    end
  end

  describe "POST /auth/dev-login" do
    test "returns tokens and creates the dev user on first login" do
      conn =
        conn(:post, "/auth/dev-login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["email"] == "dev@babyclothes.app"
      assert body["user"]["is_seller"] == true
    end

    test "reuses the same dev user on subsequent logins" do
      first =
        conn(:post, "/auth/dev-login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      second =
        conn(:post, "/auth/dev-login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      first_id = Jason.decode!(first.resp_body)["user"]["id"]
      second_id = Jason.decode!(second.resp_body)["user"]["id"]
      assert first_id == second_id
    end

    test "access token from dev-login is accepted by /auth/session" do
      login =
        conn(:post, "/auth/dev-login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      token = Jason.decode!(login.resp_body)["token"]

      session =
        conn(:get, "/auth/session")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert session.status == 200
      assert Jason.decode!(session.resp_body)["user"]["email"] == "dev@babyclothes.app"
    end

    test "returns 404 when dev login is disabled" do
      Application.put_env(:api, :dev_login_enabled, false)
      on_exit(fn -> Application.put_env(:api, :dev_login_enabled, true) end)

      conn =
        conn(:post, "/auth/dev-login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 404
    end
  end

  describe "POST /auth/register" do
    defp insert_unregistered_user do
      {:ok, user} =
        %Api.Users.User{type: nil}
        |> Api.Users.User.changeset(%{
          "email" => "pending@example.com",
          "name" => "Pending",
          "google_id" => "google-pending"
        })
        |> Api.Repo.insert()

      user
    end

    defp register_conn(token, body) do
      conn(:post, "/auth/register", body)
      |> put_req_header("content-type", "application/json")
      |> put_req_header("authorization", "Bearer #{token}")
      |> Api.Router.call([])
    end

    test "registers a PF user and returns the updated user" do
      user = insert_unregistered_user()
      token = Api.Auth.generate_access_token(user)

      conn = register_conn(token, %{"type" => "pf", "cpf" => "52998224725"})

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["user"]["type"] == "pf"
      assert body["user"]["cpf"] == "52998224725"
    end

    test "returns 409 when the user is already registered" do
      user = insert(:user, type: "pf", cpf: "11144477735")
      token = Api.Auth.generate_access_token(user)

      conn = register_conn(token, %{"type" => "pj", "cnpj" => "11222333000181"})

      assert conn.status == 409
      assert Jason.decode!(conn.resp_body)["error"] == "already_registered"
    end

    test "returns 422 for an invalid document" do
      user = insert_unregistered_user()
      token = Api.Auth.generate_access_token(user)

      conn = register_conn(token, %{"type" => "pf", "cpf" => "12345678900"})

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "cpf")
    end

    test "returns 401 without a valid token" do
      conn =
        conn(:post, "/auth/register", %{"type" => "pf", "cpf" => "52998224725"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
    end
  end
end
