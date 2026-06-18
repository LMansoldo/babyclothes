import Config

if config_env() == :prod do
  config :api, Api.Repo,
    url: System.fetch_env!("DATABASE_URL"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10"))
end

config :api,
  jwt_secret: System.get_env("JWT_SECRET", "dev-secret-change-in-prod"),
  internal_jwt_secret: System.get_env("INTERNAL_JWT_SECRET", "dev-secret-change-in-production"),
  google_client_id: System.get_env("GOOGLE_CLIENT_ID", ""),
  grpc_agent_url: System.get_env("GRPC_AGENT_URL", "localhost:50051"),
  internal_api_key: System.get_env("INTERNAL_API_KEY", "dev-internal-key")
