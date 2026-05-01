import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  return Response.json(settings);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { id: _id, updatedAt: _updatedAt, createdAt: _createdAt, ...fields } = data;
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "main" },
      update: fields,
      create: { id: "main", ...fields },
    });
    return Response.json(settings);
  } catch (e) {
    console.error("Settings save error:", e);
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
