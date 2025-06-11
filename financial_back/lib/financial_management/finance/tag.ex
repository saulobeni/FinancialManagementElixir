defmodule FinancialManagement.Finance.Tag do
  use Ecto.Schema
  import Ecto.Changeset

  alias FinancialManagement.Finance.Transaction

  schema "tags" do
    field :name, :string
    field :user_id, :id

    has_many :transaction_tags, FinancialManagement.Finance.TransactionTag

    many_to_many :transactions, FinancialManagement.Finance.Transaction,
      join_through: FinancialManagement.Finance.TransactionTag,
      on_replace: :delete

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(tag, attrs) do
    tag
    |> cast(attrs, [:name, :user_id])
    |> validate_required([:name, :user_id])
  end
end
