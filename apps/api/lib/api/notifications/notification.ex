defmodule Api.Notifications.Notification do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Users.User

  schema "notifications" do
    field :type, Ecto.Enum, values: [:growth_prediction, :new_message, :item_sold, :system]
    field :title, :string
    field :body, :string
    field :metadata, :map, default: %{}
    field :read_at, :utc_datetime

    belongs_to :user, User

    timestamps(type: :utc_datetime)
  end

  def changeset(notification, attrs) do
    notification
    |> cast(attrs, [:type, :title, :body, :metadata, :read_at, :user_id])
    |> validate_required([:type, :title, :user_id])
    |> foreign_key_constraint(:user_id)
  end

  def mark_as_read(notification) do
    change(notification, read_at: DateTime.utc_now() |> DateTime.truncate(:second))
  end
end
