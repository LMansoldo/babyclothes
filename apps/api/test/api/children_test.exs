defmodule Api.ChildrenTest do
  use Api.DataCase, async: true

  alias Api.Children

  describe "list_children/1" do
    test "returns children for a user" do
      user = insert(:user)
      _child1 = insert(:child, user: user, name: "Ana")
      _child2 = insert(:child, user: user, name: "Bruno")
      _other = insert(:child, name: "Other")

      children = Children.list_children(user.id)
      assert length(children) == 2
    end

    test "returns empty list when no children" do
      user = insert(:user)
      assert Children.list_children(user.id) == []
    end
  end

  describe "get_child/1" do
    test "returns child with preloaded measurements" do
      child = insert(:child)
      _measurement = insert(:measurement, child: child, weight_g: 5000)

      assert {:ok, result} = Children.get_child(child.id)
      assert result.id == child.id
      assert length(result.measurements) == 1
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.get_child(999_999)
    end
  end

  describe "create_child/1" do
    test "creates child with valid attrs" do
      user = insert(:user)
      attrs = %{name: "Sofia", birth_date: ~D[2023-06-15], birth_weight_g: 3200, birth_height_cm: 50, user_id: user.id}

      assert {:ok, child} = Children.create_child(attrs)
      assert child.name == "Sofia"
      assert child.birth_date == ~D[2023-06-15]
    end

    test "fails without required fields" do
      assert {:error, changeset} = Children.create_child(%{})
      assert %{name: _, birth_date: _, user_id: _} = errors_on(changeset)
    end
  end

  describe "update_child/2" do
    test "updates child attributes" do
      child = insert(:child, name: "Old Name")

      assert {:ok, updated} = Children.update_child(child.id, %{name: "New Name"})
      assert updated.name == "New Name"
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.update_child(999_999, %{name: "Nope"})
    end
  end

  describe "delete_child/1" do
    test "deletes an existing child" do
      child = insert(:child)
      assert {:ok, _} = Children.delete_child(child.id)
      assert {:error, :not_found} = Children.get_child(child.id)
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.delete_child(999_999)
    end
  end

  describe "list_measurements/1" do
    test "returns measurements ordered by recorded_at" do
      child = insert(:child)
      _m1 = insert(:measurement, child: child, recorded_at: ~U[2023-06-01 00:00:00Z], weight_g: 4000)
      _m2 = insert(:measurement, child: child, recorded_at: ~U[2023-09-01 00:00:00Z], weight_g: 6000)
      _m3 = insert(:measurement, child: child, recorded_at: ~U[2023-12-01 00:00:00Z], weight_g: 8000)

      measurements = Children.list_measurements(child.id)
      assert length(measurements) == 3
      # Ordered by recorded_at desc
      assert Enum.map(measurements, & &1.recorded_at) == [
               ~U[2023-12-01 00:00:00Z],
               ~U[2023-09-01 00:00:00Z],
               ~U[2023-06-01 00:00:00Z]
             ]
    end
  end

  describe "add_measurement/1" do
    test "adds a measurement to a child" do
      child = insert(:child)
      attrs = %{recorded_at: DateTime.utc_now(), weight_g: 5500, height_cm: 62, clothing_size: "P", child_id: child.id}

      assert {:ok, measurement} = Children.add_measurement(attrs)
      assert measurement.weight_g == 5500
      assert measurement.child_id == child.id
    end

    test "fails without required fields" do
      assert {:error, changeset} = Children.add_measurement(%{})
      assert %{recorded_at: _, child_id: _} = errors_on(changeset)
    end
  end

  describe "get_measurement/1" do
    test "returns measurement by id" do
      measurement = insert(:measurement)
      assert {:ok, result} = Children.get_measurement(measurement.id)
      assert result.id == measurement.id
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.get_measurement(999_999)
    end
  end

  describe "update_measurement/2" do
    test "updates measurement attributes" do
      measurement = insert(:measurement, weight_g: 5000)

      assert {:ok, updated} = Children.update_measurement(measurement.id, %{weight_g: 6000})
      assert updated.weight_g == 6000
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.update_measurement(999_999, %{weight_g: 1000})
    end
  end

  describe "delete_measurement/1" do
    test "deletes an existing measurement" do
      measurement = insert(:measurement)
      assert {:ok, _} = Children.delete_measurement(measurement.id)
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Children.delete_measurement(999_999)
    end
  end
end
