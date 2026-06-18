defmodule Api.Application do
  use Application

  @impl true
  def start(_type, _args) do
    port = String.to_integer(System.get_env("PORT", "4000"))

    children = [
      Api.Repo,
      {Oban, Application.fetch_env!(:api, Oban)},
      {Finch, name: Api.Finch},
      {Bandit, plug: Api.Router, port: port}
    ]

    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
