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

  describe "signup_changeset/2" do
    @valid_signup_attrs %{
      "email" => "newuser@example.com",
      "name" => "New User",
      "password" => "securepassword123",
      "cpf" => "52998224725",
      "phone" => "11999998888",
      "nationality" => "Brasileira",
      "cep" => "01310100",
      "address_line" => "Av. Paulista, 1000",
      "city" => "Sao Paulo",
      "state" => "SP"
    }

    test "creates a valid changeset with all fields" do
      changeset = User.signup_changeset(%User{}, @valid_signup_attrs)
      assert changeset.valid?
      assert changeset.changes.type == "pf"
      assert changeset.changes.password_hash != nil
      refute Map.has_key?(changeset.changes, :password)
      assert changeset.changes.phone == "11999998888"
      assert changeset.changes.state == "SP"
    end

    for field <- ~w(phone nationality cep address_line city state) do
      test "requires #{field}" do
        attrs = Map.delete(@valid_signup_attrs, unquote(field))
        changeset = User.signup_changeset(%User{}, attrs)
        refute changeset.valid?
        assert %{unquote(String.to_atom(field)) => ["can't be blank"]} = errors_on(changeset)
      end
    end

    test "requires email" do
      attrs = Map.delete(@valid_signup_attrs, "email")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{email: _} = errors_on(changeset)
    end

    test "requires name" do
      attrs = Map.delete(@valid_signup_attrs, "name")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{name: _} = errors_on(changeset)
    end

    test "requires password" do
      attrs = Map.delete(@valid_signup_attrs, "password")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{password: _} = errors_on(changeset)
    end

    test "requires cpf" do
      attrs = Map.delete(@valid_signup_attrs, "cpf")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects invalid email format" do
      attrs = Map.put(@valid_signup_attrs, "email", "invalid-email")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{email: _} = errors_on(changeset)
    end

    test "rejects email with spaces" do
      attrs = Map.put(@valid_signup_attrs, "email", "user @example.com")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{email: _} = errors_on(changeset)
    end

    test "rejects password shorter than 8 characters" do
      attrs = Map.put(@valid_signup_attrs, "password", "short")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{password: _} = errors_on(changeset)
    end

    test "rejects password longer than 72 characters" do
      long_password = String.duplicate("a", 73)
      attrs = Map.put(@valid_signup_attrs, "password", long_password)
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{password: _} = errors_on(changeset)
    end

    test "rejects invalid CPF checksum" do
      attrs = Map.put(@valid_signup_attrs, "cpf", "12345678900")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects invalid phone format" do
      attrs = Map.put(@valid_signup_attrs, "phone", "123")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{phone: _} = errors_on(changeset)
    end

    test "rejects invalid cep format" do
      attrs = Map.put(@valid_signup_attrs, "cep", "123")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{cep: _} = errors_on(changeset)
    end

    test "rejects invalid state" do
      attrs = Map.put(@valid_signup_attrs, "state", "XX")
      changeset = User.signup_changeset(%User{}, attrs)
      refute changeset.valid?
      assert %{state: _} = errors_on(changeset)
    end

    test "accepts valid 10-digit phone" do
      attrs = Map.put(@valid_signup_attrs, "phone", "1199998888")
      changeset = User.signup_changeset(%User{}, attrs)
      assert changeset.valid?
    end

    test "accepts valid 11-digit phone" do
      attrs = Map.put(@valid_signup_attrs, "phone", "11999998888")
      changeset = User.signup_changeset(%User{}, attrs)
      assert changeset.valid?
    end

    test "allows nil profile fields" do
      changeset = User.signup_changeset(%User{}, @valid_signup_attrs)
      assert changeset.valid?
    end

    test "rejects duplicated email" do
      insert(:user, email: "taken@example.com")
      attrs = Map.put(@valid_signup_attrs, "email", "taken@example.com")

      {:error, changeset} =
        %User{}
        |> User.signup_changeset(attrs)
        |> Repo.insert()

      assert %{email: _} = errors_on(changeset)
    end

    test "rejects duplicated cpf" do
      insert(:user, cpf: "11144477735")
      attrs = Map.put(@valid_signup_attrs, "cpf", "11144477735")

      {:error, changeset} =
        %User{}
        |> User.signup_changeset(attrs)
        |> Repo.insert()

      assert %{cpf: _} = errors_on(changeset)
    end

    test "hashes the password with bcrypt" do
      changeset = User.signup_changeset(%User{}, @valid_signup_attrs)
      hash = changeset.changes.password_hash

      assert is_binary(hash)
      assert Bcrypt.verify_pass("securepassword123", hash)
      refute Bcrypt.verify_pass("wrongpassword", hash)
    end
  end
end
