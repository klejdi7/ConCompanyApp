"use client";

import { useState } from "react";
import api from "@/services/api";
import { useTranslation } from "react-i18next";

export interface ProjectExpensesModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	onAddExpense: (expenseId: number, name: string, category: string,quantity: number, price: number) => Promise<void>;
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
	const { t } = useTranslation();

	const [selectedExpense, setSelectedExpense] = useState<number | "new">();
	const [newExpenseName, setNewExpenseName] = useState("");
	const [newCategory, setNewCategory] = useState("");
	const [quantity, setQuantity] = useState<number>(1);
	const [price, setPrice] = useState<number>(0);

	const [editRow, setEditRow] = useState<number | null>(null);
	const [editQuantity, setEditQuantity] = useState<number>(0);
	const [editPrice, setEditPrice] = useState<number>(0);

	const [deleteRow, setDeleteRow] = useState<number | null>(null);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			let expenseId = Number(selectedExpense) || 0;

			await onAddExpense(expenseId, newExpenseName, newCategory, quantity,  price);
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

	const handleEdit = (pe: any) => {
		setEditRow(pe.id);
		setEditQuantity(pe.Quantity);
		setEditPrice(pe.price);
	};

	const handleSave = async (id: number) => {
		try {
			await api.put(`/api/projects/${projectId}/expenses/${id}`, {
				Quantity: editQuantity,
				price: editPrice,
			});
			await fetchExpenses();
			setEditRow(null);
		} catch (err) {
			console.error("Failed to update expense:", err);
		}
	};

	const handleDelete = async () => {
		if (!deleteRow) return;
		try {
			await api.delete(`/api/projects/${projectId}/expenses/${deleteRow}`);
			await fetchExpenses();
			setDeleteRow(null);
		} catch (err) {
			console.error("Failed to delete expense:", err);
		}
	};
	
	return (
		<div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
			<div className="modal-dialog modal-xl">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{t("expenses.title")}</h5>
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
									<option value="">{t("expenses.selectExpense")}</option>
										{allExpenses.map((exp) => (
											<option key={exp.id} value={exp.id}>
												{exp.name} ({exp.expenseCategories?.name})
											</option>
										))}
										<option value="new">+ {t("expenses.addNewExpense")}</option>
								</select>
							</div>

							{selectedExpense === "new" && (
								<>
									<div className="col-md-4">
										<input
										type="text"
										className="form-control"
										placeholder={t("expenses.name")}
										value={newExpenseName}
										onChange={(e) => setNewExpenseName(e.target.value)}
										required
										/>
									</div>
									<div className="col-md-4">
										<input
										type="text"
										className="form-control"
										placeholder={t("expenses.category")}
										value={newCategory}
										onChange={(e) => setNewCategory(e.target.value)}
										required
										/>
									</div>
								</>
							)}

							<div className="col-md-4">
								<div className="row align-items-center">
									<div className="col-md-4">
										<label className="col-form-label">{t("expenses.quantity")}:</label>
									</div>
									<div className="col-md-8">
										<input
											type="number"
											className="form-control"
											id="quantityInput"
											placeholder={t("expenses.qty")}
											min={1}
											required
											onChange={(e) => setQuantity(Number(e.target.value))}
										/>
									</div>
								</div>
							</div>
							
							<div className="col-md-4">
								<div className="row align-items-center">
									<div className="col-md-4">
										<label className="col-form-label">{t("expenses.price")}:</label>
									</div>
									<div className="col-md-8">
										<input
											type="number"
											className="form-control"
											id="priceInput"
											placeholder={t("expenses.price")}
											min={0}
											step="0.01"
											required
											onChange={(e) => setPrice(Number(e.target.value))}
										/>
									</div>
								</div>
							</div>
							<div className="col-md-2">
								<button type="submit" className="btn btn-primary w-100">
									{t("expenses.add")}
								</button>
							</div>
						</form>

						{/* Expenses Table */}
						<table className="table table-striped">
							<thead>
								<tr>
									<th>{t("expenses.name")}</th>
									<th>{t("expenses.category")}</th>
									<th>{t("expenses.quantity")}</th>
									<th>{t("expenses.price")}</th>
									<th>{t("expenses.total")}</th>
								</tr>
							</thead>
							<tbody>
								{expenses.length === 0 ? (
								<tr>
									<td colSpan={4} className="text-center">
										{t("expenses.noExpensesFound")}
									</td>
								</tr>
								) : (
								expenses.map((pe: any) => (
									<tr key={pe.id}>
									<td>{pe.expenses.name}</td>
									<td>{pe.expenses.expenseCategories?.name}</td>
									<td>
										{editRow === pe.id ? (
										<input
											type="number"
											className="form-control"
											value={editQuantity}
											onChange={(e) => setEditQuantity(Number(e.target.value))}
										/>
										) : (
										pe.Quantity
										)}
									</td>
									<td>
										{editRow === pe.id ? (
										<input
											type="number"
											className="form-control"
											value={editPrice}
											onChange={(e) => setEditPrice(Number(e.target.value))}
										/>
										) : (
										pe.price
										)}
									</td>
									<td> {pe.price * pe.Quantity} </td>
									<td>
										{editRow === pe.id ? (
										<button
											className="btn btn-success btn-sm me-2"
											onClick={() => handleSave(pe.id)}
										>
											{t("expenses.save")}
										</button>
										) : (
										<button
											className="btn btn-warning btn-sm me-2"
											onClick={() => handleEdit(pe)}
										>
											{t("expenses.edit")}
										</button>
										)}
										<button
										className="btn btn-danger btn-sm"
										onClick={() => setDeleteRow(pe.id)}
										>
										{t("expenses.delete")}
										</button>
									</td>
									</tr>
								))
								)}
							</tbody>
						</table>
						{/* Total Section */}
						{expenses.length > 0 && (
						<div className="text-end mt-2">
							<h5>
							{t("expenses.totalExpenses")}:{" "}
							{expenses.reduce((acc, pe) => acc + pe.price * pe.Quantity, 0).toFixed(2)}
							</h5>
						</div>
						)}
					</div>
					<div className="modal-footer">
						<button className="btn btn-secondary" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
			{/* Delete modal */}
			{deleteRow && (
				<div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
					<div className="modal-dialog modal-sm">
						<div className="modal-content">
							<div className="modal-body">
								<p>{t("expenses.confirmDelete")}</p>
								<div className="d-flex justify-content-end">
									<button className="btn btn-secondary me-2" onClick={() => setDeleteRow(null)}>
										{t("expenses.cancel")}
									</button>
									<button className="btn btn-danger" onClick={handleDelete}>
										{t("expenses.delete")}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
