defmodule Api.Repo.Migrations.AddEmailAuthAndProfileToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :password_hash, :string
      add :phone, :string
      add :nationality, :string
      add :cep, :string
      add :address_line, :string
      add :city, :string
      add :state, :string
    end

    execute "ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL",
            "ALTER TABLE users ALTER COLUMN google_id SET NOT NULL"
  end
end
