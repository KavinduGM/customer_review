import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      fullName,
      phone,
      businessName,
      businessType,
      businessUrl,
      address,
      country,
    } = body;

    if (!username || !email || !password || !fullName || !businessName) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return Response.json(
        { error: existingUser.username === username ? "Username already taken" : "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName,
        phone: phone || null,
        businessName,
        businessType: businessType || null,
        businessUrl: businessUrl || null,
        address: address || null,
        country: country || null,
      },
    });

    return Response.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
