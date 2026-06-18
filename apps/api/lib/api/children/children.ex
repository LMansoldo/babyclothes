defmodule Api.Children do
  @moduledoc """
  Context for managing children and their measurements.
  """

  import Ecto.Query
  alias Api.Repo
  alias Api.Children.Child
  alias Api.Children.Measurement

  # ── Children ──────────────────────────────────────────────

  @doc """
  List children for a user.
  """
  def list_children(user_id) do
    Child
    |> where(user_id: ^user_id)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  @doc """
  Get a single child by ID, preloading measurements.
  """
  def get_child(id) do
    case Repo.get(Child, id) do
      nil -> {:error, :not_found}
      child -> {:ok, Repo.preload(child, :measurements)}
    end
  end

  @doc """
  Create a new child.
  """
  def create_child(attrs) do
    %Child{}
    |> Child.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Update a child.
  """
  def update_child(id, attrs) do
    case get_child(id) do
      {:ok, child} ->
        child
        |> Child.changeset(attrs)
        |> Repo.update()

      error ->
        error
    end
  end

  @doc """
  Delete a child.
  """
  def delete_child(id) do
    case get_child(id) do
      {:ok, child} ->
        Repo.delete(child)

      error ->
        error
    end
  end

  # ── Measurements ──────────────────────────────────────────

  @doc """
  Add a measurement to a child.
  """
  def add_measurement(attrs) do
    %Measurement{}
    |> Measurement.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  List measurements for a child, ordered by recorded_at.
  """
  def list_measurements(child_id) do
    Measurement
    |> where(child_id: ^child_id)
    |> order_by(desc: :recorded_at)
    |> Repo.all()
  end

  @doc """
  Get a single measurement.
  """
  def get_measurement(id) do
    case Repo.get(Measurement, id) do
      nil -> {:error, :not_found}
      measurement -> {:ok, measurement}
    end
  end

  @doc """
  Update a measurement.
  """
  def update_measurement(id, attrs) do
    case get_measurement(id) do
      {:ok, measurement} ->
        measurement
        |> Measurement.changeset(attrs)
        |> Repo.update()

      error ->
        error
    end
  end

  @doc """
  Delete a measurement.
  """
  def delete_measurement(id) do
    case Repo.get(Measurement, id) do
      nil -> {:error, :not_found}
      measurement -> Repo.delete(measurement)
    end
  end
end
