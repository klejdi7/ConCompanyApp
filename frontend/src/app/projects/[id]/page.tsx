"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Loading from "../../../components/Loading" // reusable loading animation
import ProjectExpensesModal from "@/components/ProjectExpensesModal";
import EmployeeSelectModal from "@/components/EmployeeSelectModal";
import { FaUserPlus } from "react-icons/fa";
import EmployeesDataComp from "@/components/EmployeesDataComp";

export default function ProjectDetailPage() {
	const { token } = useAuth();
	const router = useRouter();
	const { id } = useParams();

	const [project, setProject] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [allExpenses, setAllExpenses] = useState<any[]>([]);
	const [showExpensesModal, setShowExpensesModal] = useState(false);
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);

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
	const handleAddExpense = async (expenseId: number, name: string, category: string,quantity: number, price: number) => {
		try {
			await api.post(
				`/api/projects/${id}/expenses`,
				{ expenseId, expenseName: name, categoryName: category, quantity, price },
			);
			await fetchProject();
			fetchAllExpenses();
		} catch (err) {
			console.error("Failed to add expense:", err);
		}
	};

	const handleAssignEmployees = async (employeeIds: number[]) => {
		try {
			await api.post(`/api/projects/${id}/assign`, { employeeIds });
			await fetchProject();
		} catch (err) {
			console.error("Failed to assign employees:", err);
		}
	};

	useEffect(() => {
		fetchProject();
		fetchAllExpenses();
	}, [token]);

	if (loading) return <Loading />;
	if (!project) return <p>Project not found.</p>;

	const existingEmployeeIds = project.employees.map((pe: any) => pe.id);

	return (
		<div className="container mt-4">
			<button className="btn btn-secondary mb-3" onClick={() => router.back()}>
				Back
			</button>

			<h2>{project.name}</h2>
			<p><strong>Location:</strong> {project.location}</p>
			<p><strong>Description:</strong> {project.description}</p>

			<hr />

			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>Employees</h4>
				<button
					className="btn btn-success btn-sm"
					onClick={() => setShowEmployeeModal(true)}
				>
				<i className="me-1"><FaUserPlus /></i> Assign Employees
				</button>
			</div>

			{project.employees.length === 0 ? (
				<p>No employees assigned.</p>
			) : (
				<EmployeesDataComp 
					mode="table" 
					employees={project.employees} 
					limit={3} 
					displayActions={false} 
					projectMode={true}
					callback={fetchProject}
				/>
			)}

			{/* Employee Selection Modal */}
			<EmployeeSelectModal
				isOpen={showEmployeeModal}
				onClose={() => setShowEmployeeModal(false)}
				projectId={Number(id)}
				onAssign={handleAssignEmployees}
				existingEmployees={existingEmployeeIds}
			/>

			<EmployeesDataComp
				mode="modal"
				employees={project.employees}
				limit={undefined}
				displayActions={false}
				projectMode={true}
				callback={fetchProject}
			/>

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
