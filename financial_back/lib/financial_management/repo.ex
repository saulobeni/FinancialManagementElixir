defmodule FinancialManagement.Repo do
  use Ecto.Repo,
    otp_app: :financial_management,
    adapter: Ecto.Adapters.Postgres
end
