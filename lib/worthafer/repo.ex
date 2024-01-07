defmodule WortHafer.Repo do
  use Ecto.Repo,
    otp_app: :worthafer,
    adapter: Ecto.Adapters.Postgres
end
