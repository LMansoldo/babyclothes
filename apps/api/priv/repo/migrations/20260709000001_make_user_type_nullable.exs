defmodule Api.Repo.Migrations.MakeUserTypeNullable do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE users ALTER COLUMN type DROP NOT NULL")
    execute("ALTER TABLE users ALTER COLUMN type DROP DEFAULT")
    execute("UPDATE users SET type = NULL WHERE type = 'pf' AND cpf IS NULL")
  end

  def down do
    execute("UPDATE users SET type = 'pf' WHERE type IS NULL")
    execute("ALTER TABLE users ALTER COLUMN type SET DEFAULT 'pf'")
    execute("ALTER TABLE users ALTER COLUMN type SET NOT NULL")
  end
end
