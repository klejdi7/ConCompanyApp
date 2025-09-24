"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash, FaFilePdf, FaEye } from "react-icons/fa";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import EmployeeModal, { Employee as EmployeeType } from "@/components/employee/EmployeeModal";

import Loading from "@/components/Loading";

export default function EmployeeDetailPage() {
	const { t } = useTranslation();
	const { id } = useParams();
	const router = useRouter();

	const { user, loading: authLoading } = useAuthGuard();

	const [loading, setLoading] = useState(true);
	const [employee, setEmployee] = useState<EmployeeType | null>(null);
	const [projects, setProjects] = useState<any[]>([]);
	const [invoices, setInvoices] = useState<any[]>([]);

	const fetchDetails = async () => {
		if (!id) return;
		setLoading(true);
		try {
			const empRes = await api.get(`/api/employees/${id}`);
			setEmployee(empRes.data ?? null);

			const projectsRes = await api.get(`/api/employees/${id}/projects`);
			setProjects(projectsRes.data ?? []);

			const invoicesRes = await api.get(`/api/employees/${id}/invoices`);
			setInvoices(invoicesRes.data ?? []);
		} catch (err) {
			console.error("Failed to fetch employee details", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!authLoading && user) fetchDetails();
	}, [id, authLoading, user]);

	const handleAction = async (emp: EmployeeType | undefined, mode: "edit" | "delete") => {
		if (!emp || !id) return;

		try {
			if (mode === "edit") {
				await api.put(`/api/employees/${id}`, emp);
				await fetchDetails();
			} else if (mode === "delete") {
				await api.delete(`/api/employees/${id}`);
				router.push("/api/employees");
			}
		} catch (err) {
			console.error("Action failed", err);
			alert("Action failed. See console for details.");
		}
	};

	if (authLoading) return <Loading text="Authenticating..." />;
	if (loading) return <Loading text="Loading employee..." />;
	if (!user) return <Loading text="Redirecting" />;
	if (!employee) return <div className="container mt-5">Employee not found.</div>;

	return (
		<div className="container mt-5">
			{/* Header: Back | Name | Actions */}
			<div className="d-flex align-items-center justify-content-between mb-4">
				<div>
					<button className="btn btn-outline-secondary" onClick={() => router.push("/employees")}>
						<FaArrowLeft className="me-1" /> {t("common.back")}
					</button>
				</div>

				<div>
					{/* Edit modal button */}
					<EmployeeModal
						mode="edit"
						employee={employee}
						onSubmit={(emp) => handleAction(emp, "edit")}
						buttonText={<><FaEdit className="me-1" /> {t("common.edit")}</>}
						className="btn btn-success btn-sm me-2"
					/>

					{/* Delete confirm modal */}
					<EmployeeModal
						mode="delete"
						employee={employee}
						onSubmit={() => handleAction(employee, "delete")}
						buttonText={<><FaTrash className="me-1" /> {t("common.delete")}</>}
						className="btn btn-danger btn-sm me-2"
					/>

					{/* PDF placeholder */}
					<button className="btn btn-outline-danger btn-sm">
						<FaFilePdf className="me-1" /> PDF
					</button>
				</div>
			</div>

			{/* Employee details */}
			<div className="card mb-4">
				<div className="card-body">
					<h5 className="card-title">{t("employees.details.title")}</h5>
					<p className="mb-1"><strong>{t("employees.details.fullName")}:</strong> {employee.firstName} {employee.lastName}</p>
					<p className="mb-1"><strong>{t("employees.details.role")}:</strong> {employee.role?.name || t("employees.details.noRole")}</p>
				</div>
			</div>

			{/* Projects */}
			<div className="card mb-4">
				<div className="card-body">
					<h5 className="card-title">{t("employees.projects.title")}</h5>
					{projects.length === 0 ? (
						<p>{t("employees.projects.noProjects")}</p>
					) : (
						<ul className="list-group">
							{projects.map((p) => (
								<li key={p.project.id} className="list-group-item d-flex justify-content-between align-items-center">
									<div>
										<strong>{p.project.name}</strong> — {p.project.location} <br />
										{t("employees.projects.rate")}: ${p.rate} • {t("employees.projects.workDays")}: ${p.workDays} • {t("employees.projects.total")}: ${p.rate * p.workDays}
									</div>
									<div>
										<Link href={`/projects/${p.project.id}`}>
											<button className="btn btn-light btn-sm me-2">
												<FaEye /> {t("button.viewProject")}
											</button>
										</Link>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Invoices */}
			<div className="card mb-4">
				<div className="card-body">
					<h5 className="card-title">{t("employees.invoices.title")}</h5>
					{invoices.length === 0 ? (
						<p>{t("employees.invoices.noInvoices")}</p>
					) : (
						<ul className="list-group">
							{invoices.map((inv) => (
								<li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
									<div>
										{t("employees.invoices.project")} #{inv.projectId} — ${inv.amount} <br />
										<small className="text-muted">{inv.status}</small>
									</div>
									<div>
										<button className="btn btn-sm btn-outline-primary">{t("employees.invoices.view")}</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}

