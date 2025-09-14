import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import salesRoutes from "./routes/sales.js";
import paymentsRoutes from "./routes/payments.js";
import inventoryRoutes from "./routes/inventory.js";
import expensesRoutes from "./routes/expenses.js";
import reportsRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import { authMiddleware } from "./utils/auth.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const allowed = (process.env.CORS_ORIGIN || "").split(",").filter(Boolean);
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true })); // dev-friendly

app.get("/", (req, res) => {
  res.json({ ok: true, name: "Tilapia System API", time: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/customers", authMiddleware(["ADMIN", "STAFF", "ACCOUNTANT"]), customerRoutes);
app.use("/sales", authMiddleware(["ADMIN", "STAFF", "ACCOUNTANT"]), salesRoutes);
app.use("/payments", authMiddleware(["ADMIN", "ACCOUNTANT"]), paymentsRoutes);
app.use("/inventory", authMiddleware(["ADMIN", "STAFF", "ACCOUNTANT"]), inventoryRoutes);
app.use("/expenses", authMiddleware(["ADMIN", "ACCOUNTANT"]), expensesRoutes);
app.use("/reports", authMiddleware(["ADMIN", "STAFF", "ACCOUNTANT"]), reportsRoutes);
app.use("/settings", authMiddleware(["ADMIN"]), settingsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
