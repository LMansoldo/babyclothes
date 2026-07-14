defmodule Api.Users.User do
  @moduledoc """
  User schema. `changeset/2` handles the Google profile fields;
  `registration_changeset/2` handles the one-time PF/PJ registration;
  `signup_changeset/2` handles email/password signup with profile fields.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child
  alias Api.Items.Item
  alias Api.Notifications.Notification
  alias Api.Users.Document

  @type t :: %__MODULE__{}

  @ufs ~w(AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RO RR RS SC SE SP TO)

  @profile_fields [:phone, :nationality, :cep, :address_line, :city, :state]

  schema "users" do
    field :email, :string
    field :name, :string
    field :avatar_url, :string
    field :google_id, :string
    field :type, :string
    field :cpf, :string
    field :cnpj, :string
    field :is_seller, :boolean, default: false

    field :password, :string, virtual: true, redact: true
    field :password_hash, :string, redact: true
    field :phone, :string
    field :nationality, :string
    field :cep, :string
    field :address_line, :string
    field :city, :string
    field :state, :string

    has_many :children, Child
    has_many :items, Item, foreign_key: :seller_id
    has_many :notifications, Notification

    timestamps(type: :utc_datetime)
  end

  @doc "Changeset for creating/updating the Google profile fields."
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :avatar_url, :google_id, :is_seller])
    |> validate_required([:email, :name, :google_id])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> unique_constraint(:google_id)
  end

  @doc "Changeset for the one-time PF/PJ registration (type + document)."
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:type, :cpf, :cnpj] ++ @profile_fields)
    |> validate_required([:type])
    |> validate_inclusion(:type, ["pf", "pj"])
    |> validate_document_for_type()
    |> validate_profile()
  end

  @doc "Changeset for email/password signup with profile fields."
  def signup_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :password, :cpf] ++ @profile_fields)
    |> validate_required([:email, :name, :password, :cpf])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:password, min: 8, max: 72)
    |> put_change(:type, "pf")
    |> validate_change(:cpf, &cpf_checksum/2)
    |> validate_profile()
    |> unique_constraint(:email)
    |> unique_constraint(:cpf)
    |> hash_password()
  end

  defp validate_profile(changeset) do
    changeset
    |> validate_format(:phone, ~r/^\d{10,11}$/, message: "must be 10 or 11 digits", allow_nil: true)
    |> validate_format(:cep, ~r/^\d{8}$/, message: "must be 8 digits", allow_nil: true)
    |> validate_inclusion(:state, @ufs, message: "must be a valid Brazilian state", allow_nil: true)
    |> validate_length(:nationality, max: 100, allow_nil: true)
    |> validate_length(:address_line, max: 255, allow_nil: true)
    |> validate_length(:city, max: 100, allow_nil: true)
  end

  defp hash_password(changeset) do
    case get_change(changeset, :password) do
      nil ->
        changeset

      password ->
        changeset
        |> put_change(:password_hash, Bcrypt.hash_pwd_salt(password))
        |> delete_change(:password)
    end
  end

  defp validate_document_for_type(changeset) do
    case get_field(changeset, :type) do
      "pf" -> validate_pf_document(changeset)
      "pj" -> validate_pj_document(changeset)
      _other -> changeset
    end
  end

  defp validate_pf_document(changeset) do
    changeset
    |> put_change(:cnpj, nil)
    |> validate_required([:cpf])
    |> validate_change(:cpf, &cpf_checksum/2)
    |> unique_constraint(:cpf)
  end

  defp validate_pj_document(changeset) do
    changeset
    |> put_change(:cpf, nil)
    |> validate_required([:cnpj])
    |> validate_change(:cnpj, &cnpj_checksum/2)
    |> unique_constraint(:cnpj)
  end

  defp cpf_checksum(:cpf, cpf) do
    case Document.valid_cpf?(cpf) do
      true -> []
      false -> [cpf: "is not a valid CPF"]
    end
  end

  defp cnpj_checksum(:cnpj, cnpj) do
    case Document.valid_cnpj?(cnpj) do
      true -> []
      false -> [cnpj: "is not a valid CNPJ"]
    end
  end
end
