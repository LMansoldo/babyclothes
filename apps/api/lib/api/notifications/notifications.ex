defmodule Api.Notifications do
  @moduledoc """
  Context for managing user notifications.
  """

  import Ecto.Query
  alias Api.Repo
  alias Api.Notifications.Notification

  @doc """
  List notifications for a user, ordered by newest first.
  """
  def list_notifications(user_id) do
    Notification
    |> where(user_id: ^user_id)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  @doc """
  Get a single notification.
  """
  def get_notification(id) do
    case Repo.get(Notification, id) do
      nil -> {:error, :not_found}
      notification -> {:ok, notification}
    end
  end

  @doc """
  Create a new notification.
  """
  def create_notification(attrs) do
    %Notification{}
    |> Notification.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Mark a notification as read.
  """
  def mark_as_read(id) do
    case Repo.get(Notification, id) do
      nil ->
        {:error, :not_found}

      notification ->
        notification
        |> Notification.mark_as_read()
        |> Repo.update()
    end
  end

  @doc """
  Mark all notifications for a user as read.
  Returns the count of updated notifications.
  """
  def mark_all_as_read(user_id) do
    now = DateTime.utc_now() |> DateTime.truncate(:second)

    {count, _} =
      Notification
      |> where(user_id: ^user_id)
      |> where([n], is_nil(n.read_at))
      |> Repo.update_all(set: [read_at: now, updated_at: now])

    {:ok, count}
  end

  @doc """
  Count unread notifications for a user.
  """
  def unread_count(user_id) do
    Notification
    |> where(user_id: ^user_id)
    |> where([n], is_nil(n.read_at))
    |> Repo.aggregate(:count)
  end

  @doc """
  Delete a notification.
  """
  def delete_notification(id) do
    case Repo.get(Notification, id) do
      nil -> {:error, :not_found}
      notification -> Repo.delete(notification)
    end
  end
end
