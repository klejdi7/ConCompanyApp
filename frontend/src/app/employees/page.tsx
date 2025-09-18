"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import api from "../../services/api";
import EmployeeModal, { Employee } from "../../components/EmployeeModal";
import Loading from "@/components/Loading"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";

export default function EmployeesPage() {
	const { token } = useAuth();
	const { user, loading } = useAuthGuard();
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	// Fetch employees from backend
	const fetchEmployees = async () => {
		if (!token) return;
		try {
			const res = await api.get("/api/employees");
			setEmployees(res.data);
		} catch (err) {
			console.error("Failed to fetch employees", err);
		}
	};

	// Fetch on page load or when token/user changes
	useEffect(() => {
		if (token && user) fetchEmployees();
	}, [token, user]);

	const handleAction = async (employee: Employee | undefined, mode: "add" | "edit" | "delete") => {
		try {
			if (mode === "add" && employee) {
				await api.post("/api/employees", employee);
			}
			if (mode === "edit" && employee) {
				await api.put(`/api/employees/${employee.id}`, employee);
			}
			if (mode === "delete" && employee) {
				await api.delete(`/api/employees/${employee.id}`);
			}

			// Refresh list after action
			await fetchEmployees();
		} catch (err) {
			console.log("Action failed");
		}
	};

	if (loading) return <Loading text="Loading employees..." />;
	if (!user) return <Loading text="Redirecting" />;

	return (
		<div className="container mt-5">
			<h1>Employees</h1>

			{/* Add Employee Button + Modal */}
			<EmployeeModal mode="add" onSubmit={(emp) => handleAction(emp, "add")} />

			{/* Employees Table */}
			<table className="table mt-3">
				<thead>
					<tr>
						<th scope="col">Name</th>
						<th scope="col">Last Name</th>
						<th scope="col">Rate</th>
						<th scope="col">Work Days</th>
						<th scope="col">Total</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{employees.map((emp) => (
						<tr key={emp.id}>
							<td>{emp.firstName}</td>
							<td>{emp.lastName}</td>
							<td>{emp.rate}</td>
							<td>{emp.workDays}</td>
							<td>{emp.workDays * emp.rate} Eu</td>
							<td>
								<Link href={`/employees/${emp.id}`}>
									<button className="btn btn-primary btn-sm me-2">
										<FaEye /> View Employee
									</button>
								</Link>
								<EmployeeModal
									mode="edit"
									employee={emp}
									onSubmit={(emp) => handleAction(emp, "edit")}
									buttonText={<><FaEdit /> Edit </>}
									className="btn btn-success btn-sm me-2"
								/>
								<EmployeeModal
									mode="delete"
									employee={emp}
									onSubmit={(emp) => handleAction(emp, "delete")}
									buttonText={<><FaTrash /> Delete </>}
									className="btn btn-danger btn-sm"
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
