"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useTranslation } from "react-i18next";

export interface Employee {
	id: number;
	firstName: string;
	lastName: string;
	rate: number;
	workDays: number;
}

interface EmployeeSelectModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: number;
	onAssign: (employeeIds: number[]) => void;
	existingEmployees: number[];
}

export default function EmployeeSelectModal({
isOpen,
onClose,
projectId,
onAssign,
existingEmployees
}: EmployeeSelectModalProps) {
	const { t } = useTranslation();
	const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
	const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
	const [loading, setLoading] = useState(true);
	const [fadeIn, setFadeIn] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		if (isOpen) {
		fetchAllEmployees();
		setTimeout(() => setFadeIn(true), 200);
		} else {
		setFadeIn(false);
		}
	}, [isOpen]);

	const fetchAllEmployees = async () => {
		try {
		const response = await api.get('/api/employees');
		setAllEmployees(response.data);
		setSelectedEmployees(existingEmployees);
		} catch (err) {
		console.error("Failed to fetch employees:", err);
		} finally {
		setLoading(false);
		}
	};

	const handleCheckboxChange = (employeeId: number) => {
		setSelectedEmployees(prev => 
		prev.includes(employeeId)
			? prev.filter(id => id !== employeeId)
			: [...prev, employeeId]
		);
	};

	const handleSelectAll = () => {
		if (selectedEmployees.length === allEmployees.length) {
		setSelectedEmployees([]);
		} else {
		setSelectedEmployees(allEmployees.map(emp => emp.id));
		}
	};

	const handleSubmit = () => {
		onAssign(selectedEmployees);
		onClose();
	};

	const filteredEmployees = allEmployees.filter(employee =>
		`${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (!isOpen) return null;

	return (
		<>
			<div className={`modal-backdrop fade ${fadeIn ? "show" : ""}`} style={{ transition: "opacity 0.3s" }} onClick={onClose} /> 
				<div className={`modal fade ${fadeIn ? "show d-block" : "d-none"}`} tabIndex={-1} style={{ transition: "opacity 0.3s" }}>
					<div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">{t("employees.assignEmployees")}</h5>
								<button type="button" className="btn-close" onClick={onClose} />
							</div>
					
							<div className="modal-body">
							{loading ? (
								<div className="text-center">
								<div className="spinner-border" role="status">
									<span className="visually-hidden">Loading...</span>
								</div>
								</div>
							) : (
								<>
								<div className="mb-3">
									<button
									type="button"
									className="btn btn-outline-primary btn-sm"
									onClick={handleSelectAll}
									>
									{selectedEmployees.length === allEmployees.length ? t("employees.deselectAll") : t("employees.selectAll")}
									</button>
								</div>

								<div className="mb-3">
									<input
									type="text"
									className="form-control"
									placeholder={t("employees.searchPlaceholder")}
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									/>
								</div>

								<div className="table-responsive">
									<table className="table table-hover">
									<thead>
										<tr>
										<th>{t("employees.select")}</th>
										<th>{t("employees.name")}</th>
										<th>{t("employees.rate")}</th>
										<th>{t("employees.workDays")}</th>
										</tr>
									</thead>
									<tbody>
										{filteredEmployees.map(employee => (
										<tr key={employee.id}>
											<td>
											<div className="form-check">
												<input
												className="form-check-input"
												type="checkbox"
												checked={selectedEmployees.includes(employee.id)}
												onChange={() => handleCheckboxChange(employee.id)}
												/>
											</div>
											</td>
											<td>
											{employee.firstName} {employee.lastName}
											{existingEmployees.includes(employee.id) && (
												<span className="badge bg-info ms-2">{t("employees.alreadyAssigned")}</span>
											)}
											</td>
											<td>${employee.rate}</td>
											<td>{employee.workDays}</td>
										</tr>
										))}
									</tbody>
									</table>
								</div>

								<div className="mt-3 text-muted">
									{t("employees.rateWorkDaysInfo")} <strong>{t("employees.viewAllEmployees")}</strong>
								</div>
								</>
							)}
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={onClose}>
									{t("common.cancel")}
								</button>
							<button type="button" className="btn btn-primary" onClick={handleSubmit} > {t("common.applySelection")} </button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}