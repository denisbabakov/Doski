import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });
  return Response.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { id: _id, createdAt: _c, updatedAt: _u, category: _cat, ...fields } = data;
  const sanitized = {
    ...fields,
    sku: fields.sku || null,
    categoryId: fields.categoryId || null,
  };
  try {
    const product = await prisma.product.create({ data: sanitized });
    return Response.json(product);
  } catch (e) {
    console.error("Product create error:", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
