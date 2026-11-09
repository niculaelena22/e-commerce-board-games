import { SpreeError } from "@spree/sdk";
import { getOrderForDocument } from "@/lib/data/orders";
import { generateOrderPdf } from "@/lib/utils/order-pdf";

interface InvoiceRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: InvoiceRouteContext,
): Promise<Response> {
  const { id } = await params;
  if (!/^(?:cart|or|ogrp)_[A-Za-z0-9_-]+$/u.test(id)) {
    return new Response("Comanda nu a fost găsită.", { status: 404 });
  }

  try {
    const order = await getOrderForDocument(id);
    if (!order.completed_at) {
      return new Response("Comanda nu a fost găsită.", { status: 404 });
    }

    const pdf = await generateOrderPdf(order);
    const filename = `document-comanda-${order.number.replace(/[^A-Za-z0-9_-]/gu, "")}.pdf`;
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof SpreeError) {
      if (error.status === 401) {
        return new Response(
          "Autentificarea a expirat. Reîncearcă după autentificare.",
          {
            status: 401,
          },
        );
      }
      if (error.status === 403 || error.status === 404) {
        return new Response("Comanda nu a fost găsită.", { status: 404 });
      }
    }
    throw error;
  }
}
