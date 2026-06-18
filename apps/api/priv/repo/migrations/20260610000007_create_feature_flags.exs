defmodule Api.Repo.Migrations.CreateFeatureFlags do
  use Ecto.Migration

  def change do
    create table(:feature_flags) do
      add :key, :string, null: false
      add :enabled, :boolean, null: false, default: false
      add :description, :text

      timestamps(type: :utc_datetime)
    end

    create unique_index(:feature_flags, [:key])
  end
end
