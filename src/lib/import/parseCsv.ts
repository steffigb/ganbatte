export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function splitCsvRecords(text: string): string[] {
  const records: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          current += '""';
          index += 1;
        } else {
          inQuotes = false;
          current += char;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      current += char;
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1;
      }

      if (current.trim()) {
        records.push(current);
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    records.push(current);
  }

  return records;
}

export function parseCsv(text: string): ParsedCsv {
  const normalized = text.replace(/^\uFEFF/, '').trim();
  if (!normalized) {
    return { headers: [], rows: [] };
  }

  const records = splitCsvRecords(normalized);
  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(records[0]).map((header) => header.trim());
  const rows: Record<string, string>[] = [];

  for (let index = 1; index < records.length; index += 1) {
    const cells = parseCsvLine(records[index]);
    if (!cells.some((cell) => cell.trim())) {
      continue;
    }

    const row: Record<string, string> = {};
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      row[headers[columnIndex]] = (cells[columnIndex] ?? '').trim();
    }
    rows.push(row);
  }

  return { headers, rows };
}
