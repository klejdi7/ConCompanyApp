import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import generalRoutes from "./routes/general.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", generalRoutes);

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
