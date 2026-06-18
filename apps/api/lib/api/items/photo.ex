defmodule Api.Items.Photo do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Items.Item

  schema "item_photos" do
    field :url, :string
    field :position, :integer, default: 0

    belongs_to :item, Item

    timestamps(type: :utc_datetime)
  end

  def changeset(photo, attrs) do
    photo
    |> cast(attrs, [:url, :position, :item_id])
    |> validate_required([:url, :item_id])
    |> foreign_key_constraint(:item_id)
  end
end
