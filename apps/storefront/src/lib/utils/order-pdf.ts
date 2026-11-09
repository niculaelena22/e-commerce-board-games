import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, type PDFFont, type PDFPage, rgb } from "pdf-lib";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 48;
const RIGHT = PAGE_WIDTH - LEFT;
const appRequire = createRequire(join(process.cwd(), "package.json"));
const FONT_FILES = join(
  dirname(appRequire.resolve("@fontsource/noto-sans/package.json")),
  "files",
);
type InvoiceLineItem = {
  name: string;
  quantity: number;
  currency: string;
  price: string | null;
  total: string | null;
};
type InvoiceOrder = {
  number: string;
  currency: string;
  completed_at: string | null;
  item_total: string | null;
  discount_total: string | null;
  delivery_total: string | null;
  tax_total: string | null;
  fee_total: string | null;
  total: string | null;
  items?: InvoiceLineItem[];
  orders?: Array<{ items?: InvoiceLineItem[] }>;
};

interface InvoiceFonts {
  latin: PDFFont;
  extended: PDFFont;
  latinFace: ReturnType<typeof fontkit.create>;
}

function getFontPath(fileName: string): string {
  return join(FONT_FILES, fileName);
}

async function embedFonts(document: PDFDocument): Promise<InvoiceFonts> {
  document.registerFontkit(fontkit);
  const [latinBytes, extendedBytes] = await Promise.all([
    readFile(getFontPath("noto-sans-latin-400-normal.woff")),
    readFile(getFontPath("noto-sans-latin-ext-400-normal.woff")),
  ]);
  const latinFontBytes = Uint8Array.from(latinBytes);
  const extendedFontBytes = Uint8Array.from(extendedBytes);
  const [latin, extended] = await Promise.all([
    document.embedFont(latinFontBytes, { subset: true }),
    document.embedFont(extendedFontBytes, { subset: true }),
  ]);

  return {
    latin,
    extended,
    latinFace: fontkit.create(latinFontBytes),
  };
}

function fontForCharacter(character: string, fonts: InvoiceFonts): PDFFont {
  const glyph = fonts.latinFace.glyphForCodePoint(
    character.codePointAt(0) ?? 0,
  );
  return glyph.id === 0 ? fonts.extended : fonts.latin;
}

function textRuns(
  text: string,
  fonts: InvoiceFonts,
): Array<{ text: string; font: PDFFont }> {
  const runs: Array<{ text: string; font: PDFFont }> = [];
  for (const character of text) {
    const font = fontForCharacter(character, fonts);
    const previous = runs[runs.length - 1];
    if (previous?.font === font) {
      previous.text += character;
    } else {
      runs.push({ text: character, font });
    }
  }
  return runs;
}

function textWidth(text: string, size: number, fonts: InvoiceFonts): number {
  return textRuns(text, fonts).reduce(
    (width, run) => width + run.font.widthOfTextAtSize(run.text, size),
    0,
  );
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  fonts: InvoiceFonts,
  color = rgb(0.12, 0.16, 0.2),
): void {
  let nextX = x;
  for (const run of textRuns(text, fonts)) {
    page.drawText(run.text, { x: nextX, y, size, font: run.font, color });
    nextX += run.font.widthOfTextAtSize(run.text, size);
  }
}

function drawRightText(
  page: PDFPage,
  text: string,
  right: number,
  y: number,
  size: number,
  fonts: InvoiceFonts,
): void {
  drawText(page, text, right - textWidth(text, size, fonts), y, size, fonts);
}

