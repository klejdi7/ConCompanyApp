"use client";

import { useState } from "react";
import api from "../services/api";

export interface ProjectExpensesModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	onAddExpense: (expenseId: number, quantity: number, price: number) => Promise<void>;
	expenses: any[];
	allExpenses: any[];
	fetchExpenses: () => Promise<void>;
}

export default function ProjectExpensesModal({
	isOpen,
	onClose,
	projectId,
	onAddExpense,
	expenses,
	allExpenses,
	fetchExpenses,
	}: ProjectExpensesModalProps) {

	const [selectedExpense, setSelectedExpense] = useState<number | "new">();
	const [newExpenseName, setNewExpenseName] = useState("");
	const [newCategory, setNewCategory] = useState("");
	const [quantity, setQuantity] = useState<number>(1);
	const [price, setPrice] = useState<number>(0);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let expenseId: number;

			if (selectedExpense === "new") {
				// 1. create category if needed
				const categoryRes = await api.post("/api/expense-categories", { name: newCategory });
				const categoryId = categoryRes.data.id;

				// 2. create expense
				const expenseRes = await api.post("/api/expenses", {
					name: newExpenseName,
					expenseCatId: categoryId,
				});
				expenseId = expenseRes.data.id;
			} else {
				expenseId = Number(selectedExpense);
			}

			// 3. link expense to project
			await onAddExpense(expenseId, quantity, price);

			// 4. refresh project
			await fetchExpenses();

			// reset form
			setSelectedExpense(undefined);
			setNewExpenseName("");
			setNewCategory("");
			setQuantity(1);
			setPrice(0);
		} catch (err) {
			console.error("Failed to add expense:", err);
		}
	};

	return (
		<div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
			<div className="modal-dialog modal-xl">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Project Expenses</h5>
						<button className="btn-close" onClick={onClose}></button>
					</div>
					<div className="modal-body">
						{/* Add Expense Form */}
						<form onSubmit={handleSubmit} className="row g-2 mb-3">
							<div className="col-md-4">
								<select
								className="form-select"
								value={selectedExpense ?? ""}
								onChange={(e) =>
									setSelectedExpense(e.target.value === "new" ? "new" : Number(e.target.value))
								}
								required
								>
									<option value="">Select Expense</option>
										{allExpenses.map((exp) => (
											<option key={exp.id} value={exp.id}>
											{exp.name} ({exp.expenseCategories?.name})
											</option>
										))}
										<option value="new">+ Add new expense</option>
								</select>
							</div>

							{selectedExpense === "new" && (
								<>
									<div className="col-md-3">
										<input
										type="text"
										className="form-control"
										placeholder="Expense Name"
										value={newExpenseName}
										onChange={(e) => setNewExpenseName(e.target.value)}
										required
										/>
									</div>
									<div className="col-md-3">
										<input
										type="text"
										className="form-control"
										placeholder="Category"
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value)}
										required
										/>
									</div>
								</>
							)}

							<div className="col-md-2">
								<input
								type="number"
								className="form-control"
								placeholder="Qty"
								min={1}
								value={quantity}
								onChange={(e) => setQuantity(Number(e.target.value))}
								required
								/>
							</div>
							<div className="col-md-2">
								<input
								type="number"
								className="form-control"
								placeholder="Price"
								min={0}
								step="0.01"
								value={price}
								onChange={(e) => setPrice(Number(e.target.value))}
								required
								/>
							</div>
							<div className="col-md-2">
								<button type="submit" className="btn btn-primary w-100">
									Add
								</button>
							</div>
						</form>

						{/* Expenses Table */}
						<table className="table table-striped">
							<thead>
								<tr>
									<th>Name</th>
									<th>Category</th>
									<th>Quantity</th>
									<th>Price</th>
								</tr>
							</thead>
							<tbody>
								{expenses.length === 0 ? (
								<tr>
									<td colSpan={4} className="text-center">
										No expenses found.
									</td>
								</tr>
								) : (
								expenses.map((pe: any) => (
									<tr key={pe.id}>
										<td>{pe.expenses.name}</td>
										<td>{pe.expenses.expenseCategories?.name}</td>
										<td>{pe.Quantity}</td>
										<td>{pe.price}</td>
									</tr>
								))
								)}
							</tbody>
						</table>
					</div>
					<div className="modal-footer">
						<button className="btn btn-secondary" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
