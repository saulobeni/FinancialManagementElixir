defmodule FinancialManagement.Repo.Migrations.AddHashedPasswordToUsers do
  use Ecto.Migration

  def change do
    rename table(:users), :password, to: :hashed_password
  end
end
