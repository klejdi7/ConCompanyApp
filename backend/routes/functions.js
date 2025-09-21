import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function addOrCreateExpense(expenseId, expenseName, categoryName) {

	if (expenseId) return expenseId;

	if (!expenseName || !categoryName) {
		throw new Error("New expense requires name and category");
	}

	let category = await prisma.expenseCategories.findFirst({
		where: { name: categoryName },
	});
	if (!category) {
		category = await prisma.expenseCategories.create({
			data: { name: categoryName },
		});
	}

	let expense = await prisma.expenses.findFirst({
		where: {
			name: expenseName,
			expenseCatId: category.id,
		},
	});

	if (!expense) {
		expense = await prisma.expenses.create({
			data: {
				name: expenseName,
				expenseCatId: category.id,
			},
		});
	}

	return expense.id;
}

export async function addOrCreateRole(roleId, roleName) {
	if (roleId && roleId > 0) {
		const existingRole = await prisma.role.findUnique({
			where: { id: roleId }
		});
		if (existingRole) return roleId;
	}

	if (!roleName) {
		throw new Error("Role name is required when creating a new role");
	}

	let role = await prisma.role.findFirst({
		where: { name: roleName },
	});
	console.log("role enter")
	if (!role) {
		role = await prisma.role.create({
			data: { name: roleName },
		});
	}

	return role.id;
}