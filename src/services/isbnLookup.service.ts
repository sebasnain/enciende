export interface IsbnLookupResult {
  title: string
  author: string
  publisher: string
  coverImageUrl: string
}

interface OpenLibraryAuthor {
  name: string
}

interface OpenLibraryPublisher {
  name: string
}

interface OpenLibraryCover {
  medium?: string
  large?: string
}

interface OpenLibraryBookData {
  title?: string
  authors?: OpenLibraryAuthor[]
  publishers?: OpenLibraryPublisher[]
  cover?: OpenLibraryCover
}

/** Busca los datos generales de un título por ISBN en Open Library (API pública, sin key). */
export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult | null> {
  const url = `https://openlibrary.org/api/books.json?bibkeys=ISBN:${encodeURIComponent(isbn)}&jscmd=data`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = (await res.json()) as Record<string, OpenLibraryBookData>
  const book = data[`ISBN:${isbn}`]
  if (!book) return null

  return {
    title: book.title ?? '',
    author: book.authors?.map((a) => a.name).join(', ') ?? '',
    publisher: book.publishers?.map((p) => p.name).join(', ') ?? '',
    coverImageUrl: book.cover?.large ?? book.cover?.medium ?? '',
  }
}
