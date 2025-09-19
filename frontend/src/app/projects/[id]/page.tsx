"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Loading from "../../../components/Loading"; // reusable loading animation
import ProjectExpensesModal from "@/components/ProjectExpensesModal";

export default function ProjectDetailPage() {
	const { token } = useAuth();
	const router = useRouter();
	const { id } = useParams();

	const [project, setProject] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [allExpenses, setAllExpenses] = useState<any[]>([]);
	const [showExpensesModal, setShowExpensesModal] = useState(false);

	// Fetch project (with relations)
	const fetchProject = async () => {
		if (!token) return;
		try {
			const res = await api.get(`/api/projects/${id}`);
			setProject(res.data);
		} catch (err) {
			console.error("Failed to fetch project:", err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch all available expenses for dropdown
	const fetchAllExpenses = async () => {
		if (!token) return;
		try {
			const res = await api.get(`/api/expenses`);
			setAllExpenses(res.data);
		} catch (err) {
			console.error("Failed to fetch expenses:", err);
		}
	};

	// Add expense to project
	const handleAddExpense = async (expenseId: number, quantity: number, price: number) => {
		try {
			await api.post(
				`/api/projects/${id}/expenses`,
				{ expenseId, quantity, price },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			await fetchProject();
		} catch (err) {
			console.error("Failed to add expense:", err);
		}
	};

	useEffect(() => {
		fetchProject();
		fetchAllExpenses();
	}, [token]);

	if (loading) return <Loading />;
	if (!project) return <p>Project not found.</p>;

	return (
		<div className="container mt-4">
			<button className="btn btn-secondary mb-3" onClick={() => router.back()}>
				Back
			</button>

			<h2>{project.name}</h2>
			<p><strong>Location:</strong> {project.location}</p>
			<p><strong>Description:</strong> {project.description}</p>

			<hr />

			<h4>Employees</h4>
			{project.employees.length === 0 ? (
				<p>No employees assigned.</p>
			) : (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Name</th>
							<th>Rate</th>
							<th>Work Days</th>
						</tr>
					</thead>
					<tbody>
						{project.employees.map((pe: any) => (
							<tr key={pe.id}>
								<td>{pe.employee.firstName} {pe.employee.lastName}</td>
								<td>{pe.employee.rate}</td>
								<td>{pe.employee.workDays}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<hr />

			<h4>Invoices</h4>
			{project.invoices.length === 0 ? (
				<p>No invoices yet.</p>
			) : (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Amount</th>
							<th>Created At</th>
						</tr>
					</thead>
					<tbody>
						{project.invoices.map((inv: any) => (
							<tr key={inv.id}>
								<td>{inv.amount}</td>
								<td>{new Date(inv.createdAt).toLocaleDateString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<hr />

			<h4>Expenses</h4>
			{project.ProjectExpenses.length === 0 ? (
				<p>No expenses yet.</p>
			) : (
				<>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Name</th>
								<th>Category</th>
								<th>Price</th>
								<th>Quantity</th>
							</tr>
						</thead>
						<tbody>
							{project.ProjectExpenses.slice(0, 3).map((pe: any) => (
								<tr key={pe.id}>
									<td>{pe.expenses.name}</td>
									<td>{pe.expenses.expenseCategories.name}</td>
									<td>{pe.price}</td>
									<td>{pe.Quantity}</td>
								</tr>
							))}
						</tbody>
					</table>

				</>
			)}

			<button
				className="btn btn-outline-primary"
				onClick={() => setShowExpensesModal(true)}
			>
				View All
			</button>
			
			<ProjectExpensesModal
				isOpen={showExpensesModal}
				onClose={() => setShowExpensesModal(false)}
				projectId={project.id}
				onAddExpense={handleAddExpense}
				expenses={project.ProjectExpenses}
				allExpenses={allExpenses}
				fetchExpenses={fetchProject}
			/>

			<hr />

			<h4>Offers</h4>
			{project.ProjectOffers.length === 0 ? (
				<p>No offers yet.</p>
			) : (
				<ul>
					{project.ProjectOffers.map((offer: any) => (
						<li key={offer.id}>
							{offer.name || "Unnamed"} - {offer.offer} -{" "}
							<a href={offer.file} target="_blank">View File</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
