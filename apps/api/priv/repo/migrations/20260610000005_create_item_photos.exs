defmodule Api.Repo.Migrations.CreateItemPhotos do
  use Ecto.Migration

  def change do
    create table(:item_photos) do
      add :item_id, references(:items, on_delete: :delete_all), null: false
      add :url, :string, null: false
      add :position, :integer, null: false, default: 0

      timestamps(type: :utc_datetime)
    end

    create index(:item_photos, [:item_id])
  end
end
