import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

// Prisma 7 reads the datasource from prisma.config.ts and DATABASE_URL env
const prisma = new (PrismaClient as any)({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db",
    },
  },
});

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@reviewhub.com",
      password: hashedPassword,
      fullName: "Super Admin",
      businessName: "ReviewHub",
      businessType: "technology",
      role: "admin",
    },
  });

  console.log("Admin user created:", admin.username);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
