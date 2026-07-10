defmodule Api.UsersTest do
  use Api.DataCase, async: true

  alias Api.Users
  alias Api.Users.User

  defp insert_unregistered_user do
    {:ok, user} =
      %User{}
      |> User.changeset(%{
        "email" => "pending@example.com",
        "name" => "Pending",
        "google_id" => "google-pending"
      })
      |> Repo.insert()

    user
  end

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
end
