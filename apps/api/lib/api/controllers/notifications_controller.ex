defmodule Api.Controllers.NotificationsController do
  @moduledoc """
  Controller for notification endpoints.
  """

  import Plug.Conn
  alias Api.Notifications
  alias Api.Plugs.Auth
  alias Api.Auth.Guard

  @doc """
  GET /users/:user_id/notifications — List notifications for a user.
  """
  def index(conn, user_id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      conn = Guard.require_owner(conn, String.to_integer(user_id))

      if conn.halted do
        conn
      else
        notifications = Notifications.list_notifications(user_id)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{notifications: Enum.map(notifications, &notification_json/1)}))
      end
    end
  end

  @doc """
  GET /users/:user_id/notifications/unread-count — Count of unread notifications.
  """
  def unread_count(conn, user_id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      conn = Guard.require_owner(conn, String.to_integer(user_id))

      if conn.halted do
        conn
      else
        count = Notifications.unread_count(user_id)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{unread_count: count}))
      end
    end
  end

  @doc """
  POST /users/:user_id/notifications — Create a notification.
  """
  def create(conn, user_id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      conn = Guard.require_owner(conn, String.to_integer(user_id))

      if conn.halted do
        conn
      else
        attrs = Map.put(conn.body_params, "user_id", user_id)

        case Notifications.create_notification(attrs) do
          {:ok, notification} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(201, Jason.encode!(%{notification: notification_json(notification)}))

          {:error, changeset} ->
            send_changeset_error(conn, changeset)
        end
      end
    end
  end

  @doc """
  PATCH /notifications/:id/read — Mark a notification as read.
  """
  def mark_as_read(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Notifications.get_notification(id) do
        {:ok, notification} ->
          conn = Guard.require_owner(conn, notification.user_id)

          if conn.halted do
            conn
          else
            {:ok, notification} = Notifications.mark_as_read(id)

            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Jason.encode!(%{notification: notification_json(notification)}))
          end

        {:error, :not_found} ->
          send_not_found(conn)
      end
    end
  end

  @doc """
  PATCH /users/:user_id/notifications/read-all — Mark all notifications as read.
  """
  def mark_all_as_read(conn, user_id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      conn = Guard.require_owner(conn, String.to_integer(user_id))

      if conn.halted do
        conn
      else
        {:ok, count} = Notifications.mark_all_as_read(user_id)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{updated: count}))
      end
    end
  end

  @doc """
  DELETE /notifications/:id — Delete a notification.
  """
  def delete(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Notifications.get_notification(id) do
        {:ok, notification} ->
          conn = Guard.require_owner(conn, notification.user_id)

          if conn.halted do
            conn
          else
            {:ok, _} = Notifications.delete_notification(id)
            send_resp(conn, 204, "")
          end

        {:error, :not_found} ->
          send_not_found(conn)
      end
    end
  end

  # ── Private Helpers ───────────────────────────────────────

  defp send_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "not found"}))
  end

  defp send_changeset_error(conn, changeset) do
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
