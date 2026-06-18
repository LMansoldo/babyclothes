defmodule Api.FeatureFlagsTest do
  use Api.DataCase, async: true

  alias Api.FeatureFlags

  describe "list_flags/0" do
    test "returns all feature flags" do
      _flag1 = insert(:feature_flag, key: "flag_a", enabled: true)
      _flag2 = insert(:feature_flag, key: "flag_b", enabled: false)

      flags = FeatureFlags.list_flags()
      assert length(flags) == 2
      assert Enum.any?(flags, &(&1.key == "flag_a"))
      assert Enum.any?(flags, &(&1.key == "flag_b"))
    end

    test "returns empty list when no flags exist" do
      assert FeatureFlags.list_flags() == []
    end
  end

  describe "get_flag/1" do
    test "returns flag when it exists" do
      _flag = insert(:feature_flag, key: "test_flag", enabled: true, description: "A test")

      assert {:ok, result} = FeatureFlags.get_flag("test_flag")
      assert result.key == "test_flag"
      assert result.enabled == true
      assert result.description == "A test"
    end

    test "returns error when flag does not exist" do
      assert {:error, :not_found} = FeatureFlags.get_flag("nonexistent")
    end
  end

  describe "enabled?/1" do
    test "returns true when flag is enabled" do
      insert(:feature_flag, key: "enabled_flag", enabled: true)
      assert FeatureFlags.enabled?("enabled_flag") == true
    end

    test "returns false when flag is disabled" do
      insert(:feature_flag, key: "disabled_flag", enabled: false)
      assert FeatureFlags.enabled?("disabled_flag") == false
    end

    test "returns false when flag does not exist" do
      assert FeatureFlags.enabled?("missing_flag") == false
    end
  end

  describe "create_flag/1" do
    test "creates a flag with valid attrs" do
      attrs = %{key: "new_flag", enabled: true, description: "New feature"}
      assert {:ok, flag} = FeatureFlags.create_flag(attrs)
      assert flag.key == "new_flag"
      assert flag.enabled == true
      assert flag.description == "New feature"
    end

    test "creates a flag with defaults" do
      attrs = %{key: "minimal_flag"}
      assert {:ok, flag} = FeatureFlags.create_flag(attrs)
      assert flag.key == "minimal_flag"
      assert flag.enabled == false
      assert flag.description == nil
    end

    test "fails without key" do
      attrs = %{enabled: true}
      assert {:error, changeset} = FeatureFlags.create_flag(attrs)
      assert %{key: _} = errors_on(changeset)
    end

    test "fails with duplicate key" do
      insert(:feature_flag, key: "duplicate")
      attrs = %{key: "duplicate"}
      assert {:error, changeset} = FeatureFlags.create_flag(attrs)
      assert %{key: _} = errors_on(changeset)
    end
  end

  describe "update_flag/2" do
    test "updates flag attributes" do
      _flag = insert(:feature_flag, key: "update_me", enabled: false, description: "Old")

      assert {:ok, updated} = FeatureFlags.update_flag("update_me", %{enabled: true, description: "New"})
      assert updated.enabled == true
      assert updated.description == "New"
    end

    test "returns error when flag not found" do
      assert {:error, :not_found} = FeatureFlags.update_flag("nope", %{enabled: true})
    end
  end

  describe "toggle_flag/1" do
    test "toggles from false to true" do
      insert(:feature_flag, key: "toggle_me", enabled: false)
      assert {:ok, flag} = FeatureFlags.toggle_flag("toggle_me")
      assert flag.enabled == true
    end

    test "toggles from true to false" do
      insert(:feature_flag, key: "toggle_me", enabled: true)
      assert {:ok, flag} = FeatureFlags.toggle_flag("toggle_me")
      assert flag.enabled == false
    end

    test "returns error when flag not found" do
      assert {:error, :not_found} = FeatureFlags.toggle_flag("nope")
    end
  end

  describe "delete_flag/1" do
    test "deletes an existing flag" do
      insert(:feature_flag, key: "delete_me")
      assert {:ok, _} = FeatureFlags.delete_flag("delete_me")
      assert {:error, :not_found} = FeatureFlags.get_flag("delete_me")
    end

    test "returns error when flag not found" do
      assert {:error, :not_found} = FeatureFlags.delete_flag("nope")
    end
  end
end
