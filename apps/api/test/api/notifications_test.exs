defmodule Api.NotificationsTest do
  use Api.DataCase, async: true

  alias Api.Notifications

  describe "list_notifications/1" do
    test "returns notifications for a user" do
      user = insert(:user)
      _n1 = insert(:notification, user: user, title: "First")
      _n2 = insert(:notification, user: user, title: "Second")
      _other = insert(:notification, title: "Other user")

      notifications = Notifications.list_notifications(user.id)
      assert length(notifications) == 2
    end

    test "returns empty list when no notifications" do
      user = insert(:user)
      assert Notifications.list_notifications(user.id) == []
    end
  end

  describe "get_notification/1" do
    test "returns notification by id" do
      notification = insert(:notification)
      assert {:ok, result} = Notifications.get_notification(notification.id)
      assert result.id == notification.id
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Notifications.get_notification(999_999)
    end
  end

  describe "create_notification/1" do
    test "creates notification with valid attrs" do
      user = insert(:user)
      attrs = %{type: :growth_prediction, title: "Growth update", body: "Your baby needs size M", user_id: user.id}

      assert {:ok, notification} = Notifications.create_notification(attrs)
      assert notification.title == "Growth update"
      assert notification.type == :growth_prediction
    end

    test "fails without required fields" do
      assert {:error, changeset} = Notifications.create_notification(%{})
      assert %{type: _, title: _, user_id: _} = errors_on(changeset)
    end
  end

  describe "mark_as_read/1" do
    test "marks notification as read" do
      notification = insert(:notification, read_at: nil)

      assert {:ok, updated} = Notifications.mark_as_read(notification.id)
      assert updated.read_at != nil
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Notifications.mark_as_read(999_999)
    end
  end

  describe "mark_all_as_read/1" do
    test "marks all unread notifications as read" do
      user = insert(:user)
      _unread1 = insert(:notification, user: user, read_at: nil)
      _unread2 = insert(:notification, user: user, read_at: nil)
      _already_read = insert(:notification, user: user, read_at: DateTime.utc_now())

      assert {:ok, count} = Notifications.mark_all_as_read(user.id)
      assert count == 2
    end

    test "returns 0 when no unread notifications" do
      user = insert(:user)
      assert {:ok, 0} = Notifications.mark_all_as_read(user.id)
    end
  end

  describe "unread_count/1" do
    test "counts unread notifications" do
      user = insert(:user)
      _unread1 = insert(:notification, user: user, read_at: nil)
      _unread2 = insert(:notification, user: user, read_at: nil)
      _read = insert(:notification, user: user, read_at: DateTime.utc_now())

      assert Notifications.unread_count(user.id) == 2
    end

    test "returns 0 when no unread" do
      user = insert(:user)
      assert Notifications.unread_count(user.id) == 0
    end
  end

  describe "delete_notification/1" do
    test "deletes an existing notification" do
      notification = insert(:notification)
      assert {:ok, _} = Notifications.delete_notification(notification.id)
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Notifications.delete_notification(999_999)
    end
  end
end
