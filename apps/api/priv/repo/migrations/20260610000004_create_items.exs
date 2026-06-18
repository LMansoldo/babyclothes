defmodule Api.Repo.Migrations.CreateItems do
  use Ecto.Migration

  def change do
    execute "CREATE TYPE item_condition AS ENUM ('new', 'like_new', 'used')", "DROP TYPE item_condition"
    execute "CREATE TYPE item_gender AS ENUM ('male', 'female', 'unisex')", "DROP TYPE item_gender"
    execute "CREATE TYPE item_status AS ENUM ('active', 'sold', 'removed')", "DROP TYPE item_status"

    create table(:items) do
      add :seller_id, references(:users, on_delete: :delete_all), null: false
      add :title, :string, null: false
      add :description, :text
      add :category, :string, null: false
      add :gender, :item_gender, null: false, default: "unisex"
      add :clothing_size, :string, null: false
      add :condition, :item_condition, null: false
      add :price_cents, :integer, null: false
      add :status, :item_status, null: false, default: "active"

      timestamps(type: :utc_datetime)
    end

    create index(:items, [:seller_id])
    create index(:items, [:status])
    create index(:items, [:category])
    create index(:items, [:clothing_size])
  end
end
