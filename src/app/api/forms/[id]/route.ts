import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = await prisma.reviewForm.findUnique({
    where: { id },
    include: {
      user: {
        select: { businessName: true, businessLogo: true, fullName: true },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!form) {
    return Response.json({ error: "Form not found" }, { status: 404 });
  }

  return Response.json(form);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as Record<string, unknown>;
  const body = await request.json();

  const form = await prisma.reviewForm.findUnique({ where: { id } });
  if (!form || form.userId !== (user.id as string)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.reviewForm.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      logo: body.logo,
      thankYouMessage: body.thankYouMessage,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      customFields: JSON.stringify(body.customFields || []),
      isActive: body.isActive,
    },
  });

  return Response.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = session.user as Record<string, unknown>;

  const form = await prisma.reviewForm.findUnique({ where: { id } });
  if (!form || form.userId !== (user.id as string)) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reviewForm.delete({ where: { id } });
  return Response.json({ message: "Deleted" });
}
