defmodule Api.Users do
  @moduledoc """
  Context for user accounts: lookup and one-time PF/PJ registration.
  """

  alias Api.Repo
  alias Api.Users.User

  @doc "Fetches a user by id."
  @spec get_user(term()) :: {:ok, User.t()} | {:error, :not_found}
  def get_user(id) do
    case Repo.get(User, id) do
      %User{} = user -> {:ok, user}
      nil -> {:error, :not_found}
    end
  end

  @doc """
  Completes the one-time PF/PJ registration for a user.

  Returns `{:error, :already_registered}` when the user already has a type.
  """
  @spec register_account(User.t(), map()) ::
          {:ok, User.t()} | {:error, :already_registered} | {:error, Ecto.Changeset.t()}
  def register_account(%User{type: nil} = user, attrs) do
    user
    |> User.registration_changeset(attrs)
    |> Repo.update()
  end

  def register_account(%User{}, _attrs), do: {:error, :already_registered}
end
