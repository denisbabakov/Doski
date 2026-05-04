import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const { articleId } = await params;
  const nmID = parseInt(articleId, 10);
  if (isNaN(nmID)) return NextResponse.redirect("https://www.wildberries.ru");

  const product = await prisma.product.findFirst({ where: { wbArticle: nmID } });

  if (product) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);

    await prisma.wbClick.create({
      data: { productId: product.id, wbArticle: nmID, ipHash },
    }).catch(() => null); // non-blocking — don't fail redirect if logging fails
  }

  const target = product?.wbUrl ?? `https://www.wildberries.ru/catalog/${nmID}/detail.aspx`;
  return NextResponse.redirect(target, { status: 302 });
}
