defmodule FinancialManagementWeb.AuthController do
  use FinancialManagementWeb, :controller

  alias FinancialManagement.Accounts
  alias FinancialManagement.Accounts.User

  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.get_user_by_email(email) do
      %User{hashed_password: hashed_password} = user ->
        if Bcrypt.verify_pass(password, hashed_password) do
          {:ok, token, _claims} = FinancialManagement.Auth.Guardian.encode_and_sign(user)

          conn
          |> put_status(:ok)
          |> json(%{
            token: token,
            user: %{id: user.id, name: user.name, email: user.email}
          })
        else
          unauthorized(conn)
        end

      _ ->
        unauthorized(conn)
    end
  end

  defp unauthorized(conn) do
    conn
    |> put_status(:unauthorized)
    |> json(%{error: "Invalid credentials"})
  end
end
