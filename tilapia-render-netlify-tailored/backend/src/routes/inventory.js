import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const items = await prisma.inventoryItem.findMany({ orderBy: { fishSize: "asc" } });
  res.json(items);
});

router.post("/add", async (req, res) => {
  try {
    const s = req.body;
    const current = await prisma.inventoryItem.findUnique({ where: { fishSize: s.fishSize } });
    const updated = await prisma.inventoryItem.upsert({
      where: { fishSize: s.fishSize },
      update: { stockKg: (current?.stockKg || 0) + s.quantityKg, costPriceKg: s.costPriceKg || current?.costPriceKg || 0, lastUpdated: new Date() },
      create: { fishSize: s.fishSize, stockKg: s.quantityKg, costPriceKg: s.costPriceKg || 0 }
    });
    await prisma.stockMovement.create({
      data: { date: new Date(s.date), fishSize: s.fishSize, type: "add", quantity: s.quantityKg, reference: s.supplier || "Stock add" }
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/adjust", async (req, res) => {
  try {
    const s = req.body;
    const current = await prisma.inventoryItem.findUnique({ where: { fishSize: s.fishSize } });
    if (!current) return res.status(400).json({ error: "Inventory item not found" });
    const newStock = current.stockKg + s.quantity;
    if (newStock < 0) return res.status(400).json({ error: "Cannot reduce below zero" });
    const updated = await prisma.inventoryItem.update({
      where: { fishSize: s.fishSize },
      data: { stockKg: newStock, lastUpdated: new Date() }
    });
    await prisma.stockMovement.create({
      data: { date: new Date(s.date), fishSize: s.fishSize, type: "adjustment", quantity: s.quantity, reference: s.reason || "Adjustment" }
    });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
