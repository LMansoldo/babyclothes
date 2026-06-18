defmodule Api.Children.Child do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Users.User
  alias Api.Children.Measurement

  schema "children" do
    field :name, :string
    field :birth_date, :date
    field :birth_weight_g, :integer
    field :birth_height_cm, :integer

    belongs_to :user, User
    has_many :measurements, Measurement

    timestamps(type: :utc_datetime)
  end

  def changeset(child, attrs) do
    child
    |> cast(attrs, [:name, :birth_date, :birth_weight_g, :birth_height_cm, :user_id])
    |> validate_required([:name, :birth_date, :user_id])
    |> foreign_key_constraint(:user_id)
  end
end
