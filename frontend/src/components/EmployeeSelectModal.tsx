"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";

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
								<h5 className="modal-title">Assign Employees to Project</h5>
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
									{selectedEmployees.length === allEmployees.length ? "Deselect All" : "Select All"}
									</button>
								</div>

								<div className="mb-3">
									<input
									type="text"
									className="form-control"
									placeholder="Search employees..."
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									/>
								</div>

								<div className="table-responsive">
									<table className="table table-hover">
									<thead>
										<tr>
										<th>Select</th>
										<th>Name</th>
										<th>Rate</th>
										<th>Work Days</th>
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
												<span className="badge bg-info ms-2">Already assigned</span>
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
									Employees Rate and Work days can be adjusted at <strong > View All Employees </strong>
								</div>
								</>
							)}
							</div>

							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={onClose}>
									Cancel
								</button>
							<button type="button" className="btn btn-primary" onClick={handleSubmit} > Apply Selection </button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}