function wrapText(
  text: string,
  maxWidth: number,
  size: number,
  fonts: InvoiceFonts,
): string[] {
  const words = text.split(/\s+/u).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(candidate, size, fonts) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

function money(value: string | null | undefined, currency: string): string {
  if (value == null || !Number.isFinite(Number(value))) return "-";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function getItems(order: InvoiceOrder): InvoiceLineItem[] {
  return (
    order.orders?.flatMap((segment) => segment.items ?? []) ?? order.items ?? []
  );
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function addTableHeader(page: PDFPage, y: number, fonts: InvoiceFonts): number {
  page.drawLine({
    start: { x: LEFT, y: y - 5 },
    end: { x: RIGHT, y: y - 5 },
    thickness: 0.8,
    color: rgb(0.78, 0.81, 0.84),
  });
  drawText(page, "Produs", LEFT, y - 22, 9, fonts, rgb(0.35, 0.39, 0.43));
  drawRightText(page, "Cant.", 352, y - 22, 9, fonts);
  drawRightText(page, "Preț unitar", 447, y - 22, 9, fonts);
  drawRightText(page, "Valoare", RIGHT, y - 22, 9, fonts);
  return y - 36;
}

export async function generateOrderPdf(
  order: InvoiceOrder,
): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.setTitle(`Document informativ - comanda ${order.number}`);
  document.setSubject("Document informativ, nu este document fiscal emis");
  document.setCreator("TOKI");

  const fonts = await embedFonts(document);
  const pages: PDFPage[] = [];
  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);
  let y = PAGE_HEIGHT - 54;

  const addPage = (withTableHeader: boolean) => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - 54;
    if (withTableHeader) y = addTableHeader(page, y, fonts);
  };

  drawText(page, "TOKI", LEFT, y, 24, fonts, rgb(0.1, 0.22, 0.31));
  y -= 18;
  drawText(page, "MAGAZIN DE JOCURI DE SOCIETATE", LEFT, y, 9, fonts);
  y -= 28;
  drawText(
    page,
    "DOCUMENT INFORMATIV - NU ESTE DOCUMENT FISCAL",
    LEFT,
    y,
    13,
    fonts,
  );
  y -= 24;
  drawText(page, `Comandă #${order.number}`, LEFT, y, 10, fonts);
  if (order.completed_at) {
    drawRightText(
      page,
      formatOrderDate(order.completed_at),
      RIGHT,
      y,
      10,
      fonts,
    );
  }
  y -= 31;
  drawText(page, "Articole comandate", LEFT, y, 12, fonts);
  y -= 10;
  y = addTableHeader(page, y, fonts);

  for (const item of getItems(order)) {
    const productLines = wrapText(item.name, 250, 9, fonts);
    const rowHeight = Math.max(22, productLines.length * 12 + 8);
    if (y - rowHeight < 92) {
      addPage(true);
    }

    productLines.forEach((line, index) => {
      drawText(page, line, LEFT, y - index * 12, 9, fonts);
    });
    drawRightText(page, String(item.quantity), 352, y, 9, fonts);
    drawRightText(page, money(item.price, item.currency), 447, y, 9, fonts);
    drawRightText(page, money(item.total, item.currency), RIGHT, y, 9, fonts);
    y -= rowHeight;
  }

  if (y < 190) addPage(false);
  y -= 6;
  page.drawLine({
    start: { x: LEFT, y },
    end: { x: RIGHT, y },
    thickness: 0.8,
    color: rgb(0.78, 0.81, 0.84),
  });
  y -= 21;

  const totals: Array<[string, string | null]> = [
    ["Subtotal", order.item_total],
    ["Reduceri", order.discount_total],
    ["Livrare", order.delivery_total],
    ["Taxe/TVA (conform Spree)", order.tax_total],
    ["Alte taxe și comisioane", order.fee_total],
  ];

  for (const [label, value] of totals) {
    drawText(page, label, LEFT, y, 9, fonts, rgb(0.35, 0.39, 0.43));
    drawRightText(page, money(value, order.currency), RIGHT, y, 9, fonts);
    y -= 17;
  }

  y -= 3;
  page.drawLine({
    start: { x: LEFT, y },
    end: { x: RIGHT, y },
    thickness: 0.8,
    color: rgb(0.78, 0.81, 0.84),
  });
  y -= 21;
  drawText(page, "Total comandă", LEFT, y, 12, fonts);
  drawRightText(page, money(order.total, order.currency), RIGHT, y, 12, fonts);

  const disclaimer =
    "Nu reprezintă un document fiscal emis. Taxele și totalul sunt preluate din Spree.";
  for (const [index, footerPage] of pages.entries()) {
    drawText(footerPage, disclaimer, LEFT, 42, 7, fonts, rgb(0.4, 0.43, 0.46));
    drawRightText(
      footerPage,
      `${index + 1}/${pages.length}`,
      RIGHT,
      42,
      7,
      fonts,
    );
  }

  return document.save();
}
