defmodule FinancialManagement.Finance.TransactionTag do
  use Ecto.Schema
  import Ecto.Changeset

  alias FinancialManagement.Finance.{Transaction, Tag}

  schema "transactions_tags" do
    belongs_to :transaction, Transaction
    belongs_to :tag, Tag

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(transaction_tag, attrs) do
    transaction_tag
    |> cast(attrs, [:transaction_id, :tag_id])
    |> validate_required([:transaction_id, :tag_id])
    |> unique_constraint(:transaction_tag,
      name: :transactions_tags_transaction_id_tag_id_index,
      message: "Esta tag já está associada à transação"
    )
  end
end
