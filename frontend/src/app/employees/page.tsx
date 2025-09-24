"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import api from "../../services/api";
import EmployeeModal, { Employee } from "@/components/employee/EmployeeModal";
import EmployeesDataComp from "@/components/employee/EmployeesDataComp";
import Loading from "@/components/Loading"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function EmployeesPage() {
	const { t } = useTranslation();
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

	const handleNew = async (employee: Employee) => {
		try {
			await api.post("/api/employees", employee);
			await fetchEmployees();
		} catch (err) {
			console.log("Action failed");
		}
	};

	if (loading) return <Loading text={t("common.loading")} />;
	if (!user) return <Loading text={t("common.redirecting")} />;

	return (
		<div className="container mt-5">
			<h1>{t("employees.title")}</h1>

			{/* Add Employee Button + Modal */}
			<EmployeeModal mode="add" onSubmit={(emp) => emp && handleNew(emp)} />

			{/* Employees Table */}
			<EmployeesDataComp 
				mode="table" 
				employees={employees} 
				allowSearch={true} 
				callback={fetchEmployees} 
			/>
		</div>
	);
}