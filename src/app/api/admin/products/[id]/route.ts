import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const { id: _id, createdAt: _c, updatedAt: _u, category: _cat, ...fields } = data;
  const sanitized = {
    ...fields,
    sku: fields.sku || null,
    categoryId: fields.categoryId || null,
  };
  try {
    const product = await prisma.product.update({ where: { id }, data: sanitized });
    return Response.json(product);
  } catch (e) {
    console.error(e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return Response.json({ ok: true });
}
