import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchWbCards, fetchWbPrices, wbProductUrl } from "@/lib/wb";

function slugify(text: string, suffix: string) {
  return (
    text.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-|-$/g, "") +
    "-" + suffix
  );
}

export async function POST(_req: NextRequest) {
  try {
    // Find or create "Товары для дома" category
    let category = await prisma.category.findFirst({ where: { slug: "tovary-dlya-doma" } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Товары для дома", slug: "tovary-dlya-doma", isVisible: true },
      });
    }

    const cards = await fetchWbCards();
    await new Promise((r) => setTimeout(r, 3000)); // pause between WB API calls
    const priceMap = await fetchWbPrices().catch(() => new Map());

    let synced = 0;
    let created = 0;

    for (const card of cards) {
      const priceInfo = priceMap.get(card.nmID);
      const size = priceInfo?.sizes?.[0] ?? card.sizes?.[0];
      const price = size?.discountedPrice ?? size?.price ?? 0;
      const comparePrice = size?.price !== size?.discountedPrice ? size?.price : undefined;

      const images = card.photos?.map((p) => p.big ?? p.c246x328).filter(Boolean) ?? [];
      const wbUrl = wbProductUrl(card.nmID);
      const slug = slugify(card.title ?? card.vendorCode, String(card.nmID));

      await prisma.product.upsert({
        where: { sku: `wb-${card.nmID}` },
        create: {
          name: card.title ?? card.vendorCode,
          slug,
          sku: `wb-${card.nmID}`,
          price,
          comparePrice: comparePrice ?? null,
          images,
          description: card.description ?? null,
          shortDesc: card.subjectName ?? null,
          stock: 99,
          isVisible: true,
          isWb: true,
          wbArticle: card.nmID,
          wbUrl,
          categoryId: category.id,
        },
        update: {
          name: card.title ?? card.vendorCode,
          price,
          comparePrice: comparePrice ?? null,
          images,
          wbUrl,
          stock: 99,
        },
      });

      const existing = await prisma.product.findUnique({ where: { sku: `wb-${card.nmID}` } });
      if (!existing) created++;
      synced++;
    }

    return NextResponse.json({ ok: true, synced, created, total: cards.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
