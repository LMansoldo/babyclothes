import Config

config :api, ecto_repos: [Api.Repo]

config :api, Api.Repo,
  url: System.get_env("DATABASE_URL", "postgres://babyclothes:babyclothes@localhost:5432/babyclothes"),
  pool_size: 10

config :api, Oban,
  repo: Api.Repo,
  plugins: [
    Oban.Plugins.Pruner,
    {Oban.Plugins.Cron,
     crontab: [
       {"0 2 * * *", Api.Workers.GrowthCheckWorker, args: %{"check_all" => true}}
     ]}
  ],
  queues: [default: 10, growth: 5]

import_config "#{config_env()}.exs"
