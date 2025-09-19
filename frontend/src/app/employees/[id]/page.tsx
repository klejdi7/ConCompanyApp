"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaTrash, FaFilePdf } from "react-icons/fa";

import api from "../../../services/api";
import { useAuthGuard } from "../../../hooks/useAuthGuard";
import EmployeeModal, { Employee as EmployeeType } from "../../../components/EmployeeModal";

import Loading from "../../../components/Loading";

export default function EmployeeDetailPage() {
const { id } = useParams(); // string | undefined
const router = useRouter();

const { user, loading: authLoading } = useAuthGuard();

const [loading, setLoading] = useState(true);
const [employee, setEmployee] = useState<EmployeeType | null>(null);
const [projects, setProjects] = useState<any[]>([]);
const [invoices, setInvoices] = useState<any[]>([]);

// Fetch employee details, projects and invoices
const fetchDetails = async () => {
	if (!id) return;
	setLoading(true);
	try {

	const empRes = await api.get(`/api/employees/${id}`);
	setEmployee(empRes.data ?? null);

	const [projectsRes, invoicesRes] = await Promise.all([
		api.get(`/api/employees/${id}/projects`),
		api.get(`/api/employees/${id}/invoices`),
	]);

	setProjects(projectsRes.data ?? []);
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

// One handler for edit/delete actions from the modal
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
					<FaArrowLeft className="me-1" /> Back
				</button>
			</div>

			<div>
				{/* Edit modal button */}
				<EmployeeModal
					mode="edit"
					employee={employee}
					onSubmit={(emp) => handleAction(emp, "edit")}
					buttonText={<><FaEdit className="me-1" /> Edit</>}
					className="btn btn-success btn-sm me-2"
				/>

				{/* Delete confirm modal */}
				<EmployeeModal
					mode="delete"
					employee={employee}
					onSubmit={() => handleAction(employee, "delete")}
					buttonText={<><FaTrash className="me-1" /> Delete</>}
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
				<h5 className="card-title">Employee Details</h5>
				<p className="mb-1"><strong>Full Name:</strong> {employee.firstName} {employee.lastName}</p>
				<p className="mb-1"><strong>Rate:</strong> ${employee.rate}</p>
				<p className="mb-1"><strong>Work days:</strong> {employee.workDays}</p>
			{/* Add more employee fields here as needed */}
			</div>
		</div>

		{/* Projects */}
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Projects</h5>
				{projects.length === 0 ? (
					<p>No projects assigned.</p>
				) : (
					<ul className="list-group">
						{projects.map((p) => (
							<li key={p.id} className="list-group-item">
								<strong>{p.name}</strong> — {p.location} <br />
								Offer: ${p.offer} • Total: ${p.total}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>

		{/* Invoices */}
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Invoices</h5>
				{invoices.length === 0 ? (
					<p>No invoices found.</p>
				) : (
					<ul className="list-group">
					{invoices.map((inv) => (
						<li key={inv.id} className="list-group-item d-flex justify-content-between align-items-center">
						<div>
							Project #{inv.projectId} — ${inv.amount} <br />
							<small className="text-muted">{inv.status}</small>
						</div>
						<div>
							{/* you can add invoice actions here later */}
							<button className="btn btn-sm btn-outline-primary">View</button>
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
