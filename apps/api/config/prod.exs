import Config

config :api, Api.Repo,
  pool_size: 15,
  ssl: true

config :logger, :console,
  format: "$dateT$time $metadata[$level] $message\n",
  level: :info

config :api, Oban,
  queues: [default: 10, growth: 5],
  prune: :max_age
