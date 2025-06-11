defmodule FinancialManagement.FinanceFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `FinancialManagement.Finance` context.
  """

  @doc """
  Generate a transaction.
  """
  def transaction_fixture(attrs \\ %{}) do
    {:ok, transaction} =
      attrs
      |> Enum.into(%{
        date: ~N[2025-05-26 00:57:00],
        description: "some description",
        type: "some type",
        value: "120.5"
      })
      |> FinancialManagement.Finance.create_transaction()

    transaction
  end

  @doc """
  Generate a tag.
  """
  def tag_fixture(attrs \\ %{}) do
    {:ok, tag} =
      attrs
      |> Enum.into(%{
        name: "some name"
      })
      |> FinancialManagement.Finance.create_tag()

    tag
  end

  @doc """
  Generate a transaction.
  """
  def transaction_fixture(attrs \\ %{}) do
    {:ok, transaction} =
      attrs
      |> Enum.into(%{
        date: ~N[2025-05-26 12:44:00],
        description: "some description",
        type: "some type",
        value: "120.5"
      })
      |> FinancialManagement.Finance.create_transaction()

    transaction
  end
end
