defmodule Api.Repo.Migrations.CreateChildren do
  use Ecto.Migration

  def change do
    create table(:children) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :name, :string, null: false
      add :birth_date, :date, null: false
      add :birth_weight_g, :integer
      add :birth_height_cm, :integer

      timestamps(type: :utc_datetime)
    end

    create index(:children, [:user_id])
  end
end
