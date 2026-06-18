defmodule Api.Controllers.CatalogControllerTest do
  use Api.ConnCase, async: true

  describe "GET /catalog" do
    test "returns empty sections when no items" do
      conn = conn(:get, "/catalog") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)
      assert body["sections"]["trending"] == []
      assert body["sections"]["newborn"] == []
      assert body["sections"]["bodys"] == []
      assert body["sections"]["macacoes"] == []
      assert body["sections"]["under_50"] == []
    end

    test "returns items in correct sections" do
      _trending = insert(:item, title: "Trending Item", category: "body", clothing_size: "M", price_cents: 3000)
      _newborn = insert(:item, title: "Newborn Item", clothing_size: "RN", price_cents: 2000)
      _body = insert(:item, title: "Body Item", category: "body", clothing_size: "P", price_cents: 4000)
      _macacao = insert(:item, title: "Macacao Item", category: "macacao", clothing_size: "M", price_cents: 6000)
      _cheap = insert(:item, title: "Cheap Item", category: "body", clothing_size: "P", price_cents: 1500)

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      assert conn.status == 200
      body = Jason.decode!(conn.resp_body)

      assert length(body["sections"]["trending"]) == 5
      assert length(body["sections"]["newborn"]) == 1
      assert length(body["sections"]["bodys"]) == 4  # trending, newborn, body, cheap all have category "body"
      assert length(body["sections"]["macacoes"]) == 1
      assert length(body["sections"]["under_50"]) == 4
    end

    test "excludes sold and removed items" do
      _active = insert(:item, title: "Active", status: :active, price_cents: 1000)
      _sold = insert(:item, title: "Sold", status: :sold, price_cents: 1000)
      _removed = insert(:item, title: "Removed", status: :removed, price_cents: 1000)

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = Jason.decode!(conn.resp_body)

      trending_titles = Enum.map(body["sections"]["trending"], & &1["title"])
      assert "Active" in trending_titles
      refute "Sold" in trending_titles
      refute "Removed" in trending_titles
    end

    test "limits each section to 10 items" do
      for i <- 1..15 do
        insert(:item, title: "Item #{i}", category: "body", clothing_size: "M", price_cents: 3000)
      end

      conn = conn(:get, "/catalog") |> Api.Router.call([])
      body = Jason.decode!(conn.resp_body)

      assert length(body["sections"]["trending"]) == 10
      assert length(body["sections"]["bodys"]) == 10
    end
  end
end
