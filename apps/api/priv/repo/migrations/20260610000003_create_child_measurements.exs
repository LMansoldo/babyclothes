defmodule Api.Repo.Migrations.CreateChildMeasurements do
  use Ecto.Migration

  def change do
    create table(:child_measurements) do
      add :child_id, references(:children, on_delete: :delete_all), null: false
      add :recorded_at, :utc_datetime, null: false
      add :weight_g, :integer
      add :height_cm, :integer
      add :clothing_size, :string

      timestamps(type: :utc_datetime)
    end

    create index(:child_measurements, [:child_id])
    create index(:child_measurements, [:recorded_at])
  end
end
