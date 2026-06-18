defmodule Api.FeatureFlags.FeatureFlag do
  use Ecto.Schema
  import Ecto.Changeset

  schema "feature_flags" do
    field :key, :string
    field :enabled, :boolean, default: false
    field :description, :string

    timestamps(type: :utc_datetime)
  end

  def changeset(flag, attrs) do
    flag
    |> cast(attrs, [:key, :enabled, :description])
    |> validate_required([:key])
    |> unique_constraint(:key)
  end
end
