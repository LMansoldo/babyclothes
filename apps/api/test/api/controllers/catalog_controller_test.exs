defmodule Api.Controllers.CatalogControllerTest do
  use Api.ConnCase, async: true

  import Ecto.Query

  setup do
    Repo.delete_all(from(p in Api.Items.Photo))
    Repo.delete_all(from(i in Api.Items.Item))
    :ok
  end

  describe "GET /catalog" do
    test "returns empty items and correct pagination when no items exist" do
      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert body["items"] == []
      assert body["pagination"]["page"] == 1
      assert body["pagination"]["per_page"] == 20
      assert body["pagination"]["total"] == 0
      assert body["pagination"]["total_pages"] == 0
    end

    test "returns only active items, excludes sold and removed" do
      insert(:item, title: "Active", status: :active)
      insert(:item, title: "Sold", status: :sold)
      insert(:item, title: "Removed", status: :removed)

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = json_response(conn, 200)

      titles = Enum.map(body["items"], & &1["title"])
      assert "Active" in titles
      refute "Sold" in titles
      refute "Removed" in titles
    end

    test "filters by category" do
      insert(:item, title: "Body Item", category: "body")
      insert(:item, title: "Macacao Item", category: "macacao")

      conn = conn(:get, "/catalog?category=body") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["category"] == "body"
    end

    test "filters by gender" do
      insert(:item, title: "Female Item", gender: :female)
      insert(:item, title: "Male Item", gender: :male)

      conn = conn(:get, "/catalog?gender=female") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["gender"] == "female"
    end

    test "filters by size" do
      insert(:item, title: "RN Item", clothing_size: "RN")
      insert(:item, title: "M Item", clothing_size: "M")

      conn = conn(:get, "/catalog?size=RN") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["clothing_size"] == "RN"
    end

    test "filters by condition" do
      insert(:item, title: "New Item", condition: :new)
      insert(:item, title: "Used Item", condition: :used)

      conn = conn(:get, "/catalog?condition=new") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["condition"] == "new"
    end

    test "filters by min_price" do
      insert(:item, title: "Cheap", price_cents: 1000)
      insert(:item, title: "Expensive", price_cents: 5000)

      conn = conn(:get, "/catalog?min_price=3000") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["title"] == "Expensive"
    end

    test "filters by max_price" do
      insert(:item, title: "Cheap", price_cents: 1000)
      insert(:item, title: "Expensive", price_cents: 5000)

      conn = conn(:get, "/catalog?max_price=3000") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["title"] == "Cheap"
    end

    test "filters by min_price and max_price combined" do
      insert(:item, title: "Too Cheap", price_cents: 500)
      insert(:item, title: "Just Right", price_cents: 3000)
      insert(:item, title: "Too Expensive", price_cents: 8000)

      conn = conn(:get, "/catalog?min_price=1000&max_price=5000") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["title"] == "Just Right"
    end

    test "combines multiple different filters" do
      insert(:item, title: "Match", category: "body", gender: :female, clothing_size: "M")
      insert(:item, title: "Wrong Category", category: "macacao", gender: :female, clothing_size: "M")
      insert(:item, title: "Wrong Gender", category: "body", gender: :male, clothing_size: "M")
      insert(:item, title: "Wrong Size", category: "body", gender: :female, clothing_size: "P")

      conn = conn(:get, "/catalog?category=body&gender=female&size=M") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 1
      assert hd(body["items"])["title"] == "Match"
    end

    test "pagination returns correct page and items" do
      for i <- 1..25 do
        insert(:item, title: "Item #{String.pad_leading(Integer.to_string(i), 2, "0")}")
      end

      conn = conn(:get, "/catalog?page=1&per_page=10") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert length(body["items"]) == 10
      assert body["pagination"]["page"] == 1
      assert body["pagination"]["per_page"] == 10
      assert body["pagination"]["total"] == 25
      assert body["pagination"]["total_pages"] == 3
    end

    test "per_page above 50 is clamped to 50" do
      for i <- 1..60 do
        insert(:item, title: "Item #{String.pad_leading(Integer.to_string(i), 2, "0")}")
      end

      conn = conn(:get, "/catalog?per_page=100") |> Api.Router.call([])
      body = json_response(conn, 200)

      assert body["pagination"]["per_page"] == 50
      assert length(body["items"]) == 50
    end

    test "returns photo_url from first photo" do
      seller = insert(:user)
      item = insert(:item, seller: seller)
      insert(:photo, item: item, url: "https://cdn.example.com/first.jpg", position: 0)
      insert(:photo, item: item, url: "https://cdn.example.com/second.jpg", position: 1)

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = json_response(conn, 200)

      item_data = hd(body["items"])
      assert item_data["photo_url"] == "https://cdn.example.com/first.jpg"
    end

    test "returns nested seller object" do
      seller = insert(:user, name: "Maria", avatar_url: "https://example.com/maria.png")
      insert(:item, seller: seller)

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = json_response(conn, 200)

      item_data = hd(body["items"])
      assert item_data["seller"]["name"] == "Maria"
      assert item_data["seller"]["avatar_url"] == "https://example.com/maria.png"
      refute Map.has_key?(item_data, "seller_id")
    end
  end
end
