defmodule Api.Users.User do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child
  alias Api.Items.Item
  alias Api.Notifications.Notification

  schema "users" do
    field :email, :string
    field :name, :string
    field :avatar_url, :string
    field :google_id, :string

    has_many :children, Child
    has_many :items, Item, foreign_key: :seller_id
    has_many :notifications, Notification

    timestamps(type: :utc_datetime)
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :avatar_url, :google_id])
    |> validate_required([:email, :name, :google_id])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> unique_constraint(:google_id)
  end
end
