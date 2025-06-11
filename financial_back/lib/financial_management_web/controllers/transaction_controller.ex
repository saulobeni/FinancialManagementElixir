defmodule FinancialManagementWeb.TransactionController do
  use FinancialManagementWeb, :controller

  alias FinancialManagement.Finance
  alias FinancialManagement.Finance.Transaction

  action_fallback FinancialManagementWeb.FallbackController

  def index(conn, _params) do
    transactions = Finance.list_transactions()

    conn
    |> put_status(:ok)
    |> render(:index, transactions: transactions)
  end

  def add_tags(conn, %{"transaction_id" => transaction_id, "tag_ids" => tag_ids}) do
    case Finance.add_tags_to_transaction(transaction_id, tag_ids) do
      {:ok, transaction} ->
        conn
        |> put_status(:ok)
        |> render(:show, transaction: transaction)

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, changeset: changeset)
    end
  end

  def remove_tag(conn, %{"transaction_id" => transaction_id, "tag_id" => tag_id}) do
    case Finance.remove_tag_from_transaction(transaction_id, tag_id) do
      {:ok, transaction} ->
        conn
        |> put_status(:ok)
        |> render(:show, transaction: transaction)

      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: "Erro ao remover tag: #{reason}"})
    end
  end

  def by_user(conn, %{"user_id" => user_id}) do
    transactions = Finance.list_transactions_by_user(user_id)

    conn
    |> put_status(:ok)
    |> render(FinancialManagementWeb.TransactionView, "index.json", transactions: transactions)
  end

  def show(conn, %{"id" => id}) do
    transaction = Finance.get_transaction!(id)

    conn
    |> put_status(:ok)
    |> render(:show, transaction: transaction)
  end

  def create(conn, %{"transaction" => transaction_params}) do
    case Guardian.Plug.current_resource(conn) do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Usuário não autenticado"})

      current_user ->
        params_with_user = Map.put(transaction_params, "user_id", current_user.id)

        case Finance.create_transaction(params_with_user) do
          {:ok, transaction} ->
            conn
            |> put_status(:created)
            |> render(:show, transaction: transaction)

          {:error, %Ecto.Changeset{} = changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> render(:error, changeset: changeset)
        end
    end
  end

  def update(conn, %{"id" => id, "transaction" => transaction_params}) do
    transaction = Finance.get_transaction!(id)

    case Finance.update_transaction(transaction, transaction_params) do
      {:ok, transaction} ->
        conn
        |> put_status(:ok)
        |> render(:show, transaction: transaction)

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    transaction = Finance.get_transaction!(id)

    case Finance.delete_transaction(transaction) do
      {:ok, _transaction} ->
        send_resp(conn, :no_content, "")

      {:error, _reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Erro ao excluir a transação"})
    end
  end
end
