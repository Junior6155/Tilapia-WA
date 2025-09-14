import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./utils/auth.js";

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    const pass = await hashPassword(adminPassword);
    await prisma.user.create({
      data: { name: "Admin", email: adminEmail, password: pass, role: "ADMIN" }
    });
    console.log("Admin user created:", adminEmail);
  }
  // Settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 }
  });
  // Prices & Inventory seed
  const sizes = [
    ["TSS", 15.0],
    ["SB", 12.0],
    ["Eco", 10.0],
    ["Reg", 8.0],
    ["S1", 6.0],
    ["S2", 5.0],
    ["S3", 4.0]
  ];
  for (const [fishSize, priceKg] of sizes) {
    await prisma.price.upsert({
      where: { fishSize },
      update: { priceKg },
      create: { fishSize, priceKg }
    });
    await prisma.inventoryItem.upsert({
      where: { fishSize },
      update: {},
      create: { fishSize, stockKg: 0, costPriceKg: 0 }
    });
  }
  console.log("Seed complete.");
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
