defmodule FinancialManagementWeb.TransactionView do
  def render("index.json", %{transactions: transactions}) do
    %{data: Enum.map(transactions, &render_transaction/1)}
  end

  def render("show.json", %{transaction: transaction}) do
    %{data: render_transaction(transaction)}
  end

  defp render_transaction(transaction) do
    %{
      id: transaction.id,
      type: transaction.type,
      value: transaction.value,
      date: transaction.date,
      description: transaction.description,
      tags: Enum.map(transaction.tags || [], fn tag -> tag.name end)
    }
  end
end
