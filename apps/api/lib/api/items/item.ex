defmodule Api.Items.Item do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Users.User
  alias Api.Items.Photo

  schema "items" do
    field :title, :string
    field :description, :string
    field :category, :string
    field :gender, Ecto.Enum, values: [:male, :female, :unisex]
    field :clothing_size, :string
    field :condition, Ecto.Enum, values: [:new, :like_new, :used]
    field :price_cents, :integer
    field :status, Ecto.Enum, values: [:active, :sold, :removed], default: :active

    belongs_to :seller, User
    has_many :photos, Photo

    timestamps(type: :utc_datetime)
  end

  def changeset(item, attrs) do
    item
    |> cast(attrs, [:title, :description, :category, :gender, :clothing_size, :condition, :price_cents, :status, :seller_id])
    |> validate_required([:title, :category, :gender, :clothing_size, :condition, :price_cents, :seller_id])
    |> validate_number(:price_cents, greater_than: 0)
    |> foreign_key_constraint(:seller_id)
  end
end
