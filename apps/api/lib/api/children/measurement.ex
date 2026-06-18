defmodule Api.Children.Measurement do
  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child

  schema "child_measurements" do
    field :recorded_at, :utc_datetime
    field :weight_g, :integer
    field :height_cm, :integer
    field :clothing_size, :string

    belongs_to :child, Child

    timestamps(type: :utc_datetime)
  end

  def changeset(measurement, attrs) do
    measurement
    |> cast(attrs, [:recorded_at, :weight_g, :height_cm, :clothing_size, :child_id])
    |> validate_required([:recorded_at, :child_id])
    |> foreign_key_constraint(:child_id)
  end
end
