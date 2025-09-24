import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import generalRoutes from "./routes/general.js";
import pdfGenerate from "./routes/pdfGenerate.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/api", generalRoutes);
app.use("/pdf", pdfGenerate);

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
