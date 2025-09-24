import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import * as f from "./functions.js";

const router = express.Router();
const prisma = new PrismaClient();


/*
Roles CRUD
*/
router.get("/roles", authMiddleware, async (req, res) => {
	try {
		const list = await prisma.role.findMany({ 
			orderBy: { name: "asc" } 
		});
		res.json(list);
	} catch (err) {
		console.error("Error fetching roles:", err);
		res.status(500).json({ error: "Failed to fetch roles" });
	}
});

router.post("/roles", authMiddleware, async (req, res) => {
	try {
		const { name } = req.body;
		const role = await prisma.role.create({
			data: { name },
		});
		res.json(role);
	} catch (err) {
		console.error("Error creating role:", err);
		res.status(500).json({ error: "Failed to create role" });
	}
});

/*
Employees CRUD
*/

router.get("/employees", authMiddleware, async (req, res) => {
	try {
		const list = await prisma.employee.findMany({ 
			include: {
				role: true // Include role information
			},
			orderBy: { createdAt: "desc" } 
		});
		res.json(list);
	} catch (err) {
		console.error("Error fetching employees:", err);
		res.status(500).json({ error: "Failed to fetch employees" });
	}
});

router.get("/employees/:id", authMiddleware, async (req, res) => {
const id = Number(req.params.id);
const e = await prisma.employee.findUnique({ 
	where: { id },
	include: {
	role: true // Include role information
	}
});
res.json(e);
});

router.post("/employees", authMiddleware, async (req, res) => {
try {
	const { firstName, lastName, roleId, roleName } = req.body;
	
	// Get or create role
	const finalRoleId = await f.addOrCreateRole(roleId, roleName);
	
	console.log(roleName);
	const emp = await prisma.employee.create({
	data: { 
		firstName, 
		lastName, 
		roleId: finalRoleId 
	},
	});
	res.json(emp);
} catch (err) {
	console.error("Error creating employee:", err);
	res.status(500).json({ error: "Failed to create employee" });
}
});

