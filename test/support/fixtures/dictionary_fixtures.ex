defmodule WortHafen.DictionaryFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `WortHafen.Dictionary` context.
  """

  @doc """
  Generate a word.
  """
  def word_fixture(attrs \\ %{}) do
    {:ok, word} =
      attrs
      |> Enum.into(%{
        example_usage: "some example_usage",
        in_english: "some in_english",
        in_german: "some in_german"
      })
      |> WortHafen.Dictionary.create_word()

    word
  end
end
