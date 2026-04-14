import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as Record<string, unknown>;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.userId !== (user.id as string)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { isApproved: !review.isApproved },
  });

  return Response.json(updated);
}
