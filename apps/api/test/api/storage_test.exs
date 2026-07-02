defmodule Api.StorageTest do
  use ExUnit.Case, async: true

  alias Api.Storage

  describe "generate_upload_url/1" do
    test "returns tuple with upload_url and photo_url" do
      assert {:ok, upload_url, photo_url} = Storage.generate_upload_url(1)
      assert is_binary(upload_url)
      assert is_binary(photo_url)
    end

    test "photo_url follows pattern items/{id}/{uuid}.jpg" do
      {:ok, _upload_url, photo_url} = Storage.generate_upload_url(42)
      bucket = Application.get_env(:api, :s3_bucket, "babyclothes-uploads")

      assert photo_url =~ ~r|^https://#{Regex.escape(bucket)}\.s3\.amazonaws\.com/items/42/[0-9a-f-]{36}\.jpg$|
    end

    test "upload_url is a presigned S3 URL" do
      {:ok, upload_url, _photo_url} = Storage.generate_upload_url(1)
      bucket = Application.get_env(:api, :s3_bucket, "babyclothes-uploads")

      assert upload_url =~ "s3.amazonaws.com/#{bucket}"
      assert upload_url =~ "X-Amz-"
    end

    test "key includes the item_id" do
      {:ok, _upload_url, photo_url} = Storage.generate_upload_url(999)

      assert photo_url =~ "/items/999/"
    end
  end
end
