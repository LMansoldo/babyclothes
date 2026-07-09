import Config

config :api, Api.Repo,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# Login de desenvolvimento (POST /auth/dev-login) — nunca habilitar em prod
config :api, dev_login_enabled: true

config :logger, :console,
  format: "[$level] $message\n"
