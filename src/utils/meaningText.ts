export const MEANING_SEPARATOR = ' · ';

/** Split on slash, semicolon, or mediopunkt (with optional surrounding spaces). */
const MEANING_PART_SPLIT = /\s*[·;/]\s*/u;

export function splitMeaningParts(value: string): string[] {
  return value
    .split(MEANING_PART_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinMeaningParts(parts: string[]): string {
  return parts.join(MEANING_SEPARATOR);
}

export function normalizeMeaningText(value: string): string {
  return joinMeaningParts(splitMeaningParts(value));
}

export function formatItemMeaning(meaning: string, meaningAlt?: string): string {
  const parts = [
    ...splitMeaningParts(meaning),
    ...(meaningAlt ? splitMeaningParts(meaningAlt) : []),
  ];

  return joinMeaningParts(parts);
}
