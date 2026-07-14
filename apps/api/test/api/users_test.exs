defmodule Api.UsersTest do
  use Api.DataCase, async: true

  alias Api.Users
  alias Api.Users.User

  defp insert_unregistered_user do
    {:ok, user} =
      %User{type: nil}
      |> User.changeset(%{
        "email" => "pending@example.com",
        "name" => "Pending",
        "google_id" => "google-pending"
      })
      |> Repo.insert()

    user
  end

  @valid_signup_attrs %{
    "email" => "newuser@example.com",
    "name" => "New User",
    "password" => "securepassword123",
    "cpf" => "52998224725"
  }

  describe "get_user/1" do
    test "returns the user when it exists" do
      user = insert(:user)
      assert {:ok, %User{}} = Users.get_user(user.id)
    end

    test "returns not_found otherwise" do
      assert {:error, :not_found} = Users.get_user(0)
    end
  end

  describe "register_account/2" do
    test "registers an unregistered user as PF" do
      user = insert_unregistered_user()

      assert {:ok, %User{type: "pf", cpf: "52998224725"}} =
               Users.register_account(user, %{"type" => "pf", "cpf" => "52998224725"})
    end

    test "registers an unregistered user as PJ" do
      user = insert_unregistered_user()

      assert {:ok, %User{type: "pj", cnpj: "11222333000181"}} =
               Users.register_account(user, %{"type" => "pj", "cnpj" => "11222333000181"})
    end

    test "refuses to register twice" do
      user = insert(:user, type: "pf", cpf: "11144477735")

      assert {:error, :already_registered} =
               Users.register_account(user, %{"type" => "pj", "cnpj" => "11222333000181"})
    end

    test "returns the changeset on invalid input" do
      user = insert_unregistered_user()

      assert {:error, %Ecto.Changeset{}} =
               Users.register_account(user, %{"type" => "pf", "cpf" => "12345678900"})
    end
  end

  describe "signup/1" do
    test "creates a new user with valid attributes" do
      assert {:ok, %User{} = user} = Users.signup(@valid_signup_attrs)
      assert user.email == "newuser@example.com"
      assert user.name == "New User"
      assert user.type == "pf"
      assert user.cpf == "52998224725"
      assert user.password_hash != nil
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

      assert {:ok, %User{} = user} = Users.signup(attrs)
      assert user.phone == "11999998888"
      assert user.state == "SP"
    end

    test "returns error changeset for invalid attributes" do
      assert {:error, %Ecto.Changeset{}} = Users.signup(%{})
    end

    test "returns error changeset for invalid CPF" do
      attrs = Map.put(@valid_signup_attrs, "cpf", "12345678900")
      assert {:error, %Ecto.Changeset{}} = Users.signup(attrs)
    end

    test "returns error changeset for duplicate email" do
      insert(:user, email: "newuser@example.com")
      assert {:error, %Ecto.Changeset{}} = Users.signup(@valid_signup_attrs)
    end

    test "returns error changeset for duplicate CPF" do
      insert(:user, cpf: "52998224725")
      assert {:error, %Ecto.Changeset{}} = Users.signup(@valid_signup_attrs)
    end
  end

  describe "authenticate/2" do
    setup do
      {:ok, user} = Users.signup(@valid_signup_attrs)
      %{user: user}
    end

    test "returns user for valid credentials", %{user: user} do
      assert {:ok, %User{} = authenticated} = Users.authenticate("newuser@example.com", "securepassword123")
      assert authenticated.id == user.id
    end

    test "returns error for invalid password" do
      assert {:error, :invalid_credentials} = Users.authenticate("newuser@example.com", "wrongpassword")
    end

    test "returns error for unknown email" do
      assert {:error, :invalid_credentials} = Users.authenticate("unknown@example.com", "securepassword123")
    end

    test "returns error for nil password" do
      assert {:error, :invalid_credentials} = Users.authenticate("newuser@example.com", nil)
    end
  end
end
