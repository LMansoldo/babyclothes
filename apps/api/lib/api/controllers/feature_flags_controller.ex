defmodule Api.Controllers.FeatureFlagsController do
  @moduledoc """
  Controller for feature flag endpoints.
  """

  import Plug.Conn
  alias Api.FeatureFlags

  @doc """
  GET /feature-flags — List all feature flags.
  """
  def index(conn) do
    flags = FeatureFlags.list_flags()

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{flags: Enum.map(flags, &flag_json/1)}))
  end

  @doc """
  GET /feature-flags/:key — Get a single feature flag.
  """
  def show(conn, key) do
    case FeatureFlags.get_flag(key) do
      {:ok, flag} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(flag_json(flag)))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "flag_not_found"}))
    end
  end

  @doc """
  POST /feature-flags — Create a feature flag.
  """
  def create(conn) do
    case FeatureFlags.create_flag(conn.body_params) do
      {:ok, flag} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(flag_json(flag)))

      {:error, changeset} ->
        errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
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
  PATCH /feature-flags/:key — Update a feature flag.
  """
  def update(conn, key) do
    case FeatureFlags.update_flag(key, conn.body_params) do
      {:ok, flag} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(flag_json(flag)))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "flag_not_found"}))

      {:error, changeset} ->
        errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
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
  POST /feature-flags/:key/toggle — Toggle a feature flag.
  """
  def toggle(conn, key) do
    case FeatureFlags.toggle_flag(key) do
      {:ok, flag} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(flag_json(flag)))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "flag_not_found"}))
    end
  end

  @doc """
  DELETE /feature-flags/:key — Delete a feature flag.
  """
  def delete(conn, key) do
    case FeatureFlags.delete_flag(key) do
      {:ok, _flag} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(204, "")

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "flag_not_found"}))
    end
  end

  defp flag_json(flag) do
    %{
      id: flag.id,
      key: flag.key,
      enabled: flag.enabled,
      description: flag.description,
      inserted_at: flag.inserted_at,
      updated_at: flag.updated_at
    }
  end
end
