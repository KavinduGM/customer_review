import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const form = await prisma.reviewForm.findUnique({
    where: { slug },
    include: {
      user: {
        select: { businessName: true, businessLogo: true },
      },
    },
  });

  if (!form) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: {
      formId: form.id,
      isApproved: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = reviews.length ? totalRating / reviews.length : 0;

  return Response.json({
    form: {
      title: form.title,
      description: form.description,
      primaryColor: form.primaryColor,
      user: form.user,
    },
    reviews,
    stats: {
      total: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
}
