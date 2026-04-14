import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const forms = await prisma.reviewForm.findMany({
    where: { userId: user.id as string },
    include: { _count: { select: { reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(forms);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const body = await request.json();

  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") + "-" + uuidv4().slice(0, 8);

  const form = await prisma.reviewForm.create({
    data: {
      userId: user.id as string,
      title: body.title,
      description: body.description || null,
      logo: body.logo || null,
      thankYouMessage: body.thankYouMessage || "Thank you for your review!",
      primaryColor: body.primaryColor || "#4F46E5",
      secondaryColor: body.secondaryColor || "#818CF8",
      backgroundColor: body.backgroundColor || "#F9FAFB",
      textColor: body.textColor || "#111827",
      customFields: JSON.stringify(body.customFields || []),
      slug,
    },
  });

  return Response.json(form, { status: 201 });
}
