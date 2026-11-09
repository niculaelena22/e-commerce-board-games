import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { generateOrderPdf } from "./order-pdf";

describe("generateOrderPdf", () => {
  it("creates a Romanian-language informational PDF from order data", async () => {
    const bytes = await generateOrderPdf({
      number: "R1008",
      currency: "RON",
      completed_at: "2026-11-09T12:00:00.000Z",
      item_total: "150.00",
      discount_total: "-15.00",
      delivery_total: "5.00",
      tax_total: "0.00",
      fee_total: "0.00",
      total: "140.00",
      orders: [],
      items: [
        {
          name: "Catan - extensia românească",
          quantity: 1,
          currency: "RON",
          price: "150.00",
          total: "135.00",
        },
      ],
    });

    expect(new TextDecoder().decode(bytes.slice(0, 8))).toContain("%PDF-");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getTitle()).toBe("Document informativ - comanda R1008");
    expect(pdf.getSubject()).toContain("nu este document fiscal emis");
  });

  it("starts a new page when the order has many line items", async () => {
    const items = Array.from({ length: 60 }, (_, index) => ({
      id: `li_${index}`,
      name: `Joc de societate ${index + 1}`,
      quantity: 1,
      currency: "RON",
      price: "50.00",
      total: "50.00",
    }));

    const bytes = await generateOrderPdf({
      number: "R2000",
      currency: "RON",
      completed_at: "2026-11-09T12:00:00.000Z",
      item_total: "3000.00",
      discount_total: "0.00",
      delivery_total: "5.00",
      tax_total: "0.00",
      fee_total: "0.00",
      total: "3005.00",
      items,
    });

    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });
});
