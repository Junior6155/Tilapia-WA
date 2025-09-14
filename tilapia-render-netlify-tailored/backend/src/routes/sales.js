import { Router } from "express";
import { PrismaClient, FishSize } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const sales = await prisma.sale.findMany({ include: { customer: true }, orderBy: { id: "desc" } });
  res.json(sales);
});

router.post("/", async (req, res) => {
  try {
    const s = req.body;
    // Check stock
    const inv = await prisma.inventoryItem.findUnique({ where: { fishSize: s.fishSize } });
    if (!inv || inv.stockKg < s.quantityKg) {
      return res.status(400).json({ error: `Insufficient stock for ${s.fishSize}` });
    }
    // Create sale
    const sale = await prisma.sale.create({ data: {
      date: new Date(s.date),
      customerId: s.customerId,
      fishSize: s.fishSize,
      quantityKg: s.quantityKg,
      unitPrice: s.unitPrice,
      totalAmount: s.totalAmount,
      type: s.type,
      notes: s.notes || null
    }});
    // Update inventory
    await prisma.inventoryItem.update({
      where: { fishSize: s.fishSize },
      data: { stockKg: inv.stockKg - s.quantityKg, lastUpdated: new Date() }
    });
    // Adjust customer debt for credit
    if (s.type === "credit") {
      const cust = await prisma.customer.findUnique({ where: { id: s.customerId } });
      await prisma.customer.update({
        where: { id: s.customerId },
        data: {
          currentDebt: (cust.currentDebt || 0) + s.totalAmount,
          lastSale: new Date(s.date),
          totalPurchases: (cust.totalPurchases || 0) + s.totalAmount
        }
      });
    }
    // Stock movement
    await prisma.stockMovement.create({
      data: { date: new Date(s.date), fishSize: s.fishSize, type: "sale", quantity: -s.quantityKg, reference: `Sale ${sale.id}` }
    });
    res.json(sale);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
