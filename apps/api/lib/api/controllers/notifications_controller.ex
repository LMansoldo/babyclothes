defmodule Api.Controllers.NotificationsController do
  @moduledoc """
  Controller for notification endpoints.
  """

  import Plug.Conn
  alias Api.Notifications

  @doc """
  GET /users/:user_id/notifications — List notifications for a user.
  """
  def index(conn, user_id) do
    notifications = Notifications.list_notifications(user_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{notifications: Enum.map(notifications, &notification_json/1)}))
  end

  @doc """
  GET /users/:user_id/notifications/unread-count — Count of unread notifications.
  """
  def unread_count(conn, user_id) do
    count = Notifications.unread_count(user_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{unread_count: count}))
  end

  @doc """
  POST /users/:user_id/notifications — Create a notification.
  """
  def create(conn, user_id) do
    attrs = Map.put(conn.body_params, "user_id", user_id)

    case Notifications.create_notification(attrs) do
      {:ok, notification} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(%{notification: notification_json(notification)}))

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
  PATCH /notifications/:id/read — Mark a notification as read.
  """
  def mark_as_read(conn, id) do
    case Notifications.mark_as_read(id) do
      {:ok, notification} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{notification: notification_json(notification)}))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))
    end
  end

  @doc """
  PATCH /users/:user_id/notifications/read-all — Mark all notifications as read.
  """
  def mark_all_as_read(conn, user_id) do
    {:ok, count} = Notifications.mark_all_as_read(user_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{updated: count}))
  end

  @doc """
  DELETE /notifications/:id — Delete a notification.
  """
  def delete(conn, id) do
    case Notifications.delete_notification(id) do
      {:ok, _notification} ->
        send_resp(conn, 204, "")

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))
    end
  end

  defp notification_json(notification) do
    %{
      id: notification.id,
      type: to_string(notification.type),
      title: notification.title,
      body: notification.body,
      metadata: notification.metadata,
      read_at: notification.read_at,
      user_id: notification.user_id,
      inserted_at: notification.inserted_at
    }
  end
end
