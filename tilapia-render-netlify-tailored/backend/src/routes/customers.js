import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const q = req.query.q;
  const where = q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }] } : {};
  const customers = await prisma.customer.findMany({ where, orderBy: { id: "desc" } });
  res.json(customers);
});

router.post("/", async (req, res) => {
  const data = req.body;
  try {
    const created = await prisma.customer.create({ data });
    res.json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const updated = await prisma.customer.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.customer.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
