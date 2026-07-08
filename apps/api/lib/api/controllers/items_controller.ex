defmodule Api.Controllers.ItemsController do
  @moduledoc """
  Controller for items (listings) endpoints.
  """

  import Plug.Conn
  alias Api.Items
  alias Api.Repo
  alias Api.Storage
  alias Api.Users.User
  alias Api.Plugs.Auth
  alias Api.Auth.Guard

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

  Requires JWT authentication. Automatically activates the seller role
  for the user if not already set.
  """
  def create(conn) do
    with {:ok, claims} <- authenticate(conn),
         {:ok, item} <- Items.create_item(Map.put(conn.body_params, "seller_id", claims["sub"])),
         {:ok, _user} <- activate_seller(claims["sub"]) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(201, Jason.encode!(item_json(item)))
    else
      {:error, :unauthorized} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, Jason.encode!(%{error: "unauthorized"}))

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
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Items.get_item(id) do
        {:ok, item} ->
          conn = Guard.require_owner(conn, item.seller_id)

          if conn.halted do
            conn
          else
            case Items.update_item(id, conn.body_params) do
              {:ok, item} ->
                conn
                |> put_resp_content_type("application/json")
                |> send_resp(200, Jason.encode!(item_json(item)))

              {:error, changeset} ->
                errors = format_changeset_errors(changeset)

                conn
                |> put_resp_content_type("application/json")
                |> send_resp(422, Jason.encode!(%{errors: errors}))
            end
          end

        {:error, :not_found} ->
          item_not_found(conn)
      end
    end
  end

  @doc """
  DELETE /items/:id — Delete an item.
  """
  def delete(conn, id) do
    conn = Auth.call(conn, [])

    if conn.halted do
      conn
    else
      case Items.get_item(id) do
        {:ok, item} ->
          conn = Guard.require_owner(conn, item.seller_id)

          if conn.halted do
            conn
          else
            {:ok, _item} = Items.delete_item(id)
            send_resp(conn, 204, "")
          end

        {:error, :not_found} ->
          item_not_found(conn)
      end
    end
  end

  defp item_not_found(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "item_not_found"}))
  end

  @doc """
  POST /items/:id/photos — Generate an upload URL and create a photo record.

  Returns presigned `upload_url` for direct S3 PUT and the created `photo` record.
  """
  def add_photo(conn, item_id) do
    with {:ok, upload_url, photo_url} <- Storage.generate_upload_url(item_id),
         photo_params <- %{"url" => photo_url, "item_id" => item_id},
         {:ok, photo} <- Items.add_photo(photo_params) do
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(201, Jason.encode!(%{upload_url: upload_url, photo: photo_json(photo)}))
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        errors = format_changeset_errors(changeset)

        conn
        |> put_resp_content_type("application/json")
        |> send_resp(422, Jason.encode!(%{errors: errors}))

      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(500, Jason.encode!(%{error: inspect(reason)}))
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

  defp authenticate(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> Api.Auth.verify_internal_token(token)
      _ -> {:error, :unauthorized}
    end
  end

  defp activate_seller(user_id) do
    user = Repo.get!(User, user_id)

    if user.is_seller do
      {:ok, user}
    else
      user
      |> Ecto.Changeset.change(%{is_seller: true})
      |> Repo.update()
    end
  end

  defp item_json(item) do
    %{
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
    |> put_photos(item)
    |> put_seller(item)
  end

  defp put_photos(json, %{photos: photos}) when is_list(photos) do
    Map.put(json, :photos, Enum.map(photos, &photo_json/1))
  end

  defp put_photos(json, _item), do: json

  defp put_seller(json, %{seller: %User{} = seller}) do
    Map.put(json, :seller, %{
      id: seller.id,
      name: seller.name,
      avatar_url: seller.avatar_url,
      verified: seller.is_seller
    })
  end

  defp put_seller(json, _item), do: json

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
