defmodule Api.Storage do
  @moduledoc """
  Context for S3 presigned URL generation.

  Generates presigned PUT URLs for direct-to-S3 uploads,
  following the pattern `items/{item_id}/{uuid}.jpg`.
  """

  @expiration_seconds 3600
  @content_type "image/jpeg"

  @doc """
  Generate a presigned PUT URL for uploading a photo to an item.

  Returns `{:ok, upload_url, photo_url}` where:
  - `upload_url` — presigned PUT URL for direct S3 upload
  - `photo_url` — public final URL of the uploaded object

  Returns `{:error, reason}` on failure.
  """
  @spec generate_upload_url(integer()) :: {:ok, String.t(), String.t()} | {:error, term()}
  def generate_upload_url(item_id) do
    key = build_key(item_id)

    case presign_url(key) do
      {:ok, upload_url} ->
        photo_url = build_photo_url(key)
        {:ok, upload_url, photo_url}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp build_key(item_id) do
    uuid = Ecto.UUID.generate()
    "items/#{item_id}/#{uuid}.jpg"
  end

  defp presign_url(key) do
    ExAws.Config.new(:s3)
    |> ExAws.S3.presigned_url(:put, bucket(), key,
      expires_in: @expiration_seconds,
      query_params: [{"content-type", @content_type}]
    )
  end

  defp build_photo_url(key) do
    "https://#{bucket()}.s3.amazonaws.com/#{key}"
  end

  defp bucket do
    Application.get_env(:api, :s3_bucket, "babyclothes-uploads")
  end
end
