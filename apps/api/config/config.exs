import Config

config :api, ecto_repos: [Api.Repo]

# A URL do banco e resolvida em runtime.exs (env DATABASE_URL, exceto em :test);
# ler env aqui e compile-time e vazaria o banco dev para a suite de testes
config :api, Api.Repo,
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
