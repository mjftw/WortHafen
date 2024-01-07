defmodule WortHafen.Repo.Migrations.CreateWords do
  use Ecto.Migration

  def change do
    create table(:words) do
      add :in_german, :string
      add :in_english, :string
      add :example_usage, :string

      timestamps(type: :utc_datetime)
    end
  end
end
