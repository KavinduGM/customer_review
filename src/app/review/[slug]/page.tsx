import ReviewFormClient from "./ReviewFormClient";
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
    return { title: "Form Not Found" };
  }

  return {
    title: `${form.title} - ${form.user.businessName}`,
    description: form.description || `Share your experience with ${form.user.businessName}`,
    openGraph: {
      title: form.title,
      description: form.description || `Share your experience with ${form.user.businessName}`,
      type: "website",
    },
  };
}

export default async function ReviewPage({ params }: Props) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-500">This review form does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Closed</h1>
          <p className="text-gray-500">This review form is no longer accepting submissions.</p>
        </div>
      </div>
    );
  }

  return (
    <ReviewFormClient
      form={{
        ...form,
        customFields: JSON.parse(form.customFields || "[]"),
        createdAt: form.createdAt.toISOString(),
        updatedAt: form.updatedAt.toISOString(),
      }}
    />
  );
}
