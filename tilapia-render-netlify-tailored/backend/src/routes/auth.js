import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword, signJwt } from "../utils/auth.js";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already in use" });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = signJwt(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
