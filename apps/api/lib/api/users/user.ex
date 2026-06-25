defmodule Api.Users.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child
  alias Api.Items.Item
  alias Api.Notifications.Notification

  @doc "CPF format: 11 digits"
  @cpf_regex ~r/^\d{11}$/

  @doc "CNPJ format: 14 digits"
  @cnpj_regex ~r/^\d{14}$/

  schema "users" do
    field :email, :string
    field :name, :string
    field :avatar_url, :string
    field :google_id, :string
    field :type, :string, default: "pf"
    field :cpf, :string
    field :cnpj, :string
    field :is_seller, :boolean, default: false

    has_many :children, Child
    has_many :items, Item, foreign_key: :seller_id
    has_many :notifications, Notification

    timestamps(type: :utc_datetime)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :avatar_url, :google_id, :type, :cpf, :cnpj, :is_seller])
    |> validate_required([:email, :name, :google_id])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> unique_constraint(:google_id)
    |> validate_type()
    |> maybe_validate_cpf()
    |> maybe_validate_cnpj()
  end

  defp validate_type(changeset) do
    validate_inclusion(changeset, :type, ["pf", "pj"])
  end

  defp maybe_validate_cpf(changeset) do
    type = get_field(changeset, :type)

    if type == "pf" do
      changeset
      |> validate_required([:cpf])
      |> validate_format(:cpf, @cpf_regex, message: "CPF must have 11 digits")
      |> unique_constraint(:cpf)
    else
      changeset
    end
  end

  defp maybe_validate_cnpj(changeset) do
    type = get_field(changeset, :type)

    if type == "pj" do
      changeset
      |> validate_required([:cnpj])
      |> validate_format(:cnpj, @cnpj_regex, message: "CNPJ must have 14 digits")
      |> unique_constraint(:cnpj)
    else
      changeset
    end
  end
end
