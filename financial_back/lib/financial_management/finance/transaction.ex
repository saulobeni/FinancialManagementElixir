defmodule FinancialManagement.Finance.Transaction do
  use Ecto.Schema
  import Ecto.Changeset

  alias FinancialManagement.Finance.{Tag, TransactionTag}

  schema "transactions" do
    field :type, :string
    field :value, :decimal
    field :date, :naive_datetime
    field :description, :string
    field :user_id, :id

    has_many :transaction_tags, TransactionTag

    many_to_many :tags, Tag,
      join_through: TransactionTag,
      join_keys: [transaction_id: :id, tag_id: :id],
      on_replace: :delete,
      unique: true

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(transaction, attrs) do
    transaction
    |> cast(attrs, [:description, :value, :type, :date, :user_id])
    |> validate_required([:description, :value, :type, :date, :user_id])
  end
end
