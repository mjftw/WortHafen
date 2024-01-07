defmodule WortHafen.Repo do
  use Ecto.Repo,
    otp_app: :worthafen,
    adapter: Ecto.Adapters.Postgres
end
