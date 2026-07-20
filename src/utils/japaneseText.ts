const KATAKANA_HIRAGANA_OFFSET = 0x60;

export function readingToHiragana(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - KATAKANA_HIRAGANA_OFFSET),
    )
    .trim();
}

export function readingToKatakana(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u3041-\u3096]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) + KATAKANA_HIRAGANA_OFFSET),
    )
    .trim();
}

export function normalizeJapaneseText(text: string): string {
  return readingToHiragana(text).toLowerCase();
}

export function textIncludesQuery(
  query: string,
  ...fields: Array<string | undefined>
): boolean {
  const normalizedQuery = normalizeJapaneseText(query);
  if (!normalizedQuery) {
    return false;
  }

  return fields.some((field) => {
    if (!field) {
      return false;
    }

    return normalizeJapaneseText(field).includes(normalizedQuery);
  });
}

export function textStartsWithQuery(
  query: string,
  ...fields: Array<string | undefined>
): boolean {
  const normalizedQuery = normalizeJapaneseText(query);
  if (!normalizedQuery) {
    return false;
  }

  return fields.some((field) => {
    if (!field) {
      return false;
    }

    return normalizeJapaneseText(field).startsWith(normalizedQuery);
  });
}
