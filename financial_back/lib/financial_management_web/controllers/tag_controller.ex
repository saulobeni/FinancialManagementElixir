defmodule FinancialManagementWeb.TagController do
  use FinancialManagementWeb, :controller

  alias FinancialManagement.Finance
  alias FinancialManagement.Finance.Tag

  action_fallback FinancialManagementWeb.FallbackController

  def index(conn, _params) do
    tags = Finance.list_tags()
    render(conn, :index, tags: tags)
  end

  def by_user(conn, %{"user_id" => user_id}) do
    tags = Finance.list_tags_by_user(user_id)

    conn
    |> put_status(:ok)
    |> render(:index, tags: tags)
  end

  def show(conn, %{"id" => id}) do
    tag = Finance.get_tag!(id)
    render(conn, :show, tag: tag)
  end

  def create(conn, %{"name" => _} = tag_params) do
    case Finance.create_tag(tag_params) do
      {:ok, tag} ->
        conn
        |> put_status(:created)
        |> render(:show, tag: tag)

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, changeset: changeset)
    end
  end

  def update(conn, %{"id" => id} = params) do
    tag = Finance.get_tag!(id)

    tag_params =
      if Map.has_key?(params, "tag"),
        do: params["tag"],
        else: Map.drop(params, ["id"])

    case Finance.update_tag(tag, tag_params) do
      {:ok, tag} ->
        conn
        |> put_status(:ok)
        |> render(:show, tag: tag)

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:error, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    tag = Finance.get_tag!(id)
    {:ok, _tag} = Finance.delete_tag(tag)

    send_resp(conn, :no_content, "")
  end
end
