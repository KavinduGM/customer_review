import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { likes: review.likes + 1 },
  });

  return Response.json({ likes: updated.likes });
}
