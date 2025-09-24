"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import Loading from "../../../components/Loading";
import ProjectExpensesModal from "@/components/project/ProjectExpensesModal";
import EmployeeSelectModal from "@/components/employee/EmployeeSelectModal";
import { FaUserPlus, FaDownload } from "react-icons/fa";
import EmployeesDataComp from "@/components/employee/EmployeesDataComp";
import { useTranslation } from "react-i18next";

export default function ProjectDetailPage() {
	const { t } = useTranslation();
	const { token } = useAuth();
	const router = useRouter();
	const { id } = useParams();

	const [project, setProject] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [allExpenses, setAllExpenses] = useState<any[]>([]);
	const [showExpensesModal, setShowExpensesModal] = useState(false);
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [offers, setOffers] = useState<any[]>([]);
	const [generatingOffers, setGeneratingOffers] = useState<Set<number>>(new Set());

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

	const fetchOffers = async () => {
		if (!token) return;
		try {
			const res = await api.get(`/pdf/projects/${id}/offers`);
			setOffers(res.data);
		} catch (err) {
			console.error("Failed to fetch offers:", err);
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
	const handleAddExpense = async (expenseId: number, name: string, category: string, quantity: number, price: number) => {
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

	const handleGenerateOffer = async () => {
		try {
			const response = await api.post(`/pdf/projects/${id}/generate-offer`, {
				name: `${t("project.offerFor")} ${project?.name}`
			});
			
			// Add to generating offers set
			setGeneratingOffers(prev => new Set(prev).add(response.data.offer.id));

			// Refresh offers list
			await fetchOffers();
			
		} catch (error) {
			console.error('Offer generation failed:', error);
			alert('Failed to start offer generation');
		}
	};

	const handleDownloadOffer = async (offerId: number) => {
		try {
			const response = await api.get(`/pdf/projects/${id}/offers/${offerId}/download`, {
				responseType: 'blob'
			});
			
			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `offer-${id}-${offerId}.pdf`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			
		} catch (error) {
			console.error('Download failed:', error);
			alert('File not ready or download failed');
		}
	};

	// Poll for offer status updates
	useEffect(() => {
		if (generatingOffers.size > 0) {
			const interval = setInterval(async () => {
				await fetchOffers();
				
				// Check which offers are still generating
				const stillGenerating = new Set<number>();
				offers.forEach(offer => {
					if (!offer.file && generatingOffers.has(offer.id)) {
						stillGenerating.add(offer.id);
					}
				});
				
				setGeneratingOffers(stillGenerating);
				
			}, 3000); // Poll every 3 seconds
			
			return () => clearInterval(interval);
		}
	}, [generatingOffers, offers]);

	useEffect(() => {
		fetchProject();
		fetchOffers();
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
			<p><strong>{t("projects.location")}:</strong> {project.location}</p>
			<p><strong>{t("projects.description")}:</strong> {project.description}</p>

			<hr />

			{/* Employees Section */}
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>{t("projects.employees")}</h4>
				<button
					className="btn btn-success btn-sm"
					onClick={() => setShowEmployeeModal(true)}
				>
					<i className="me-1"><FaUserPlus /></i> {t("projects.assignEmployees")}
				</button>
			</div>

			{project.employees.length === 0 ? (
				<p>{t("projects.noEmployeesAssigned")}</p>
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

			{/* Invoices Section */}
			<h4>{t("projects.invoices")}</h4>
			{project.invoices.length === 0 ? (
				<p>{t("projects.noInvoices")}</p>
			) : (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>{t("projects.amount")}</th>
							<th>{t("projects.createdAt")}</th>
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

			{/* Expenses Section */}
			<h4>{t("projects.expenses")}</h4>
			{project.ProjectExpenses.length === 0 ? (
				<p>{t("projects.noExpenses")}</p>
			) : (
				<>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>{t("expenses.name")}</th>
								<th>{t("expenses.category")}</th>
								<th>{t("expenses.quantity")}</th>
								<th>{t("expenses.price")}</th>
							</tr>
						</thead>
						<tbody>
							{project.ProjectExpenses.slice(0, 3).map((pe: any) => (
								<tr key={pe.id}>
									<td>{pe.expenses.name}</td>
									<td>{pe.expenses.expenseCategories.name}</td>
									<td>{pe.Quantity}</td>
									<td>{pe.price}</td>
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
				{t("projects.viewAll")}
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

			{/* Offers Section - UPDATED with Bootstrap Loading */}
			<div className="d-flex justify-content-between align-items-center mb-4">
				<h4>{t("projects.offers")}</h4>
				<button 
					className="btn btn-primary"
					onClick={handleGenerateOffer}
					disabled={generatingOffers.size > 0}
				>
					{generatingOffers.size > 0 ? (
						<>
							<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
							{t("projects.generating")}
						</>
					) : (
						t("projects.generateOffer")
					)}
				</button>
			</div>

			{offers.length === 0 ? (
				<p>{t("projects.noOffers")}</p>
			) : (
				<ul className="list-group list-group-flush mb-4">
					{offers.map((offer) => (
						<li key={offer.id} className="list-group-item d-flex justify-content-between align-items-center">
							<div className="flex-grow-1">
								<strong>{offer.name}</strong> - 
								<span className="text-muted ms-2">
									{t("projects.created")}: {new Date(offer.createdAt).toLocaleDateString()}
								</span>
								{offer.offer > 0 && (
									<span className="text-success ms-2">
										{t("projects.amount")}: €{offer.offer.toFixed(2)}
									</span>
								)}
							</div>
							
							<div className="d-flex align-items-center">
								{!offer.file ? (
									<div className="text-warning d-flex align-items-center">
										<div className="spinner-border spinner-border-sm me-2" role="status">
											<span className="visually-hidden">{t("projects.generating")}...</span>
										</div>
										<small>{t("projects.generatingFile")}...</small>
									</div>
								) : (
									<button 
										className="btn btn-success btn-sm"
										onClick={() => handleDownloadOffer(offer.id)}
									>
										<FaDownload className="me-1" />
										{t("common.download")}
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}