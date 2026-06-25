defmodule Api.Controllers.ChildrenController do
  @moduledoc """
  Controller for children and measurement endpoints.
  """

  import Plug.Conn
  alias Api.Children

  # ── Children ──────────────────────────────────────────────

  @doc """
  GET /users/:user_id/children — List children for a user.
  """
  def index(conn, user_id) do
    children = Children.list_children(user_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{children: Enum.map(children, &child_json/1)}))
  end

  @doc """
  GET /children/:id — Get a single child with measurements.
  """
  def show(conn, id) do
    case Children.get_child(id) do
      {:ok, child} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{child: child_json(child)}))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))
    end
  end

  @doc """
  POST /children — Create a new child.
  """
  def create(conn) do
    case Children.create_child(conn.body_params) do
      {:ok, child} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(%{child: child_json(child)}))

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
  PATCH /children/:id — Update a child.
  """
  def update(conn, id) do
    case Children.update_child(id, conn.body_params) do
      {:ok, child} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{child: child_json(child)}))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))

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
  DELETE /children/:id — Delete a child.
  """
  def delete(conn, id) do
    case Children.delete_child(id) do
      {:ok, _child} ->
        send_resp(conn, 204, "")

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))
    end
  end

  # ── Measurements ──────────────────────────────────────────

  @doc """
  GET /children/:child_id/measurements — List measurements for a child.
  """
  def list_measurements(conn, child_id) do
    measurements = Children.list_measurements(child_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{measurements: Enum.map(measurements, &measurement_json/1)}))
  end

  @doc """
  POST /children/:child_id/measurements — Add a measurement.
  """
  def add_measurement(conn, child_id) do
    attrs = Map.put(conn.body_params, "child_id", child_id)

    case Children.add_measurement(attrs) do
      {:ok, measurement} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(%{measurement: measurement_json(measurement)}))

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
  PATCH /measurements/:id — Update a measurement.
  """
  def update_measurement(conn, id) do
    case Children.update_measurement(id, conn.body_params) do
      {:ok, measurement} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{measurement: measurement_json(measurement)}))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))

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
  DELETE /measurements/:id — Delete a measurement.
  """
  def delete_measurement(conn, id) do
    case Children.delete_measurement(id) do
      {:ok, _measurement} ->
        send_resp(conn, 204, "")

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "not found"}))
    end
  end

  # ── JSON Helpers ──────────────────────────────────────────

  defp child_json(child) do
    base = %{
      id: child.id,
      name: child.name,
      document: child.document,
      birth_date: child.birth_date,
      birth_weight_g: child.birth_weight_g,
      birth_height_cm: child.birth_height_cm,
      user_id: child.user_id,
      inserted_at: child.inserted_at
    }

    if Ecto.assoc_loaded?(child.measurements) do
      Map.put(base, :measurements, Enum.map(child.measurements, &measurement_json/1))
    else
      base
    end
  end

  defp measurement_json(measurement) do
    %{
      id: measurement.id,
      recorded_at: measurement.recorded_at,
      weight_g: measurement.weight_g,
      height_cm: measurement.height_cm,
      clothing_size: measurement.clothing_size,
      child_id: measurement.child_id,
      inserted_at: measurement.inserted_at
    }
  end
end
