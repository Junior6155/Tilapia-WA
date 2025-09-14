import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { id: "desc" } });
  res.json(expenses);
});

router.post("/", async (req, res) => {
  try {
    const e = req.body;
    const expense = await prisma.expense.create({ data: {
      date: new Date(e.date),
      category: e.category,
      description: e.description,
      amount: e.amount,
      method: e.method,
      receipt: e.receipt || null
    }});
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
