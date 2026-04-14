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
  const userData = await prisma.user.findUnique({
    where: { id: user.id as string },
    select: {
      fullName: true,
      email: true,
      phone: true,
      businessName: true,
      businessType: true,
      businessUrl: true,
      businessLogo: true,
      address: true,
      country: true,
    },
  });

  return Response.json(userData);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const body = await request.json();

  await prisma.user.update({
    where: { id: user.id as string },
    data: {
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || null,
      businessName: body.businessName,
      businessType: body.businessType || null,
      businessUrl: body.businessUrl || null,
      businessLogo: body.businessLogo || null,
      address: body.address || null,
      country: body.country || null,
    },
  });

  return Response.json({ message: "Updated" });
}
