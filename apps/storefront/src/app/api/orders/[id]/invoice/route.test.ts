import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetOrderForDocument = vi.fn();
const mockGenerateOrderPdf = vi.fn();

vi.mock("@/lib/data/orders", () => ({
  getOrderForDocument: (id: string) => mockGetOrderForDocument(id),
}));

vi.mock("@/lib/utils/order-pdf", () => ({
  generateOrderPdf: (order: unknown) => mockGenerateOrderPdf(order),
}));

import { SpreeError } from "@spree/sdk";
import { GET } from "./route";

function request(id: string) {
  return GET(new Request(`https://toki.example/api/orders/${id}/invoice`), {
    params: Promise.resolve({ id }),
  });
}

describe("order document route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetOrderForDocument.mockResolvedValue({
      id: "or_123",
      number: "R1008",
      completed_at: "2026-11-09T12:00:00.000Z",
    });
    mockGenerateOrderPdf.mockResolvedValue(Uint8Array.from([37, 80, 68, 70]));
  });

  it("returns a private PDF attachment for a completed authorized order", async () => {
    const response = await request("or_123");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toContain("R1008.pdf");
    expect(mockGenerateOrderPdf).toHaveBeenCalledOnce();
  });

  it("rejects malformed identifiers before requesting order data", async () => {
    const response = await request("or_123%2F..%2Fother");

    expect(response.status).toBe(404);
    expect(mockGetOrderForDocument).not.toHaveBeenCalled();
  });

  it("does not generate a document for an incomplete order", async () => {
    mockGetOrderForDocument.mockResolvedValueOnce({
      id: "cart_123",
      number: "R1008",
      completed_at: null,
    });

    const response = await request("cart_123");

    expect(response.status).toBe(404);
    expect(mockGenerateOrderPdf).not.toHaveBeenCalled();
  });

  it("hides orders denied by Spree and reports expired authentication", async () => {
    mockGetOrderForDocument.mockRejectedValueOnce(
      new SpreeError(
        { error: { code: "forbidden", message: "Not yours" } },
        403,
      ),
    );
    expect((await request("or_other")).status).toBe(404);

    mockGetOrderForDocument.mockRejectedValueOnce(
      new SpreeError(
        { error: { code: "unauthorized", message: "Expired" } },
        401,
      ),
    );
    expect((await request("or_123")).status).toBe(401);
  });
});
