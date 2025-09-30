import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register
router.post("/register", async (req, res) => {
	const { email, password, name } = req.body;
	
	if (!email || !password || !name) {
		return res.status(400).json({ error: "All fields are required" });
	}
	
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, password: hashedPassword, name },
		});
		res.json({ id: user.id, email: user.email, name: user.name });
	} catch (e) {
		console.error("Register error:", e);
		if (e.code === 'P2002') {
			res.status(400).json({ error: "Email already exists" });
		} else {
			res.status(500).json({ error: "Registration failed" });
		}
	}
});

// Login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	
	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}
	
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return res.status(401).json({ error: "Invalid credentials" });

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) return res.status(401).json({ error: "Invalid credentials" });

		const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
		res.json({ 
			token, 
			user: { 
				id: user.id, 
				email: user.email, 
				name: user.name ,
				preferences: user.preferences
			} 
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Login failed" });
	}
});

// Get current user profile
router.get("/user/profile", authMiddleware, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user.userId },
			select: { id: true, email: true, name: true, createdAt: true }
		});
		
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		
		res.json(user);
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({ error: "Failed to get user profile" });
	}
});

// Update user profile
router.post("/user/update", authMiddleware, async (req, res) => {
	const { name, email } = req.body;
	const userId = req.user.userId;

	if (!name || !email) {
		return res.status(400).json({ error: "Name and email are required" });
	}

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { name, email },
			select: { id: true, name: true, email: true }
		});
		res.json(updatedUser);
	} catch (error) {
		console.error("Error updating user profile:", error);
		if (error.code === 'P2002') {
			res.status(400).json({ error: "Email already exists" });
		} else {
			res.status(500).json({ error: "Failed to update user profile" });
		}
	}
});

// Update user password
router.put("/user/password", authMiddleware, async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	const userId = req.user.userId;

	if (!currentPassword || !newPassword) {
		return res.status(400).json({ error: "Current password and new password are required" });
	}

	if (newPassword.length < 6) {
		return res.status(400).json({ error: "New password must be at least 6 characters long" });
	}

	try {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return res.status(404).json({ error: "User not found" });

		const isValid = await bcrypt.compare(currentPassword, user.password);
		if (!isValid) return res.status(401).json({ error: "Current password is incorrect" });

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Password update error:", error);
		res.status(500).json({ error: "Failed to update password" });
	}
});

export default router;