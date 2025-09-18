import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register
router.post("/register", async (req, res) => {
	const { email, password, name } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	try {
		const user = await prisma.user.create({
		data: { email, password: hashedPassword, name },
		});
		res.json({ id: user.id, email: user.email });
	} catch (e) {
		res.status(400).json({ error: "Email already exists" });
	}
});

// Login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ error: "Invalid credentials" });

	const valid = await bcrypt.compare(password, user.password);
	if (!valid) return res.status(401).json({ error: "Invalid credentials" });

	const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
	res.json({ token });
});


export default router;
