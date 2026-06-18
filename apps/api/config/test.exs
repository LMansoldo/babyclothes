import Config

config :api, Api.Repo,
  database: "babyclothes_test",
  username: "babyclothes",
  password: "babyclothes",
  hostname: System.get_env("DB_HOST", "localhost"),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :api, Oban, testing: :manual

config :logger, level: :warning
