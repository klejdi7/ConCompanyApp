import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/*
Employees CRUD
*/
router.get("/employees", authMiddleware, async (req, res) => {
	const list = await prisma.employee.findMany({ orderBy: { createdAt: "desc" } });
	res.json(list);
});

router.get("/employees/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const e = await prisma.employee.findUnique({ where: { id } });
	res.json(e);
});

router.post("/employees", authMiddleware, async (req, res) => {
	const { firstName, lastName, rate, workDays } = req.body;
	const emp = await prisma.employee.create({
		data: { firstName, lastName, rate: Number(rate || 0), workDays: Number(workDays || 0) },
	});
	res.json(emp);
});

router.put("/employees/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const { firstName, lastName, rate, workDays } = req.body;
	const emp = await prisma.employee.update({
		where: { id },
		data: { firstName, lastName, rate: Number(rate || 0), workDays: Number(workDays || 0) },
	});
	res.json(emp);
});

router.delete("/employees/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	await prisma.projectEmployee.deleteMany({ where: { employeeId: id } });
	await prisma.employee.delete({ where: { id } });
	res.json({ message: "Employee deleted" });
});

/*
Projects CRUD
*/
router.get("/projects", authMiddleware, async (req, res) => {
	const list = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
	res.json(list);
});

router.get("/projects/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const p = await prisma.project.findUnique({
		where: { id },
		include: { employees: { include: { employee: true } }, expenses: true, invoices: true },
	});
	res.json(p);
});

router.post("/projects", authMiddleware, async (req, res) => {
	const { name, location, description, offer, total } = req.body;
	const project = await prisma.project.create({
		data: { name, location, description, offer: offer ? Number(offer) : null, total: total ? Number(total) : null },
	});
	res.json(project);
});

router.put("/projects/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const { name, location, description, offer, total } = req.body;
	const project = await prisma.project.update({
		where: { id },
		data: { name, location, description, offer: offer ? Number(offer) : null, total: total ? Number(total) : null },
	});
	res.json(project);
});

router.delete("/projects/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	await prisma.projectEmployee.deleteMany({ where: { projectId: id } });
	await prisma.projectExpense.deleteMany({ where: { projectId: id } });
	await prisma.invoice.deleteMany({ where: { projectId: id } });
	await prisma.project.delete({ where: { id } });
	res.json({ message: "Project deleted" });
});

/*
Project-Employee pivot (assign/unassign)
*/

// GET all project-employee relations with project details
router.get("/employees/:id/projects", async (req, res) => {

	const id = Number(req.params.id);
	const projectEmployees = await prisma.projectEmployee.findMany({
		include: {
			project: true,
			employee: true,
		},
		where: {employeeId : id}
	});

	res.json(projectEmployees);

});

router.post("/projects/:projectId/assign", authMiddleware, async (req, res) => {
	const projectId = Number(req.params.projectId);
	const { employeeId, role } = req.body;
	const rec = await prisma.projectEmployee.create({
		data: { projectId, employeeId: Number(employeeId), role },
	});
	res.json(rec);
});

router.delete("/projects/:projectId/unassign/:employeeId", authMiddleware, async (req, res) => {
	const projectId = Number(req.params.projectId);
	const employeeId = Number(req.params.employeeId);
	await prisma.projectEmployee.deleteMany({ where: { projectId, employeeId } });
	res.json({ message: "Unassigned" });
});

/*
Project Expenses
*/
router.get("/projects/:projectId/expenses", authMiddleware, async (req, res) => {
	const projectId = Number(req.params.projectId);
	const list = await prisma.projectExpense.findMany({ where: { projectId } });
	res.json(list);
});

router.post("/projects/:projectId/expenses", authMiddleware, async (req, res) => {
	const projectId = Number(req.params.projectId);
	const { title, amount, note } = req.body;
	const ex = await prisma.projectExpense.create({
		data: { projectId, title, amount: Number(amount), note },
	});
	res.json(ex);
});

router.put("/expenses/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const { title, amount, note } = req.body;
	const ex = await prisma.projectExpense.update({
		where: { id },
		data: { title, amount: Number(amount), note },
	});
	res.json(ex);
});

router.delete("/expenses/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	await prisma.projectExpense.delete({ where: { id } });
	res.json({ message: "Expense deleted" });
});

/*
Invoices
*/
router.get("/invoices", authMiddleware, async (req, res) => {
	const list = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" } });
	res.json(list);
});

router.get("/invoices/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const inv = await prisma.invoice.findUnique({ where: { id } });
	res.json(inv);
});

router.post("/invoices", authMiddleware, async (req, res) => {
	const { projectId, employeeId, amount, dueDate, note } = req.body;
	const inv = await prisma.invoice.create({
		data: {
		projectId: Number(projectId),
		employeeId: employeeId ? Number(employeeId) : null,
		amount: Number(amount),
		dueDate: dueDate ? new Date(dueDate) : null,
		note,
		},
	});
	res.json(inv);
});

router.put("/invoices/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	const { projectId, employeeId, amount, dueDate, note } = req.body;
	const inv = await prisma.invoice.update({
		where: { id },
		data: {
		projectId: Number(projectId),
		employeeId: employeeId ? Number(employeeId) : null,
		amount: Number(amount),
		dueDate: dueDate ? new Date(dueDate) : null,
		note,
		},
	});
	res.json(inv);
});

router.delete("/invoices/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);
	await prisma.invoice.delete({ where: { id } });
	res.json({ message: "Invoice deleted" });
});


/**
 *  User
 */

router.get("/me", authMiddleware, async (req, res) => {
	const userId = req.user.userId; // comes from authMiddleware

	try {
		const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
		},
		});

		if (!user) return res.status(404).json({ error: "User not found" });

		res.json(user);
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

export default router;
