import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/summary", async (req, res) => {
  const { start, end } = req.query;
  const startDate = start ? new Date(start) : new Date(new Date().setDate(new Date().getDate()-30));
  const endDate = end ? new Date(end) : new Date();
  // Sales & payments & expenses
  const [sales, payments, expenses] = await Promise.all([
    prisma.sale.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    prisma.payment.findMany({ where: { date: { gte: startDate, lte: endDate } } }),
    prisma.expense.findMany({ where: { date: { gte: startDate, lte: endDate } } })
  ]);
  const totalSales = sales.reduce((a,s)=>a+s.totalAmount,0);
  const totalPayments = payments.reduce((a,p)=>a+p.amount,0);
  const totalExpenses = expenses.reduce((a,e)=>a+e.amount,0);
  const profit = totalSales - totalExpenses;
  res.json({ start: startDate, end: endDate, totalSales, totalPayments, totalExpenses, profit, salesCount: sales.length });
});

export default router;
