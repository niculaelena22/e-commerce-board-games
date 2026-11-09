import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCartOptions = vi.fn();
const mockGet = vi.fn();
const mockWithAuthRefresh = vi.fn();
const mockClient = { orders: { get: mockGet } };

vi.mock("@/lib/spree", () => ({
  DEFAULT_SURFACE: "dtc",
  getCartOptions: () => mockGetCartOptions(),
  getClient: () => mockClient,
  getClientForSurface: () => mockClient,
  withAuthRefresh: (
    callback: (options: { token: string }) => Promise<unknown>,
  ) => mockWithAuthRefresh(callback),
}));

vi.mock("../utils", () => ({
  withFallback: (callback: () => Promise<unknown>) => callback(),
}));

import { SpreeError } from "@spree/sdk";
import { getOrderForDocument } from "../orders";

describe("getOrderForDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWithAuthRefresh.mockImplementation(
      (callback: (options: { token: string }) => Promise<unknown>) =>
        callback({ token: "fresh-jwt" }),
    );
    mockGet.mockResolvedValue({ id: "or_123", completed_at: "2026-11-09" });
  });

  it("uses the refreshed customer JWT for authenticated orders", async () => {
    mockGetCartOptions.mockResolvedValue({
      token: "expired-jwt",
      spreeToken: "guest-token",
      locale: "ro",
    });

    await getOrderForDocument("or_123");

    expect(mockWithAuthRefresh).toHaveBeenCalledOnce();
    expect(mockGet).toHaveBeenCalledWith(
      "or_123",
      {},
      {
        locale: "ro",
        token: "fresh-jwt",
      },
    );
  });

  it("uses the guest cart token when there is no customer session", async () => {
    mockGetCartOptions.mockResolvedValue({
      token: undefined,
      spreeToken: "guest-token",
      locale: "ro",
    });

    await getOrderForDocument("cart_123");

    expect(mockWithAuthRefresh).not.toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(
      "cart_123",
      {},
      {
        locale: "ro",
        spreeToken: "guest-token",
      },
    );
  });

  it("rejects requests without either authorization token", async () => {
    mockGetCartOptions.mockResolvedValue({
      token: undefined,
      spreeToken: undefined,
      locale: "ro",
    });

    await expect(getOrderForDocument("or_123")).rejects.toMatchObject({
      status: 401,
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("does not suppress Spree authorization errors", async () => {
    mockGetCartOptions.mockResolvedValue({
      token: undefined,
      spreeToken: "guest-token",
      locale: "ro",
    });
    const denied = new SpreeError(
      { error: { code: "forbidden", message: "Not yours" } },
      403,
    );
    mockGet.mockRejectedValueOnce(denied);

    await expect(getOrderForDocument("or_other")).rejects.toBe(denied);
  });
});
