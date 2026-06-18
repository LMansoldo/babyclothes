defmodule Api.ItemsTest do
  use Api.DataCase, async: true

  alias Api.Items

  describe "list_items/0" do
    test "returns all items" do
      _item1 = insert(:item, title: "Item A")
      _item2 = insert(:item, title: "Item B")

      items = Items.list_items()
      assert length(items) == 2
    end

    test "returns empty list when no items" do
      assert Items.list_items() == []
    end
  end

  describe "list_items/1 with filters" do
    test "filters by category" do
      _body = insert(:item, category: "body")
      _macacao = insert(:item, category: "macacao")

      items = Items.list_items(%{"category" => "body"})
      assert length(items) == 1
      assert hd(items).category == "body"
    end

    test "filters by gender" do
      _male = insert(:item, gender: :male)
      _female = insert(:item, gender: :female)

      items = Items.list_items(%{"gender" => "male"})
      assert length(items) == 1
      assert hd(items).gender == :male
    end

    test "filters by condition" do
      _new = insert(:item, condition: :new)
      _used = insert(:item, condition: :used)

      items = Items.list_items(%{"condition" => "new"})
      assert length(items) == 1
      assert hd(items).condition == :new
    end

    test "filters by clothing_size" do
      _p = insert(:item, clothing_size: "P")
      _m = insert(:item, clothing_size: "M")

      items = Items.list_items(%{"clothing_size" => "P"})
      assert length(items) == 1
      assert hd(items).clothing_size == "P"
    end

    test "filters by max_price" do
      _cheap = insert(:item, price_cents: 2000)
      _expensive = insert(:item, price_cents: 5000)

      items = Items.list_items(%{"max_price" => 3000})
      assert length(items) == 1
      assert hd(items).price_cents == 2000
    end

    test "ignores empty filter values" do
      _item = insert(:item, category: "body")

      items = Items.list_items(%{"category" => ""})
      assert length(items) == 1
    end
  end

  describe "get_item/1" do
    test "returns item with preloaded photos" do
      item = insert(:item)
      _photo = insert(:photo, item: item, url: "photo.jpg", position: 0)

      assert {:ok, result} = Items.get_item(item.id)
      assert result.id == item.id
      assert length(result.photos) == 1
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Items.get_item(999_999)
    end
  end

  describe "create_item/1" do
    test "creates item with valid attrs" do
      seller = insert(:user)
      attrs = %{title: "New Item", category: "body", gender: :unisex, clothing_size: "M", condition: :new, price_cents: 3500, seller_id: seller.id}

      assert {:ok, item} = Items.create_item(attrs)
      assert item.title == "New Item"
      assert item.status == :active
    end

    test "fails without required fields" do
      assert {:error, changeset} = Items.create_item(%{})
      assert %{title: _, category: _, gender: _, clothing_size: _, condition: _, price_cents: _, seller_id: _} = errors_on(changeset)
    end

    test "fails with price_cents <= 0" do
      seller = insert(:user)
      attrs = %{title: "Bad", category: "body", gender: :unisex, clothing_size: "M", condition: :new, price_cents: 0, seller_id: seller.id}

      assert {:error, changeset} = Items.create_item(attrs)
      assert %{price_cents: _} = errors_on(changeset)
    end
  end

  describe "update_item/2" do
    test "updates item attributes" do
      item = insert(:item, title: "Old Title", price_cents: 1000)

      assert {:ok, updated} = Items.update_item(item.id, %{title: "New Title", price_cents: 2000})
      assert updated.title == "New Title"
      assert updated.price_cents == 2000
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Items.update_item(999_999, %{title: "Nope"})
    end
  end

  describe "delete_item/1" do
    test "deletes an existing item" do
      item = insert(:item)
      assert {:ok, _} = Items.delete_item(item.id)
      assert {:error, :not_found} = Items.get_item(item.id)
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Items.delete_item(999_999)
    end
  end

  describe "list_items_by_seller/1" do
    test "returns items for a specific seller" do
      seller = insert(:user)
      _item1 = insert(:item, seller: seller, title: "Seller Item 1")
      _item2 = insert(:item, seller: seller, title: "Seller Item 2")
      _other = insert(:item, title: "Other Item")

      items = Items.list_items_by_seller(seller.id)
      assert length(items) == 2
    end
  end

  describe "add_photo/1" do
    test "adds a photo to an item" do
      item = insert(:item)
      attrs = %{url: "https://cdn.example.com/photo.jpg", position: 0, item_id: item.id}

      assert {:ok, photo} = Items.add_photo(attrs)
      assert photo.url == "https://cdn.example.com/photo.jpg"
      assert photo.item_id == item.id
    end

    test "fails without url" do
      item = insert(:item)
      attrs = %{position: 0, item_id: item.id}

      assert {:error, changeset} = Items.add_photo(attrs)
      assert %{url: _} = errors_on(changeset)
    end
  end

  describe "list_photos/1" do
    test "returns photos ordered by position" do
      item = insert(:item)
      _p2 = insert(:photo, item: item, url: "p2.jpg", position: 2)
      _p0 = insert(:photo, item: item, url: "p0.jpg", position: 0)
      _p1 = insert(:photo, item: item, url: "p1.jpg", position: 1)

      photos = Items.list_photos(item.id)
      assert length(photos) == 3
      assert Enum.map(photos, & &1.position) == [0, 1, 2]
    end
  end

  describe "delete_photo/1" do
    test "deletes an existing photo" do
      photo = insert(:photo)
      assert {:ok, _} = Items.delete_photo(photo.id)
    end

    test "returns error when not found" do
      assert {:error, :not_found} = Items.delete_photo(999_999)
    end
  end
end
