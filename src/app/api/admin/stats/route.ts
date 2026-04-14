import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  if (user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalForms, totalReviews, users] = await Promise.all([
    prisma.user.count(),
    prisma.reviewForm.count(),
    prisma.review.count(),
    prisma.user.findMany({
      include: {
        _count: { select: { forms: true, reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allReviews = await prisma.review.findMany({ select: { rating: true } });
  const avgRating = allReviews.length
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0;

  return Response.json({
    totalUsers,
    totalForms,
    totalReviews,
    averageRating: Math.round(avgRating * 10) / 10,
    users: users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      businessName: u.businessName,
      businessType: u.businessType,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      formsCount: u._count.forms,
      reviewsCount: u._count.reviews,
    })),
  });
}
