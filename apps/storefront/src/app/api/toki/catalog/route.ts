import { NextResponse } from "next/server";
import { getClient } from "@/lib/spree";

export async function GET() {
  try {
    const response = await getClient().products.list(
      { limit: 100, expand: ["custom_fields", "categories"] },
      { locale: "ro", country: "RO" },
    );
    const products = (response.data ?? []).map((product) => ({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      image: product.thumbnail_url ?? null,
      price: product.price
        ? `${product.price.amount} ${product.price.currency}`
        : null,
      tags: (product.tags ?? []).slice(0, 12),
      categories: (product.categories ?? []).map((category) => ({
        name: category.name,
        permalink: category.permalink,
      })),
      fields: (product.custom_fields ?? []).map((field) => ({
        label: field.label.slice(0, 80),
        value: String(field.value ?? "").slice(0, 120),
      })),
    }));
    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("TOKI catalog error", error);
    return NextResponse.json(
      { error: "Catalogul nu este disponibil momentan." },
      { status: 503 },
    );
  }
}
