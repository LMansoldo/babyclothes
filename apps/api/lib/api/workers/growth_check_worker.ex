defmodule Api.Workers.GrowthCheckWorker do
  @moduledoc "Oban worker for running AI growth predictions."
  use Oban.Worker, queue: :growth, max_attempts: 3

  alias Api.Repo
  alias Api.Children.Child
  import Ecto.Query

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"child_id" => child_id}}) do
    case Repo.get(Child, child_id) do
      nil ->
        {:error, :child_not_found}

      child ->
        child = Repo.preload(child, [:measurements, :user])
        predict_and_notify(child)
    end
  end

  def perform(%Oban.Job{args: %{"check_all" => true}}) do
    children =
      Child
      |> join(:inner, [c], m in assoc(c, :measurements))
      |> distinct(true)
      |> Repo.all()

    Enum.each(children, fn child ->
      %{child_id: child.id} |> new() |> Oban.insert()
    end)

    :ok
  end

  defp predict_and_notify(child) do
    agents_url = Application.get_env(:api, :agents_http_url, "http://localhost:50052")

    body =
      Jason.encode!(%{
        child_id: to_string(child.id),
        name: child.name,
        birth_date: Date.to_iso8601(child.birth_date),
        measurements:
          Enum.map(child.measurements, fn m ->
            %{
              recorded_at: DateTime.to_iso8601(m.recorded_at),
              weight_g: m.weight_g,
              height_cm: m.height_cm,
              clothing_size: m.clothing_size
            }
          end)
      })

    headers = [{"Content-Type", "application/json"}]
    request = Finch.build(:post, "#{agents_url}/predict-growth", headers, body)

    case Finch.request(request, Api.Finch) do
      {:ok, %{status: 200, body: resp_body}} ->
        prediction = Jason.decode!(resp_body)
        create_notification(child, prediction)

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp create_notification(child, prediction) do
    predicted_size = prediction["predicted_size"]
    confidence = prediction["confidence"]
    days = prediction["days_until_next_size"]

    attrs = %{
      "user_id" => child.user_id,
      "type" => "growth_prediction",
      "title" => "#{child.name} vai precisar de #{predicted_size}!",
      "body" =>
        "Em #{days} dias, #{child.name} vai precisar de tamanho #{predicted_size} (confianca: #{confidence}%)",
      "metadata" => %{
        "child_id" => child.id,
        "predicted_size" => predicted_size,
        "confidence" => confidence,
        "days_until_next_size" => days
      }
    }

    case Api.Notifications.create_notification(attrs) do
      {:ok, notification} ->
        Api.Notifications.broadcast_notification(notification)
        :ok

      {:error, _changeset} = error ->
        error
    end
  end

  @spec schedule(integer()) :: {:ok, Oban.Job.t()} | {:error, term()}
  def schedule(child_id) do
    %{child_id: child_id} |> new() |> Oban.insert()
  end
end
