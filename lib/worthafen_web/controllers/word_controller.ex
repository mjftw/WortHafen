defmodule WortHafenWeb.WordController do
  use WortHafenWeb, :controller

  alias WortHafen.Dictionary
  alias WortHafen.Dictionary.Word

  def index(conn, _params) do
    words = Dictionary.list_words()
    render(conn, :index, words: words)
  end

  def new(conn, _params) do
    changeset = Dictionary.change_word(%Word{})
    render(conn, :new, changeset: changeset)
  end

  def create(conn, %{"word" => word_params}) do
    case Dictionary.create_word(word_params) do
      {:ok, word} ->
        conn
        |> put_flash(:info, "Word created successfully.")
        |> redirect(to: ~p"/words/#{word}")

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, :new, changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    word = Dictionary.get_word!(id)
    render(conn, :show, word: word)
  end

  def edit(conn, %{"id" => id}) do
    word = Dictionary.get_word!(id)
    changeset = Dictionary.change_word(word)
    render(conn, :edit, word: word, changeset: changeset)
  end

  def update(conn, %{"id" => id, "word" => word_params}) do
    word = Dictionary.get_word!(id)

    case Dictionary.update_word(word, word_params) do
      {:ok, word} ->
        conn
        |> put_flash(:info, "Word updated successfully.")
        |> redirect(to: ~p"/words/#{word}")

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, :edit, word: word, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    word = Dictionary.get_word!(id)
    {:ok, _word} = Dictionary.delete_word(word)

    conn
    |> put_flash(:info, "Word deleted successfully.")
    |> redirect(to: ~p"/words")
  end
end
