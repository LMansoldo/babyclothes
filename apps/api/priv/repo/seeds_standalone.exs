# Seeds standalone — starts Ecto without Bandit
#
# Usage: mix run --no-start priv/repo/seeds_standalone.exs
#
# The --no-start flag prevents the OTP Application from starting,
# which avoids Bandit binding to port 4000. This script manually
# starts only the Repo, cleans existing data, then delegates to seeds.exs.

Application.put_env(:api, Api.Repo, url: System.get_env("DATABASE_URL"))

{:ok, _} = Application.ensure_all_started(:ecto)
{:ok, _} = Application.ensure_all_started(:postgrex)
{:ok, _} = Application.ensure_all_started(:jason)

Api.Repo.start_link()

# Give Repo time to connect
Process.sleep(500)

# Clean existing data in reverse dependency order
IO.puts("── Cleaning existing data ────────────────────────────────")

Api.Repo.delete_all(Api.Notifications.Notification)
Api.Repo.delete_all(Api.Items.Photo)
Api.Repo.delete_all(Api.Items.Item)
Api.Repo.delete_all(Api.Children.Measurement)
Api.Repo.delete_all(Api.Children.Child)
Api.Repo.delete_all(Api.Users.User)

IO.puts("")

Code.eval_file("priv/repo/seeds.exs")
