defmodule Api.Users.User do
  @moduledoc """
  User schema. `changeset/2` handles the Google profile fields;
  `registration_changeset/2` handles the one-time PF/PJ registration.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child
  alias Api.Items.Item
  alias Api.Notifications.Notification
  alias Api.Users.Document

  @type t :: %__MODULE__{}

  schema "users" do
    field :email, :string
    field :name, :string
    field :avatar_url, :string
    field :google_id, :string
    field :type, :string
    field :cpf, :string
    field :cnpj, :string
    field :is_seller, :boolean, default: false

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
    |> cast(attrs, [:type, :cpf, :cnpj])
    |> validate_required([:type])
    |> validate_inclusion(:type, ["pf", "pj"])
    |> validate_document_for_type()
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
