defmodule Api.Auth.Guard do
  @moduledoc """
  Ownership checks for authenticated requests. Compares `current_user_id`
  (set by `Api.Plugs.Auth`) against the resource's owner id.
  """

  import Plug.Conn

  @doc """
  Returns the conn if the current user owns the resource, otherwise
  sends 403 and halts.
  """
  @spec require_owner(Plug.Conn.t(), integer()) :: Plug.Conn.t()
  def require_owner(conn, resource_user_id) do
    if conn.assigns[:current_user_id] == resource_user_id do
      conn
    else
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(403, Jason.encode!(%{error: "forbidden"}))
      |> halt()
    end
  end
end