router.put("/employees/:id", authMiddleware, async (req, res) => {
try {
	const id = Number(req.params.id);
	const { firstName, lastName, roleId, roleName } = req.body;
	
	// Get or create role
	const finalRoleId = await f.addOrCreateRole(roleId, roleName);
	
	const emp = await prisma.employee.update({
	where: { id },
	data: { 
		firstName, 
		lastName, 
		roleId: finalRoleId 
	},
	});
	res.json(emp);
} catch (err) {
	console.error("Error updating employee:", err);
	res.status(500).json({ error: "Failed to update employee" });
}
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

router.post("/projects", authMiddleware, async (req, res) => {
	const { name, location, description } = req.body;
	const project = await prisma.project.create({
		data: { name, location, description },
	});
	res.json(project);
});

router.get("/projects/:id", authMiddleware, async (req, res) => {
	const id = Number(req.params.id);

	try {
		const project = await prisma.project.findUnique({
			where: { id },
			include: {
				employees: {
					include: {
						employee: {
							include: { role: true },
						},
					},
				},
				invoices: true,
				ProjectExpenses: {
					include: { expenses: { include: { expenseCategories: true } } },
				},
				ProjectOffers: true,
			},
		});

		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		} 

		// Format employees to match the requested structure
		const formattedEmployees = project.employees.map((pe) => ({
			id: pe.employee.id,
			firstName: pe.employee.firstName,
			lastName: pe.employee.lastName,
			roleId: pe.employee.roleId,
			createdAt: pe.employee.createdAt,
			updatedAt: pe.employee.updatedAt,
			role: pe.employee.role,
			projectEmployeeId: pe.id,
			workDays: pe.workDays,
			rate: pe.rate
		}));

		res.json({
			...project,
			employees: formattedEmployees,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Failed to fetch project details" });
	}
});

router.put("/projects/:id", authMiddleware, async (req, res) => {
	try {
		const id = Number(req.params.id);
		const { name, location, description } = req.body;

		const project = await prisma.project.update({
			where: { id },
			data: {
				name,
				location,
				description
			},
		});

		res.json(project);
	} catch (err) {
		console.error("Error updating project:", err);
		res.status(500).json({ error: "Failed to update project" });
	}
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
Project Relation Endpoints (assign/unassign)
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
	try {
		const projectId = Number(req.params.projectId);
		const { employeeIds } = req.body; // Array of employee IDs

		// Validate input
		if (!Array.isArray(employeeIds)) {
			return res.status(400).json({ error: "employeeIds must be an array" });
		}

		// Check if project exists
		const project = await prisma.project.findUnique({
			where: { id: projectId }
		});

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		// Remove employees not in the provided list
		await prisma.projectEmployee.deleteMany({
			where: {
				projectId,
				employeeId: {
					notIn: employeeIds.map(id => Number(id))
				}
			}
		});

		// Add or keep employees in the provided list
		const assignments = await Promise.all(
			employeeIds.map(async (employeeId) => {
				// Check if assignment already exists
				const existingAssignment = await prisma.projectEmployee.findFirst({
					where: {
						projectId,
						employeeId: Number(employeeId)
					}
				});

				if (existingAssignment) {
					return existingAssignment; // Keep existing assignment
				}

				// Create new assignment
				return await prisma.projectEmployee.create({
					data: {
						projectId,
						employeeId: Number(employeeId),
						rate: 0, // Default values
						workDays: 0
					}
				});
			})
		);

		res.json({
			message: "Employees assigned successfully",
			assignments: assignments.filter(assignment => assignment !== null)
		});
	} catch (err) {
		console.error("Assignment error:", err);
		res.status(500).json({ error: "Failed to assign employees" });
	}
});

// Add this new endpoint to handle bulk unassignment
router.post("/projects/:projectId/unassign", authMiddleware, async (req, res) => {
try {
	const projectId = Number(req.params.projectId);
	const { employeeIds } = req.body;

	if (!Array.isArray(employeeIds)) {
	return res.status(400).json({ error: "employeeIds must be an array" });
	}

	await prisma.projectEmployee.deleteMany({
	where: {
		projectId,
		employeeId: {
		in: employeeIds.map(id => Number(id))
		}
	}
	});

	res.json({ message: "Employees unassigned successfully" });
} catch (err) {
	console.error("Unassignment error:", err);
	res.status(500).json({ error: "Failed to unassign employees" });
}
});

router.delete("/projects/:projectId/unassign/:employeeId", authMiddleware, async (req, res) => {
	const projectId = Number(req.params.projectId);
	const employeeId = Number(req.params.employeeId);
	await prisma.projectEmployee.deleteMany({ where: { projectId, employeeId } });
	res.json({ message: "Unassigned" });
});

router.post("/projects/:id/expenses", authMiddleware, async (req, res) => {
	try {
		const projectId = Number(req.params.id);
		const { expenseId, expenseName, categoryName, price, quantity } = req.body;

		const finalExpenseId = await f.addOrCreateExpense(expenseId, expenseName, categoryName);

		// Add to ProjectExpenses
		const projectExpense = await prisma.projectExpenses.create({
			data: {
				projectId,
				expenseId: finalExpenseId,
				price: price ? Number(price) : 0,
				Quantity: quantity ? Number(quantity) : 1,
			},
		});

		res.json(projectExpense);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to add expense to project" });
	}
});

/*
Project Expenses
*/

router.get("/expenses", authMiddleware, async (req, res) => {
	const list = await prisma.expenses.findMany({ orderBy: { createdAt: "desc" } });
	res.json(list);
});

router.put("/projects/:projectId/expenses/:expenseId", authMiddleware, async (req, res) => {
	const { projectId, expenseId } = req.params;
	const { Quantity, price } = req.body;

	try {
		const updated = await prisma.projectExpenses.update({
			where: { id: Number(expenseId) },
			data: { Quantity, price },
		});
		res.json(updated);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to update project expense" });
	}
});


router.delete("/projects/:projectId/expenses/:expenseId", authMiddleware, async (req, res) => {
	const { expenseId } = req.params;

	try {
		await prisma.projectExpenses.delete({
		where: { id: Number(expenseId) },
		});
		res.json({ success: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to delete project expense" });
	}
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

// Update projectEmployee rate and workDays
router.put("/project-employees/:id", authMiddleware, async (req, res) => {
	try {
		const id = Number(req.params.id);
		const { projectId, rate, workDays } = req.body;

		const updatedProjectEmployee = await prisma.projectEmployee.update({
			where: { id },
			data: { rate, workDays },
		});

		res.json(updatedProjectEmployee);
	} catch (err) {
		console.error("Error updating project employee:", err);
		res.status(500).json({ error: "Failed to update project employee" });
	}
});

export default router;
