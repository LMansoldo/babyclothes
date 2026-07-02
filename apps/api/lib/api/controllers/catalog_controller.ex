defmodule Api.Controllers.CatalogController do
  @moduledoc """
  Controller for catalog endpoints.

  Delegates to `Api.Items.list_catalog/1` for filtered, paginated results.
  """

  import Plug.Conn
  alias Api.Items

  @doc """
  GET /catalog — Returns active items with filters and pagination.

  ## Query Parameters

    * `category` — filter by item category
    * `gender` — filter by gender (male, female, unisex)
    * `size` — filter by clothing size (maps to `clothing_size`)
    * `condition` — filter by condition (new, like_new, used)
    * `min_price` — minimum price in cents
    * `max_price` — maximum price in cents
    * `page` — page number (default: 1)
    * `per_page` — items per page (default: 20, max: 50)
  """
  @spec index(Plug.Conn.t()) :: Plug.Conn.t()
  def index(conn) do
    {items, pagination} = Items.list_catalog(conn.params)

    response = %{
      items: Enum.map(items, &catalog_item_json/1),
      pagination: pagination
    }

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(response))
  end

  defp catalog_item_json(item) do
    first_photo = List.first(item.photos)

    %{
      id: item.id,
      title: item.title,
      category: item.category,
      gender: to_string(item.gender),
      clothing_size: item.clothing_size,
      condition: to_string(item.condition),
      price_cents: item.price_cents,
      photo_url: extract_photo_url(first_photo),
      seller: format_seller(item.seller),
      inserted_at: item.inserted_at
    }
  end

  defp extract_photo_url(%{url: url}), do: url
  defp extract_photo_url(_), do: nil

  defp format_seller(%{id: id, name: name, avatar_url: avatar_url}) do
    %{id: id, name: name, avatar_url: avatar_url}
  end

  defp format_seller(_), do: nil
end
