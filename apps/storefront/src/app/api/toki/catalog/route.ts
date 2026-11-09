import { NextResponse } from "next/server";
import { getClient } from "@/lib/spree";

export async function GET() {
  try {
    const response = await getClient().products.list(
      { limit: 100, expand: ["custom_fields"] },
      { locale: "ro", country: "RO" },
    );
    const products = (response.data ?? []).map((product) => ({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      description: (product.description ?? "")
        .replace(/<[^>]*>/g, " ")
        .slice(0, 800),
      image: product.thumbnail_url ?? null,
      price: product.price
        ? `${product.price.amount} ${product.price.currency}`
        : null,
      fields: (product.custom_fields ?? []).map((field) => ({
        label: field.label,
        value: String(field.value ?? ""),
      })),
    }));
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("TOKI catalog error", error);
    return NextResponse.json(
      { error: "Catalogul nu este disponibil momentan." },
      { status: 503 },
    );
  }
}
