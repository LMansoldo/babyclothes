defmodule Api.Controllers.AuthControllerTest do
  use Api.ConnCase, async: true

  @valid_signup_attrs %{
    "email" => "signup@example.com",
    "name" => "Signup User",
    "password" => "securepassword123",
    "cpf" => "52998224725",
    "phone" => "11999998888",
    "nationality" => "Brasileira",
    "cep" => "01310100",
    "address_line" => "Av. Paulista, 1000",
    "city" => "Sao Paulo",
    "state" => "SP"
  }

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

  describe "POST /auth/signup" do
    test "creates a new user and returns 201 with tokens" do
      conn =
        conn(:post, "/auth/signup", @valid_signup_attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["email"] == "signup@example.com"
      assert body["user"]["name"] == "Signup User"
      assert body["user"]["type"] == "pf"
      assert body["user"]["cpf"] == "52998224725"
      refute Map.has_key?(body["user"], "password_hash")
    end

    test "creates a user with profile fields" do
      attrs =
        Map.merge(@valid_signup_attrs, %{
          "phone" => "11999998888",
          "nationality" => "Brasileira",
          "cep" => "01310100",
          "address_line" => "Av. Paulista, 1000",
          "city" => "Sao Paulo",
          "state" => "SP"
        })

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 201
      body = Jason.decode!(conn.resp_body)
      assert body["user"]["phone"] == "11999998888"
      assert body["user"]["state"] == "SP"
      assert body["user"]["city"] == "Sao Paulo"
    end

    test "returns 422 for missing required fields" do
      conn =
        conn(:post, "/auth/signup", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "email")
      assert Map.has_key?(body["details"], "name")
      assert Map.has_key?(body["details"], "password")
      assert Map.has_key?(body["details"], "cpf")
    end

    test "returns 422 when profile fields are missing" do
      attrs = Map.drop(@valid_signup_attrs, ~w(phone nationality cep address_line city state))

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"

      for field <- ~w(phone nationality cep address_line city state) do
        assert Map.has_key?(body["details"], field)
      end
    end

    test "returns 422 for invalid CPF" do
      attrs = Map.put(@valid_signup_attrs, "cpf", "12345678900")

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "cpf")
    end

    test "returns 422 for invalid email format" do
      attrs = Map.put(@valid_signup_attrs, "email", "invalid-email")

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "email")
    end

    test "returns 422 for short password" do
      attrs = Map.put(@valid_signup_attrs, "password", "short")

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "password")
    end

    test "returns 422 for duplicate email" do
      insert(:user, email: "signup@example.com")

      conn =
        conn(:post, "/auth/signup", @valid_signup_attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "email")
    end

    test "returns 422 for duplicate CPF" do
      insert(:user, cpf: "52998224725")

      conn =
        conn(:post, "/auth/signup", @valid_signup_attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "cpf")
    end

    test "returns 422 for invalid profile fields" do
      attrs = Map.put(@valid_signup_attrs, "state", "XX")

      conn =
        conn(:post, "/auth/signup", attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 422
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "validation_failed"
      assert Map.has_key?(body["details"], "state")
    end

    test "signup token is accepted by /auth/session" do
      signup_conn =
        conn(:post, "/auth/signup", @valid_signup_attrs)
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      token = Jason.decode!(signup_conn.resp_body)["token"]

      session_conn =
        conn(:get, "/auth/session")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert session_conn.status == 200
      body = Jason.decode!(session_conn.resp_body)
      assert body["user"]["email"] == "signup@example.com"
    end
  end

  describe "POST /auth/login" do
    setup do
      {:ok, _user} = Api.Users.signup(@valid_signup_attrs)
      :ok
    end

    test "returns 200 with tokens for valid credentials" do
      conn =
        conn(:post, "/auth/login", %{"email" => "signup@example.com", "password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert is_binary(body["token"])
      assert is_binary(body["refresh_token"])
      assert body["user"]["email"] == "signup@example.com"
      assert body["user"]["type"] == "pf"
      refute Map.has_key?(body["user"], "password_hash")
    end

    test "returns user profile fields on login" do
      attrs =
        Map.merge(@valid_signup_attrs, %{
          "email" => "profile@example.com",
          "cpf" => "11144477735",
          "phone" => "11999998888",
          "state" => "SP"
        })

      {:ok, _user} = Api.Users.signup(attrs)

      conn =
        conn(:post, "/auth/login", %{"email" => "profile@example.com", "password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["user"]["phone"] == "11999998888"
      assert body["user"]["state"] == "SP"
    end

    test "returns 401 for invalid password" do
      conn =
        conn(:post, "/auth/login", %{"email" => "signup@example.com", "password" => "wrongpassword"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "invalid_credentials"
    end

    test "returns 401 for unknown email" do
      conn =
        conn(:post, "/auth/login", %{"email" => "unknown@example.com", "password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "invalid_credentials"
    end

    test "returns 400 for missing email" do
      conn =
        conn(:post, "/auth/login", %{"password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_email_or_password"
    end

    test "returns 400 for missing password" do
      conn =
        conn(:post, "/auth/login", %{"email" => "signup@example.com"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_email_or_password"
    end

    test "returns 400 for empty body" do
      conn =
        conn(:post, "/auth/login", %{})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert conn.status == 400
      body = Jason.decode!(conn.resp_body)
      assert body["error"] == "missing_email_or_password"
    end

    test "login token is accepted by /auth/session" do
      login_conn =
        conn(:post, "/auth/login", %{"email" => "signup@example.com", "password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      token = Jason.decode!(login_conn.resp_body)["token"]

      session_conn =
        conn(:get, "/auth/session")
        |> put_req_header("authorization", "Bearer #{token}")
        |> Api.Router.call([])

      assert session_conn.status == 200
      body = Jason.decode!(session_conn.resp_body)
      assert body["user"]["email"] == "signup@example.com"
    end

    test "refresh token from login works" do
      login_conn =
        conn(:post, "/auth/login", %{"email" => "signup@example.com", "password" => "securepassword123"})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      refresh_token = Jason.decode!(login_conn.resp_body)["refresh_token"]

      refresh_conn =
        conn(:post, "/auth/refresh", %{"refresh_token" => refresh_token})
        |> put_req_header("content-type", "application/json")
        |> Api.Router.call([])

      assert refresh_conn.status == 200
      body = Jason.decode!(refresh_conn.resp_body)
      assert is_binary(body["token"])
      assert body["user"]["email"] == "signup@example.com"
    end
  end
end
