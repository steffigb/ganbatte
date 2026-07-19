const KATAKANA_HIRAGANA_OFFSET = 0x60;

export function normalizeJapaneseText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u30a1-\u30f6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - KATAKANA_HIRAGANA_OFFSET),
    )
    .toLowerCase()
    .trim();
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
