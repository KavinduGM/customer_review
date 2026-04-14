import ReviewsDisplayClient from "./ReviewsDisplayClient";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const form = await prisma.reviewForm.findUnique({
    where: { slug },
    include: { user: { select: { businessName: true } } },
  });

  if (!form) {
    return { title: "Reviews Not Found" };
  }

  const reviewCount = await prisma.review.count({
    where: { formId: form.id, isApproved: true },
  });

  return {
    title: `${form.user.businessName} Reviews - ${form.title}`,
    description: `Read ${reviewCount} verified reviews for ${form.user.businessName}`,
    openGraph: {
      title: `${form.user.businessName} - Verified Reviews`,
      description: `${reviewCount} verified customer reviews`,
      type: "website",
    },
  };
}

export default async function ReviewsPage({ params }: Props) {
  const { slug } = await params;
  const form = await prisma.reviewForm.findUnique({
    where: { slug },
    include: {
      user: { select: { businessName: true, businessLogo: true } },
    },
  });

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">This reviews page does not exist.</p>
        </div>
      </div>
    );
  }

  const reviews = await prisma.review.findMany({
    where: { formId: form.id, isApproved: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = reviews.length ? totalRating / reviews.length : 0;

  return (
    <ReviewsDisplayClient
      form={{
        title: form.title,
        slug: form.slug,
        primaryColor: form.primaryColor,
        user: form.user,
      }}
      reviews={reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        repliedAt: r.repliedAt?.toISOString() || null,
      }))}
      stats={{ total: reviews.length, averageRating: Math.round(averageRating * 10) / 10 }}
    />
  );
}
