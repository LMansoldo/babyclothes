defmodule Api.Users do
  @moduledoc """
  Context for user accounts: lookup, signup, authentication, and one-time PF/PJ registration.
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
  Creates a new user via email/password signup.

  Returns `{:ok, user}` on success or `{:error, changeset}` on validation failure.
  """
  @spec signup(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def signup(attrs) do
    %User{}
    |> User.signup_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Authenticates a user by email and password.

  Returns `{:ok, user}` on success or `{:error, :invalid_credentials}` on failure.
  Uses constant-time comparison to prevent timing attacks on unknown emails.
  """
  @spec authenticate(String.t(), String.t()) :: {:ok, User.t()} | {:error, :invalid_credentials}
  def authenticate(email, password) when is_binary(email) and is_binary(password) do
    case Repo.get_by(User, email: email) do
      %User{password_hash: hash} = user when is_binary(hash) ->
        if Bcrypt.verify_pass(password, hash) do
          {:ok, user}
        else
          {:error, :invalid_credentials}
        end

      _ ->
        Bcrypt.no_user_verify()
        {:error, :invalid_credentials}
    end
  end

  def authenticate(_email, _password) do
    Bcrypt.no_user_verify()
    {:error, :invalid_credentials}
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
