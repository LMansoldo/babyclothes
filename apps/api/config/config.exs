import Config

config :api, Api.Repo,
  database: "babyclothes_dev",
  username: "babyclothes",
  password: "babyclothes",
  hostname: "localhost",
  pool_size: 10

config :api, Oban,
  repo: Api.Repo,
  plugins: [Oban.Plugins.Pruner],
  queues: [default: 10, growth: 5]

import_config "#{config_env()}.exs"
