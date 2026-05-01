import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const cat = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      image: data.image ?? null,
      sortOrder: data.sortOrder ?? 0,
      isVisible: data.isVisible ?? true,
      parentId: data.parentId || null,
    },
  });
  return NextResponse.json(cat);
}
