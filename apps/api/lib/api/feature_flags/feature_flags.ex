defmodule Api.FeatureFlags do
  @moduledoc """
  Context for managing feature flags.
  """

  alias Api.Repo
  alias Api.FeatureFlags.FeatureFlag

  @doc """
  List all feature flags.
  """
  def list_flags do
    Repo.all(FeatureFlag)
  end

  @doc """
  Get a single feature flag by key.
  """
  def get_flag(key) do
    case Repo.get_by(FeatureFlag, key: key) do
      nil -> {:error, :not_found}
      flag -> {:ok, flag}
    end
  end

  @doc """
  Check if a feature flag is enabled.
  Returns false if the flag doesn't exist.
  """
  def enabled?(key) do
    case get_flag(key) do
      {:ok, %{enabled: enabled}} -> enabled
      {:error, :not_found} -> false
    end
  end

  @doc """
  Create a new feature flag.
  """
  def create_flag(attrs) do
    %FeatureFlag{}
    |> FeatureFlag.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Update a feature flag.
  """
  def update_flag(key, attrs) do
    case get_flag(key) do
      {:ok, flag} ->
        flag
        |> FeatureFlag.changeset(attrs)
        |> Repo.update()

      error ->
        error
    end
  end

  @doc """
  Toggle a feature flag's enabled state.
  """
  def toggle_flag(key) do
    case get_flag(key) do
      {:ok, flag} ->
        flag
        |> FeatureFlag.changeset(%{enabled: !flag.enabled})
        |> Repo.update()

      error ->
        error
    end
  end

  @doc """
  Delete a feature flag.
  """
  def delete_flag(key) do
    case get_flag(key) do
      {:ok, flag} ->
        Repo.delete(flag)

      error ->
        error
    end
  end
end
