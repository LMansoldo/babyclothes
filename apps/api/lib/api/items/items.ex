defmodule Api.Items do
  @moduledoc """
  Context for managing items (listings) and photos.
  """

  import Ecto.Query
  alias Api.Repo
  alias Api.Items.Item
  alias Api.Items.Photo

  @default_page 1
  @default_per_page 20
  @max_per_page 50

  # ── Items ──────────────────────────────────────────────────

  @doc """
  List items with optional filters.
  """
  @spec list_items(map()) :: [Item.t()]
  def list_items(filters \\ %{}) do
    Item
    |> apply_filters(filters)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  @doc """
  List catalog items with dynamic filters and pagination.

  Always filters by `status: :active`, preloads `:photos` and `:seller`.

  Returns `{items, pagination_meta}` where `pagination_meta` is a map
  containing `:page`, `:per_page`, `:total`, and `:total_pages`.
  """
  @spec list_catalog(map()) :: {[Item.t()], map()}
  def list_catalog(params \\ %{}) do
    page = parse_page(params["page"])
    per_page = parse_per_page(params["per_page"])

    filters = build_catalog_filters(params)
    base_query = build_base_query(filters)

    total = count_total(base_query)
    items = fetch_page(base_query, page, per_page)
    pagination = build_pagination(page, per_page, total)

    {items, pagination}
  end

  @doc """
  Get a single item by ID, preloading photos and seller.
  """
  @spec get_item(integer()) :: {:ok, Item.t()} | {:error, :not_found}
  def get_item(id) do
    case Repo.get(Item, id) do
      nil -> {:error, :not_found}
      item -> {:ok, Repo.preload(item, [:photos, :seller])}
    end
  end

  @doc """
  Create a new item.
  """
  @spec create_item(map()) :: {:ok, Item.t()} | {:error, Ecto.Changeset.t()}
  def create_item(attrs) do
    %Item{}
    |> Item.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Update an item.
  """
  @spec update_item(integer(), map()) :: {:ok, Item.t()} | {:error, Ecto.Changeset.t() | :not_found}
  def update_item(id, attrs) do
    case get_item(id) do
      {:ok, item} -> item |> Item.changeset(attrs) |> Repo.update()
      error -> error
    end
  end

  @doc """
  Delete an item.
  """
  @spec delete_item(integer()) :: {:ok, Item.t()} | {:error, :not_found}
  def delete_item(id) do
    case get_item(id) do
      {:ok, item} -> Repo.delete(item)
      error -> error
    end
  end

  @doc """
  List items by seller.
  """
  @spec list_items_by_seller(integer()) :: [Item.t()]
  def list_items_by_seller(seller_id) do
    Item
    |> where(seller_id: ^seller_id)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  # ── Photos ─────────────────────────────────────────────────

  @doc """
  Add a photo to an item.
  """
  @spec add_photo(map()) :: {:ok, Photo.t()} | {:error, Ecto.Changeset.t()}
  def add_photo(attrs) do
    %Photo{}
    |> Photo.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  List photos for an item, ordered by position.
  """
  @spec list_photos(integer()) :: [Photo.t()]
  def list_photos(item_id) do
    Photo
    |> where(item_id: ^item_id)
    |> order_by(asc: :position)
    |> Repo.all()
  end

  @doc """
  Delete a photo.
  """
  @spec delete_photo(integer()) :: {:ok, Photo.t()} | {:error, :not_found}
  def delete_photo(photo_id) do
    case Repo.get(Photo, photo_id) do
      nil -> {:error, :not_found}
      photo -> Repo.delete(photo)
    end
  end

  # ── Catalog Helpers ────────────────────────────────────────

  defp build_catalog_filters(params) do
    %{
      "status" => "active",
      "category" => params["category"],
      "gender" => params["gender"],
      "clothing_size" => params["size"],
      "condition" => params["condition"],
      "min_price" => params["min_price"],
      "max_price" => params["max_price"]
    }
  end

  defp build_base_query(filters) do
    Item
    |> apply_filters(filters)
    |> preload([:photos, :seller])
    |> order_by(desc: :inserted_at)
  end

  defp count_total(query) do
    query
    |> exclude(:preload)
    |> exclude(:order_by)
    |> Repo.aggregate(:count, :id)
  end

  defp fetch_page(query, page, per_page) do
    offset_value = (page - 1) * per_page

    query
    |> limit(^per_page)
    |> offset(^offset_value)
    |> Repo.all()
  end

  defp build_pagination(page, per_page, total) do
    %{
      page: page,
      per_page: per_page,
      total: total,
      total_pages: compute_total_pages(total, per_page)
    }
  end

  defp compute_total_pages(0, _per_page), do: 0

  defp compute_total_pages(total, per_page) do
    total
    |> Kernel./(per_page)
    |> Float.ceil()
    |> trunc()
  end

  defp parse_page(nil), do: @default_page
  defp parse_page(value) when is_integer(value) and value > 0, do: value

  defp parse_page(value) when is_binary(value) do
    case Integer.parse(value) do
      {int, ""} when int > 0 -> int
      _ -> @default_page
    end
  end

  defp parse_page(_), do: @default_page

  defp parse_per_page(nil), do: @default_per_page

  defp parse_per_page(value) when is_integer(value) do
    clamp_per_page(value)
  end

  defp parse_per_page(value) when is_binary(value) do
    case Integer.parse(value) do
      {int, ""} -> clamp_per_page(int)
      _ -> @default_per_page
    end
  end

  defp parse_per_page(_), do: @default_per_page

  defp clamp_per_page(value) when value > @max_per_page, do: @max_per_page
  defp clamp_per_page(value) when value < 1, do: @default_per_page
  defp clamp_per_page(value), do: value

  # ── Filters ────────────────────────────────────────────────

  defp apply_filters(query, filters) do
    Enum.reduce(filters, query, fn
      {"category", category}, q when is_binary(category) and category != "" ->
        where(q, category: ^category)

      {"gender", gender}, q when is_binary(gender) and gender != "" ->
        where(q, gender: ^String.to_existing_atom(gender))

      {"condition", condition}, q when is_binary(condition) and condition != "" ->
        where(q, condition: ^String.to_existing_atom(condition))

      {"clothing_size", size}, q when is_binary(size) and size != "" ->
        where(q, clothing_size: ^size)

      {"status", status}, q when is_binary(status) and status != "" ->
        where(q, status: ^String.to_existing_atom(status))

      {"min_price", min}, q when is_integer(min) ->
        where(q, [i], i.price_cents >= ^min)

      {"min_price", min}, q when is_binary(min) ->
        apply_min_price_filter(q, min)

      {"max_price", max}, q when is_integer(max) ->
        where(q, [i], i.price_cents <= ^max)

      {"max_price", max}, q when is_binary(max) ->
        apply_max_price_filter(q, max)

      _, q ->
        q
    end)
  end

  defp apply_min_price_filter(query, value) do
    case Integer.parse(value) do
      {int, ""} -> where(query, [i], i.price_cents >= ^int)
      _ -> query
    end
  end

  defp apply_max_price_filter(query, value) do
    case Integer.parse(value) do
      {int, ""} -> where(query, [i], i.price_cents <= ^int)
      _ -> query
    end
  end
end
