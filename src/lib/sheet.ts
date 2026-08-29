export interface SheetData {
  headers: string[];
  rows: string[][];
}

const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86_400_000;

const trimTrailingEmpty = (cells: string[]): string[] => {
  let end = cells.length;
  while (end > 0 && cells[end - 1].trim() === "") end -= 1;
  return cells.slice(0, end);
};

const toSheetData = (grid: string[][]): SheetData => {
  const firstFilled = grid.findIndex((row) => row.some((cell) => cell.trim() !== ""));
  if (firstFilled === -1) return { headers: [], rows: [] };

  const headers = trimTrailingEmpty(grid[firstFilled]).map((cell) => cell.trim());
  const rows = grid
    .slice(firstFilled + 1)
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => headers.map((_, index) => (row[index] ?? "").trim()));

  return { headers, rows };
};

export const parseCsv = (text: string): SheetData => {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const grid: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(cell);
      grid.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  grid.push(row);

  return toSheetData(grid);
};

interface ZipEntry {
  name: string;
  method: number;
  offset: number;
  compressedSize: number;
}

const readZipEntries = (view: DataView): ZipEntry[] => {
  const decoder = new TextDecoder();
  let eocd = -1;

  for (let index = view.byteLength - 22; index >= 0 && index > view.byteLength - 65_557; index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) {
      eocd = index;
      break;
    }
  }

  if (eocd === -1) throw new Error("This file is not a readable .xlsx workbook");

  const total = view.getUint16(eocd + 10, true);
  let cursor = view.getUint32(eocd + 16, true);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < total; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break;

    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);

    entries.push({
      name: decoder.decode(new Uint8Array(view.buffer, cursor + 46, nameLength)),
      method: view.getUint16(cursor + 10, true),
      compressedSize: view.getUint32(cursor + 20, true),
      offset: view.getUint32(cursor + 42, true),
    });

    cursor += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

const readZipFile = async (view: DataView, entry: ZipEntry): Promise<string> => {
  if (view.getUint32(entry.offset, true) !== 0x04034b50) {
    throw new Error("This workbook is damaged and cannot be read");
  }

  const nameLength = view.getUint16(entry.offset + 26, true);
  const extraLength = view.getUint16(entry.offset + 28, true);
  const start = entry.offset + 30 + nameLength + extraLength;
  const data = view.buffer.slice(start, start + entry.compressedSize) as ArrayBuffer;

  if (entry.method === 0) return new TextDecoder().decode(data);

  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot open .xlsx files. Save the sheet as CSV and try again");
  }

  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).text();
};

const columnIndex = (reference: string): number => {
  const letters = reference.replace(/\d+/g, "");
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
};

const parseSharedStrings = (xml: string | null): string[] => {
  if (!xml) return [];
  const document_ = new DOMParser().parseFromString(xml, "application/xml");
  return [...document_.getElementsByTagName("si")].map((node) =>
    [...node.getElementsByTagName("t")].map((text) => text.textContent ?? "").join("")
  );
};

const parseWorksheet = (xml: string, sharedStrings: string[]): string[][] =>
  [...new DOMParser().parseFromString(xml, "application/xml").getElementsByTagName("row")].map(
    (rowNode) => {
      const cells: string[] = [];

      for (const cellNode of [...rowNode.getElementsByTagName("c")]) {
        const reference = cellNode.getAttribute("r");
        const index = reference ? columnIndex(reference) : cells.length;
        const type = cellNode.getAttribute("t");

        let value = "";
        if (type === "inlineStr") {
          value = [...cellNode.getElementsByTagName("t")].map((t) => t.textContent ?? "").join("");
        } else {
          const raw = cellNode.getElementsByTagName("v")[0]?.textContent ?? "";
          if (type === "s") {
            value = sharedStrings[Number(raw)] ?? "";
          } else if (type === "b") {
            value = raw === "1" ? "TRUE" : "FALSE";
          } else {
            value = raw;
          }
        }

        while (cells.length < index) cells.push("");
        cells[index] = value;
      }

      return cells;
    }
  );

export const parseXlsx = async (file: File): Promise<SheetData> => {
  const view = new DataView(await file.arrayBuffer());
  const entries = readZipEntries(view);

  const sheetEntry = entries
    .filter((entry) => /^xl\/worksheets\/sheet\d*\.xml$/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))[0];

  if (!sheetEntry) throw new Error("No worksheet was found in this workbook");

  const stringsEntry = entries.find((entry) => entry.name === "xl/sharedStrings.xml");

  const [sheetXml, stringsXml] = await Promise.all([
    readZipFile(view, sheetEntry),
    stringsEntry ? readZipFile(view, stringsEntry) : Promise.resolve(null),
  ]);

  return toSheetData(parseWorksheet(sheetXml, parseSharedStrings(stringsXml)));
};

export const readSheetFile = async (file: File): Promise<SheetData> => {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx")) return parseXlsx(file);
  if (name.endsWith(".csv") || name.endsWith(".txt")) return parseCsv(await file.text());

  if (name.endsWith(".xls")) {
    throw new Error("The old .xls format is not supported. Save it as .xlsx or .csv");
  }

  throw new Error("Upload a .xlsx or .csv file");
};

export const excelSerialToDate = (serial: number): Date =>
  new Date(EXCEL_EPOCH_UTC + Math.round(serial * MS_PER_DAY));
