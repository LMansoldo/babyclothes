defmodule Api.Controllers.CatalogController do
  @moduledoc """
  Controller for catalog endpoints.
  Returns items grouped by sections for the catalog page.
  """

  import Plug.Conn
  import Ecto.Query
  alias Api.Repo
  alias Api.Items.Item

  @doc """
  GET /catalog — Returns items grouped by sections.
  """
  def index(conn) do
    sections = %{
      trending: fetch_trending(),
      newborn: fetch_by_size("RN"),
      bodys: fetch_by_category("body"),
      macacoes: fetch_by_category("macacao"),
      under_50: fetch_under_price(5000)
    }

    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{sections: sections}))
  end

  defp fetch_trending do
    Item
    |> where(status: :active)
    |> order_by(desc: :inserted_at)
    |> limit(10)
    |> Repo.all()
    |> Enum.map(&item_json/1)
  end

  defp fetch_by_size(size) do
    Item
    |> where(status: :active, clothing_size: ^size)
    |> order_by(desc: :inserted_at)
    |> limit(10)
    |> Repo.all()
    |> Enum.map(&item_json/1)
  end

  defp fetch_by_category(category) do
    Item
    |> where(status: :active, category: ^category)
    |> order_by(desc: :inserted_at)
    |> limit(10)
    |> Repo.all()
    |> Enum.map(&item_json/1)
  end

  defp fetch_under_price(max_cents) do
    Item
    |> where(status: :active)
    |> where([i], i.price_cents < ^max_cents)
    |> order_by(asc: :price_cents)
    |> limit(10)
    |> Repo.all()
    |> Enum.map(&item_json/1)
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
      inserted_at: item.inserted_at
    }
  end
end
