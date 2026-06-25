defmodule Api.Repo.Migrations.AddDocumentToChildren do
  use Ecto.Migration

  def change do
    alter table(:children) do
      add :document, :string, null: true
    end
  end
end
