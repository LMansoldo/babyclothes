defmodule Api.Controllers.ChildrenController do
  @moduledoc """
  Controller for children and measurement endpoints.
  """

  import Plug.Conn
  alias Api.Children
  alias Api.Plugs.Auth
  alias Api.Auth.Guard

  # ── Children ──────────────────────────────────────────────

  @doc """
  GET /users/:user_id/children — List children for a user.
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
        children = Children.list_children(user_id)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{children: Enum.map(children, &child_json/1)}))
      end
    end
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
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      attrs = Map.put(conn.body_params, "user_id", conn.assigns.current_user_id)

      case Children.create_child(attrs) do
        {:ok, child} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(201, Jason.encode!(%{child: child_json(child)}))

        {:error, changeset} ->
          send_changeset_error(conn, changeset)
      end
    end
  end

  @doc """
  PATCH /children/:id — Update a child.
  """
  def update(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Children.get_child(id) do
        {:ok, child} ->
          conn = Guard.require_owner(conn, child.user_id)

          if conn.halted do
            conn
          else
            case Children.update_child(id, conn.body_params) do
              {:ok, child} ->
                conn
                |> put_resp_content_type("application/json")
                |> send_resp(200, Jason.encode!(%{child: child_json(child)}))

              {:error, changeset} ->
                send_changeset_error(conn, changeset)
            end
          end

        {:error, :not_found} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(404, Jason.encode!(%{error: "not found"}))
      end
    end
  end

  @doc """
  DELETE /children/:id — Delete a child.
  """
  def delete(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Children.get_child(id) do
        {:ok, child} ->
          conn = Guard.require_owner(conn, child.user_id)

          if conn.halted do
            conn
          else
            {:ok, _child} = Children.delete_child(id)
            send_resp(conn, 204, "")
          end

        {:error, :not_found} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(404, Jason.encode!(%{error: "not found"}))
      end
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
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Children.get_child(child_id) do
        {:ok, child} ->
          conn = Guard.require_owner(conn, child.user_id)

          if conn.halted do
            conn
          else
            attrs = Map.put(conn.body_params, "child_id", child_id)

            case Children.add_measurement(attrs) do
              {:ok, measurement} ->
                Api.Workers.GrowthCheckWorker.schedule(child_id)

                conn
                |> put_resp_content_type("application/json")
                |> send_resp(201, Jason.encode!(%{measurement: measurement_json(measurement)}))

              {:error, changeset} ->
                send_changeset_error(conn, changeset)
            end
          end

        {:error, :not_found} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(404, Jason.encode!(%{error: "not found"}))
      end
    end
  end

  @doc """
  PATCH /measurements/:id — Update a measurement.
  """
  def update_measurement(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Children.get_measurement(id) do
        {:ok, measurement} ->
          owner_id = measurement_owner_id(measurement)
          conn = Guard.require_owner(conn, owner_id)

          if conn.halted do
            conn
          else
            case Children.update_measurement(id, conn.body_params) do
              {:ok, measurement} ->
                conn
                |> put_resp_content_type("application/json")
                |> send_resp(200, Jason.encode!(%{measurement: measurement_json(measurement)}))

              {:error, changeset} ->
                send_changeset_error(conn, changeset)
            end
          end

        {:error, :not_found} ->
          send_not_found(conn)
      end
    end
  end

  @doc """
  DELETE /measurements/:id — Delete a measurement.
  """
  def delete_measurement(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Children.get_measurement(id) do
        {:ok, measurement} ->
          owner_id = measurement_owner_id(measurement)
          conn = Guard.require_owner(conn, owner_id)

          if conn.halted do
            conn
          else
            {:ok, _measurement} = Children.delete_measurement(id)
            send_resp(conn, 204, "")
          end

        {:error, :not_found} ->
          send_not_found(conn)
      end
    end
  end

  # ── Private Helpers ───────────────────────────────────────

  defp measurement_owner_id(measurement) do
    measurement = Api.Repo.preload(measurement, :child)
    measurement.child.user_id
  end

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
