defmodule Api.Repo.Migrations.CreateNotifications do
  use Ecto.Migration

  def change do
    execute "CREATE TYPE notification_type AS ENUM ('growth_prediction', 'new_message', 'item_sold', 'system')", "DROP TYPE notification_type"

    create table(:notifications) do
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :type, :notification_type, null: false
      add :title, :string, null: false
      add :body, :text
      add :metadata, :map, default: %{}
      add :read_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create index(:notifications, [:user_id])
    create index(:notifications, [:read_at])
  end
end
