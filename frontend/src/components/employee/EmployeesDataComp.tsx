"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import EmployeeModal from "./EmployeeModal";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export interface Role {
	id: number;
	name: string;
}

export interface Employee {
	id: number;
	firstName: string;
	lastName: string;
	email?: string;
	role?: Role;
	rate?: number;
	workDays?: number;
	projectEmployeeId?: number;
}

interface EmployeeDataCompProps {
	mode: "table" | "modal";
	employees: Employee[];
	projectId?: number;
	show?: boolean;
	onClose?: () => void;
	limit?: number;
	displayActions?: boolean;
	buttonText?: React.ReactNode;
	className?: string;
	allowSearch?: boolean;
	callback?: () => void;
	projectMode?: boolean;
}

export default function EmployeeDataComp({
	mode,
	employees,
	projectId,
	show = false,
	onClose,
	limit,
	displayActions = true,
	className = "btn btn-primary mb-3 btn-sm",
	allowSearch = false,
	callback,
	projectMode = false,
}: EmployeeDataCompProps) {
	const { t } = useTranslation();
	const [fadeIn, setFadeIn] = useState(false);
	const [showModal, setShowModal] = useState(show);
	const [searchTerm, setSearchTerm] = useState("");
	const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
	const [rate, setRate] = useState<{ [key: number]: number }>({});
	const [workDays, setWorkDays] = useState<{ [key: number]: number }>({});

	const limitedEmployees = limit ? employees.slice(0, limit) : employees;

	const filteredEmployees = limitedEmployees.filter((emp) =>
		`${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
	);

	useEffect(() => {
		if (showModal) {
			setTimeout(() => setFadeIn(true), 100);
		} else {
			setFadeIn(false);
		}
	}, [showModal]);

	const handleAction = async (employee: Employee | undefined, mode: "edit" | "delete") => {
		try {
			if (mode === "edit" && employee) {
				await api.put(`/api/employees/${employee.id}`, employee);
			}
			if (mode === "delete" && employee) {
				await api.delete(`/api/employees/${employee.id}`);
			}
		} catch (err) {
			console.log("Action failed", err);
		}
		callback?.();
	};

	const handleSave = async (projectEmployeeId: number, employeeId: number) => {
		try {
			await api.put(`/api/project-employees/${projectEmployeeId}`, {
				rate: rate[employeeId],
				workDays: workDays[employeeId],
			});
			setEditMode((prev) => ({ ...prev, [employeeId]: false }));
			callback?.();
		} catch (err) {
			console.error("Failed to update project employee:", err);
		}
	};

	const renderTable = () => (
		<table className="table mt-3">
			<thead>
				<tr>
					<th scope="col">{t("table.name")}</th>
					<th scope="col">{t("table.lastName")}</th>
					{projectMode && <th scope="col">{t("table.rate")}</th>}
					{projectMode && <th scope="col">{t("table.workDays")}</th>}
					<th scope="col">{t("table.actions")}</th>
				</tr>
			</thead>
			<tbody>
				{filteredEmployees.map((emp: Employee) => (
					<tr key={emp.id}>
						<td>{emp.firstName}</td>
						<td>{emp.lastName}</td>
						{projectMode && (
							<>
								<td>
									{editMode[emp.id] ? (
										<input
											type="number"
											value={rate[emp.id] || emp.rate || 0}
											className="form-control form-control-sm"
											onChange={(e) =>
												setRate((prev) => ({
													...prev,
													[emp.id]: Number(e.target.value),
												}))
											}
										/>
									) : (
										emp.rate || 0
									)}
								</td>
								<td>
									{editMode[emp.id] ? (
										<input
											type="number"
											value={workDays[emp.id] || emp.workDays || 0}
											className="form-control form-control-sm"
											onChange={(e) =>
												setWorkDays((prev) => ({
													...prev,
													[emp.id]: Number(e.target.value),
												}))
											}
										/>
									) : (
										emp.workDays || 0
									)}
								</td>
							</>
						)}
						{projectMode && (
							<td>
								{editMode[emp.id] ? (
									<button
										className="btn btn-success btn-sm"
										onClick={() => handleSave(emp.projectEmployeeId || 0, emp.id)}
									>
										{t("common.save")}
									</button>
								) : (
									<button
										className="btn btn-primary btn-sm"
										onClick={() =>
											setEditMode((prev) => ({ ...prev, [emp.id]: true }))
										}
									>
										{t("common.edit")}
									</button>
								)}
							</td>
						)}
						{!projectMode && (
							<td>
								<Link href={`/employees/${emp.id}`}>
									<button className="btn btn-primary btn-sm me-2">
										<FaEye /> {t("button.viewEmployee")}
									</button>
								</Link>
								<EmployeeModal
									mode="edit"
									employee={emp}
									onSubmit={(emp) => handleAction(emp, "edit")}
									buttonText={<><FaEdit /> {t("common.edit")} </>}
									className="btn btn-success btn-sm me-2"
								/>
								<EmployeeModal
									mode="delete"
									employee={emp}
									onSubmit={(emp) => handleAction(emp, "delete")}
									buttonText={<><FaTrash /> {t("common.delete")} </>}
									className="btn btn-danger btn-sm"
								/>
							</td>
						)}
					</tr>
				))}
			</tbody>
		</table>
	);

	if (mode === "table") {
		return <div>{renderTable()}</div>;
	}

	if (mode === "modal") {
		return (
			<>
				<button className={className} onClick={() => setShowModal(true)}>
					<FaEye style={{ marginRight: 6 }} />
					{t("button.viewAllEmployees")}
				</button>

				{showModal && (
					<>
						<div
							className={`modal-backdrop fade ${fadeIn ? "show" : ""}`}
							style={{ transition: "opacity 0.3s" }}
						/>

						<div
							className={`modal fade ${fadeIn ? "show d-block" : "d-none"}`}
							tabIndex={-1}
							style={{ transition: "opacity 0.3s" }}
							role="dialog"
						>
							<div className="modal-dialog modal-lg">
								<div className="modal-content">
									<div className="modal-header">
										<h5 className="modal-title">Employees</h5>
										<button
											type="button"
											className="btn-close"
											onClick={() => {
												setShowModal(false);
												onClose?.();
											}}
										/>
									</div>
									<div className="modal-body">
										{renderTable()}
									</div>
									<div className="modal-footer">
										<button
											type="button"
											className="btn btn-secondary"
											onClick={() => {
												setShowModal(false);
												onClose?.();
											}}
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</>
		);
	}

	return null;
}
