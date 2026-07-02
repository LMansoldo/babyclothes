defmodule Api.Controllers.InternalController do
  @moduledoc """
  Controller for internal API routes used by the agents service.
  Protected by x-internal-key header validation.
  """

  import Plug.Conn
  import Ecto.Query
  alias Api.Repo

  @doc """
  POST /internal/notifications
  Creates a notification and broadcasts it via PubSub.
  """
  def create_notification(conn) do
    case Api.Notifications.create_notification(conn.body_params) do
      {:ok, notification} ->
        Api.Notifications.broadcast_notification(notification)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(%{id: notification.id}))

      {:error, changeset} ->
        errors =
          Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
            Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
              opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
            end)
          end)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{errors: errors}))
    end
  end

  @doc """
  GET /internal/children/:id/context
  Returns complete child context for the agents service.
  """
  def child_context(conn, id) do
    case Repo.get(Api.Children.Child, id) do
      nil ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not_found"}))

      child ->
        child = Repo.preload(child, [:measurements, :user])

        measurements =
          Enum.map(child.measurements, fn m ->
            %{
              recorded_at: m.recorded_at,
              weight_g: m.weight_g,
              height_cm: m.height_cm,
              clothing_size: m.clothing_size
            }
          end)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(
          200,
          Jason.encode!(%{
            child: %{
              id: child.id,
              name: child.name,
              birth_date: child.birth_date,
              birth_weight_g: child.birth_weight_g,
              birth_height_cm: child.birth_height_cm,
              user_id: child.user_id
            },
            measurements: measurements,
            user: %{
              id: child.user.id,
              name: child.user.name,
              email: child.user.email
            }
          })
        )
    end
  end

  @doc """
  GET /internal/items/search
  Searches items for agent recommendations.
  """
  def search_items(conn) do
    conn = Plug.Conn.fetch_query_params(conn)
    params = conn.query_params

    limit =
      case params["limit"] do
        nil -> 10
        val -> min(String.to_integer(val), 50)
      end

    query =
      Api.Items.Item
      |> where([i], i.status == :active)
      |> maybe_filter_category(params["category"])
      |> maybe_filter_size(params["size"])
      |> maybe_filter_gender(params["gender"])
      |> order_by(desc: :inserted_at)
      |> limit(^limit)
      |> preload(:photos)

    items = Repo.all(query)

    items_json =
      Enum.map(items, fn item ->
        photo_url =
          case item.photos do
            [photo | _] -> photo.url
            _ -> nil
          end

        %{
          id: item.id,
          title: item.title,
          category: item.category,
          clothing_size: item.clothing_size,
          condition: item.condition,
          price_cents: item.price_cents,
          photo_url: photo_url
        }
      end)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{items: items_json}))
  end

  defp maybe_filter_category(query, nil), do: query
  defp maybe_filter_category(query, cat), do: where(query, [i], i.category == ^cat)

  defp maybe_filter_size(query, nil), do: query
  defp maybe_filter_size(query, size), do: where(query, [i], i.clothing_size == ^size)

  defp maybe_filter_gender(query, nil), do: query
  defp maybe_filter_gender(query, gender), do: where(query, [i], i.gender == ^gender)
end
