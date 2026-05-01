import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const banner = await prisma.banner.create({
    data: {
      title: data.title,
      subtitle: data.subtitle || null,
      image: data.image,
      link: data.link || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
  return NextResponse.json(banner);
}
