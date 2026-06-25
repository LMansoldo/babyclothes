defmodule Api.Repo.Migrations.AddTypeAndDocumentToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :type, :string, null: false, default: "pf"
      add :cpf, :string, null: true
      add :cnpj, :string, null: true
      add :is_seller, :boolean, null: false, default: false
    end

    create unique_index(:users, [:cpf])
    create unique_index(:users, [:cnpj])
  end
end
