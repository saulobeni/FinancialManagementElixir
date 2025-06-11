defmodule FinancialManagement.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      FinancialManagementWeb.Telemetry,
      FinancialManagement.Repo,
      {DNSCluster, query: Application.get_env(:financial_management, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: FinancialManagement.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: FinancialManagement.Finch},
      # Start a worker by calling: FinancialManagement.Worker.start_link(arg)
      # {FinancialManagement.Worker, arg},
      # Start to serve requests, typically the last entry
      FinancialManagementWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FinancialManagement.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    FinancialManagementWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
