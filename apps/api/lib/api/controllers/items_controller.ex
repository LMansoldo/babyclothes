defmodule Api.Controllers.ItemsController do
  @moduledoc """
  Controller for items (listings) endpoints.
  """

  import Plug.Conn
  alias Api.Items

  @doc """
  GET /items — List items with optional filters.
  """
  def index(conn) do
    filters =
      conn.params
      |> Map.take(["category", "gender", "condition", "clothing_size", "status", "max_price"])

    items = Items.list_items(filters)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{items: Enum.map(items, &item_json/1)}))
  end

  @doc """
  GET /items/:id — Get a single item with photos.
  """
  def show(conn, id) do
    case Items.get_item(id) do
      {:ok, item} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(item_json(item)))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "item_not_found"}))
    end
  end

  @doc """
  POST /items — Create a new item.
  """
  def create(conn) do
    case Items.create_item(conn.body_params) do
      {:ok, item} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(item_json(item)))

      {:error, changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{errors: errors}))
    end
  end

  @doc """
  PATCH /items/:id — Update an item.
  """
  def update(conn, id) do
    case Items.update_item(id, conn.body_params) do
      {:ok, item} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(item_json(item)))

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "item_not_found"}))

      {:error, changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{errors: errors}))
    end
  end

  @doc """
  DELETE /items/:id — Delete an item.
  """
  def delete(conn, id) do
    case Items.delete_item(id) do
      {:ok, _item} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(204, "")

      {:error, :not_found} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(404, Jason.encode!(%{error: "item_not_found"}))
    end
  end

  @doc """
  POST /items/:id/photos — Add a photo to an item.
  """
  def add_photo(conn, item_id) do
    photo_params = Map.put(conn.body_params, "item_id", item_id)

    case Items.add_photo(photo_params) do
      {:ok, photo} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(201, Jason.encode!(photo_json(photo)))

      {:error, changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{errors: errors}))
    end
  end

  @doc """
  GET /items/:id/photos — List photos for an item.
  """
  def list_photos(conn, item_id) do
    photos = Items.list_photos(item_id)

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{photos: Enum.map(photos, &photo_json/1)}))
  end

  defp item_json(item) do
    base = %{
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      gender: to_string(item.gender),
      clothing_size: item.clothing_size,
      condition: to_string(item.condition),
      price_cents: item.price_cents,
      status: to_string(item.status),
      seller_id: item.seller_id,
      inserted_at: item.inserted_at,
      updated_at: item.updated_at
    }

    if Ecto.assoc_loaded?(item.photos) do
      Map.put(base, :photos, Enum.map(item.photos, &photo_json/1))
    else
      base
    end
  end

  defp photo_json(photo) do
    %{
      id: photo.id,
      url: photo.url,
      position: photo.position,
      item_id: photo.item_id,
      inserted_at: photo.inserted_at
    }
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
