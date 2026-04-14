import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const reviews = await prisma.review.findMany({
    where: { userId: user.id as string },
    include: {
      form: {
        select: { title: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(reviews);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formSlug, fullName, companyName, profileImage, referenceImages, email, country, rating, message, customFieldData } = body;

    const form = await prisma.reviewForm.findUnique({
      where: { slug: formSlug },
      include: { user: true },
    });

    if (!form) {
      return Response.json({ error: "Form not found" }, { status: 404 });
    }

    if (!form.isActive) {
      return Response.json({ error: "This form is no longer accepting reviews" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        formId: form.id,
        userId: form.userId,
        fullName,
        companyName: companyName || null,
        profileImage: profileImage || null,
        referenceImages: referenceImages ? JSON.stringify(referenceImages) : null,
        email,
        country,
        rating: parseInt(rating),
        message,
        customFieldData: customFieldData ? JSON.stringify(customFieldData) : null,
      },
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("Review submission error:", error);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
