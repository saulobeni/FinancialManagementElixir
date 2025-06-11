# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :financial_management,
  ecto_repos: [FinancialManagement.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :financial_management, FinancialManagementWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: FinancialManagementWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: FinancialManagement.PubSub,
  live_view: [signing_salt: "D2k5HaA1"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :financial_management, FinancialManagement.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :financial_management, FinancialManagement.Auth.Guardian,
  issuer: "financial_management",
  secret_key: "Y7NYbrcKZDggYtMwNjJe+1bkzWm79cxwsj/czWk4l3S+E+zXNxdT8xoK/Hen/7hs"

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
