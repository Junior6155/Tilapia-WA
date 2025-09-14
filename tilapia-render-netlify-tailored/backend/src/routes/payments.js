import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const payments = await prisma.payment.findMany({ include: { customer: true }, orderBy: { id: "desc" } });
  res.json(payments);
});

router.post("/", async (req, res) => {
  try {
    const p = req.body;
    const payment = await prisma.payment.create({ data: {
      date: new Date(p.date),
      customerId: p.customerId,
      amount: p.amount,
      method: p.method,
      reference: p.reference || null,
      notes: p.notes || null
    }});
    // reduce customer debt
    const cust = await prisma.customer.findUnique({ where: { id: p.customerId } });
    await prisma.customer.update({
      where: { id: p.customerId },
      data: { currentDebt: (cust.currentDebt || 0) - p.amount }
    });
    res.json(payment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
