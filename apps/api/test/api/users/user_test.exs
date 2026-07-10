defmodule Api.Users.UserTest do
  use Api.DataCase, async: true

  alias Api.Users.User

  @google_attrs %{
    "email" => "novo@example.com",
    "name" => "Novo Usuario",
    "avatar_url" => "https://example.com/a.png",
    "google_id" => "google-novo"
  }

  describe "changeset/2 (Google profile)" do
    test "is valid without type or document" do
      changeset = User.changeset(%User{}, @google_attrs)
      assert changeset.valid?
    end

    test "does not cast type, cpf or cnpj" do
      attrs = Map.merge(@google_attrs, %{"type" => "pf", "cpf" => "52998224725"})
      changeset = User.changeset(%User{}, attrs)
      refute Map.has_key?(changeset.changes, :type)
      refute Map.has_key?(changeset.changes, :cpf)
    end

    test "new user has nil type" do
      {:ok, user} = %User{} |> User.changeset(@google_attrs) |> Repo.insert()
      assert user.type == nil
    end
  end

  describe "registration_changeset/2" do
    setup do
      {:ok, user} = %User{} |> User.changeset(@google_attrs) |> Repo.insert()
      %{user: user}
    end

    test "registers a PF with a valid CPF", %{user: user} do
      {:ok, updated} =
        user
        |> User.registration_changeset(%{"type" => "pf", "cpf" => "52998224725"})
        |> Repo.update()

      assert updated.type == "pf"
      assert updated.cpf == "52998224725"
      assert updated.cnpj == nil
    end

    test "registers a PJ with a valid CNPJ", %{user: user} do
      {:ok, updated} =
        user
        |> User.registration_changeset(%{"type" => "pj", "cnpj" => "11222333000181"})
        |> Repo.update()

      assert updated.type == "pj"
      assert updated.cnpj == "11222333000181"
      assert updated.cpf == nil
    end

    test "rejects a CPF with bad checksum", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pf", "cpf" => "12345678900"})
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects a CNPJ with bad checksum", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pj", "cnpj" => "11222333000180"})
      refute changeset.valid?
      assert %{cnpj: _} = errors_on(changeset)
    end

    test "requires the document for the chosen type", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pf"})
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects unknown type", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "mei", "cpf" => "52998224725"})
      refute changeset.valid?
      assert %{type: _} = errors_on(changeset)
    end

    test "rejects duplicated CPF", %{user: user} do
      insert(:user, type: "pf", cpf: "11144477735")

      {:error, changeset} =
        user
        |> User.registration_changeset(%{"type" => "pf", "cpf" => "11144477735"})
        |> Repo.update()

      assert %{cpf: _} = errors_on(changeset)
    end
  end
end
