defmodule FinancialManagementWeb.AuthPipeline do
  use Guardian.Plug.Pipeline,
    otp_app: :financial_management,
    module: FinancialManagement.Auth.Guardian,
    error_handler: FinancialManagementWeb.AuthErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
