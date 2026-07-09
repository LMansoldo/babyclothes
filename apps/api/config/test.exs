import Config

config :api, Api.Repo,
  database: "babyclothes_test",
  username: "babyclothes",
  password: "babyclothes",
  hostname: System.get_env("DB_HOST", "localhost"),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :api, Oban, testing: :manual

config :ex_aws,
  access_key_id: "test-access-key",
  secret_access_key: "test-secret-key",
  region: "us-east-1"

config :api,
  jwt_secret: "test-jwt-secret",
  internal_jwt_secret: "test-internal-jwt-secret",
  google_client_id: "test-google-client-id",
  agents_http_url: "http://localhost:50052",
  internal_api_key: "dev-internal-key",
  s3_bucket: "babyclothes-uploads"

config :api, port: 4002

config :api, dev_login_enabled: true

config :logger, level: :warning
