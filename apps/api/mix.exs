defmodule Api.MixProject do
  use Mix.Project

  def project do
    [
      app: :api,
      version: "0.1.0",
      elixir: "~> 1.17",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {Api.Application, []}
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:plug,       "~> 1.16"},
      {:bandit,     "~> 1.5"},
      {:ecto_sql,   "~> 3.12"},
      {:postgrex,   "~> 0.19"},
      {:jason,      "~> 1.4"},
      {:oban,       "~> 2.18"},
      {:grpc,       "~> 0.8"},
      {:protobuf,   "~> 0.13"},
      {:jose,       "~> 1.11"},
      {:finch,      "~> 0.19"},
      {:ex_aws,     "~> 2.5"},
      {:ex_aws_s3,  "~> 2.5"},
      {:sweet_xml,  "~> 0.7"},
      {:hackney,    "~> 1.20"},
      # dev/test only
      {:credo,      "~> 1.7", only: [:dev, :test], runtime: false},
      {:ex_machina, "~> 2.8", only: :test}
    ]
  end
end
