defmodule WortHafen.Dictionary.Word do
  use Ecto.Schema
  import Ecto.Changeset

  schema "words" do
    field :in_german, :string
    field :in_english, :string
    field :example_usage, :string

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(word, attrs) do
    word
    |> cast(attrs, [:in_german, :in_english, :example_usage])
    |> validate_required([:in_german, :in_english, :example_usage])
  end
end
