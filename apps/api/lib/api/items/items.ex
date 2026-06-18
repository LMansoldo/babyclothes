defmodule Api.Items do
  @moduledoc """
  Context for managing items (listings) and photos.
  """

  import Ecto.Query
  alias Api.Repo
  alias Api.Items.Item
  alias Api.Items.Photo

  # ── Items ──────────────────────────────────────────────────

  @doc """
  List items with optional filters.
  """
  def list_items(filters \\ %{}) do
    Item
    |> apply_filters(filters)
    |> order_by(desc: :inserted_at)
    |> Repo.all()
  end

  @doc """
  Get a single item by ID, preloading photos.
  """
  def get_item(id) do
    case Repo.get(Item, id) do
      nil -> {:error, :not_found}
      item -> {:ok, Repo.preload(item, :photos)}
    end
  end

  @doc """
  Create a new item.
  """
  def create_item(attrs) do
    %Item{}
    |> Item.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Update an item.
  """
  def update_item(id, attrs) do
    case get_item(id) do
      {:ok, item} ->
        item
        |> Item.changeset(attrs)
        |> Repo.update()

      error ->
        error
    end
  end

  @doc """
  Delete an item.
  """
  def delete_item(id) do
    case get_item(id) do
      {:ok, item} ->
        Repo.delete(item)

      error ->
        error
    end
  end

  @doc """
  List items by seller.
  """
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
  def add_photo(attrs) do
    %Photo{}
    |> Photo.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  List photos for an item, ordered by position.
  """
  def list_photos(item_id) do
    Photo
    |> where(item_id: ^item_id)
    |> order_by(asc: :position)
    |> Repo.all()
  end

  @doc """
  Delete a photo.
  """
  def delete_photo(photo_id) do
    case Repo.get(Photo, photo_id) do
      nil -> {:error, :not_found}
      photo -> Repo.delete(photo)
    end
  end

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

      {"max_price", max}, q when is_integer(max) ->
        where(q, [i], i.price_cents <= ^max)

      {"max_price", max}, q when is_binary(max) ->
        case Integer.parse(max) do
          {int, ""} -> where(q, [i], i.price_cents <= ^int)
          _ -> q
        end

      _, q ->
        q
    end)
  end
end
