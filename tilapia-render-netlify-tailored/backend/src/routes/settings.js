import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const prices = await prisma.price.findMany();
  res.json({ settings, prices });
});

router.post("/", async (req, res) => {
  const s = req.body.settings || {};
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: s,
    create: { id: 1, ...s }
  });
  res.json(settings);
});

router.post("/prices", async (req, res) => {
  const updates = req.body.prices || [];
  const results = [];
  for (const u of updates) {
    const r = await prisma.price.upsert({
      where: { fishSize: u.fishSize },
      update: { priceKg: u.priceKg, updatedAt: new Date() },
      create: { fishSize: u.fishSize, priceKg: u.priceKg }
    });
    results.push(r);
  }
  res.json(results);
});

export default router;
