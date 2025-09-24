"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "@/services/api";

export interface Role {
	id: number;
	name: string;
}

export interface Employee {
	id: number;
	firstName: string;
	lastName: string;
	role?: Role;
	roleId?: number;
	roleName?: string;
}

interface EmployeeModalProps {
	employee?: Employee | null;
	mode?: "add" | "edit" | "delete";
	onSubmit: (employee?: Employee) => void; // delete doesn't need data
	buttonText?: React.ReactNode;
	className?: string;
}

export default function EmployeeModal({
	employee,
	mode = "add",
	onSubmit,
	buttonText,
	className = "btn btn-primary mb-3",
}: EmployeeModalProps) {
	const { t } = useTranslation();

	const [showModal, setShowModal] = useState(false);
	const [modalEmployee, setModalEmployee] = useState<Employee>(
		employee || { id: 0, firstName: "", lastName: "", roleId: 0, roleName: "" }
	);
	const [fadeIn, setFadeIn] = useState(false);
	const [roles, setRoles] = useState<Role[]>([]);
	const [showNewRoleInput, setShowNewRoleInput] = useState(false);
	const [loadingRoles, setLoadingRoles] = useState(false);

	// Fetch roles when modal opens
	useEffect(() => {
		if (showModal) {
			fetchAllRoles();
		}
	}, [showModal]);

	const fetchAllRoles = async () => {
		setLoadingRoles(true);
		try {
			const response = await api.get('/api/roles');
			setRoles(response.data);
		} catch (err) {
			console.error("Failed to fetch roles:", err);
			alert("Failed to load roles. Please try again later.");
		} finally {
			setLoadingRoles(false);
		}
	};

	// Reset state when opening
	const openModal = () => {
		if (mode === "edit" && employee) {
			setModalEmployee({
				...employee,
				roleId: employee.role?.id || 0,
				roleName: ""
			});
		} else {
			setModalEmployee({ id: 0, firstName: "", lastName: "", roleId: 0, roleName: "" });
		}
		setShowNewRoleInput(false);
		setShowModal(true);
	};

	const closeModal = () => {
		setFadeIn(false);
		setTimeout(() => setShowModal(false), 300);
	};

	// fade-in animation
	useEffect(() => {
		if (showModal) {
			setTimeout(() => setFadeIn(true), 200);
		}
	}, [showModal]);

	const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (value === "new") {
			setShowNewRoleInput(true);
			setModalEmployee({ ...modalEmployee, roleId: 0, roleName: "" });
		} else {
			setShowNewRoleInput(false);
			setModalEmployee({ ...modalEmployee, roleId: parseInt(value), roleName: "" });
		}
	}, [modalEmployee]);

	const handleSubmit = useCallback((e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (mode === "delete") {
			onSubmit(employee!);
		} else {
			if (showNewRoleInput && !modalEmployee.roleName?.trim()) {
				alert("Role name cannot be empty.");
				return;
			}
			onSubmit(modalEmployee);
		}
		closeModal();
	}, [employee, mode, modalEmployee, onSubmit, showNewRoleInput]);

	// Replace hardcoded text with translations
	const modalTitle = mode === "add" ? t("employees.create") : t("common.edit");
	const submitButtonText = mode === "add" ? t("common.add") : t("common.save");

	return (
		<>
			{/* Open button */}
			<button className={className} onClick={openModal}>
				{buttonText ||
					(mode === "edit"
						? `${t("common.edit")} ${t("employees.title")}`
						: mode === "delete"
						? `${t("common.delete")} ${t("employees.title")}`
						: `${t("common.add")} ${t("employees.title")}`)}
			</button>

			{/* Modal */}
			{showModal && (
				<>
					{/* Backdrop */}
					<div
						className={`modal-backdrop fade ${fadeIn ? "show" : ""}`}
						style={{ transition: "opacity 0.3s" }}
					/>

					<div
						className={`modal fade ${fadeIn ? "show d-block" : "d-none"}`}
						tabIndex={-1}
						style={{ transition: "opacity 0.3s" }}
						role="dialog"
						aria-labelledby="modal-title"
						aria-hidden={!showModal}
					>
						<div className="modal-dialog">
							<div className="modal-content">
								{mode === "delete" ? (
									<>
										<div className="modal-header">
											<h5 className="modal-title" id="modal-title">Confirm Delete</h5>
											<button type="button" className="btn-close" onClick={closeModal} />
										</div>
										<div className="modal-body">
											<p>{t("employees.deleteEmployee")}</p>
											<p>
												<strong>{employee?.firstName} {employee?.lastName}</strong>
											</p>
										</div>
										<div className="modal-footer">
											<button type="button" className="btn btn-secondary" onClick={closeModal}>
												{t("common.no")}
											</button>
											<button type="button" className="btn btn-danger" onClick={() => handleSubmit()}>
												{t("common.yes")}
											</button>
										</div>
									</>
								) : (
									<form onSubmit={handleSubmit}>
										<div className="modal-header">
											<h5 className="modal-title" id="modal-title">
												{modalTitle}
											</h5>
											<button type="button" className="btn-close" onClick={closeModal} />
										</div>
										<div className="modal-body">
											<input
												className="form-control mb-2"
												placeholder={t("employees.firstName")}
												value={modalEmployee.firstName}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, firstName: e.target.value })
												}
												required
											/>
											<input
												className="form-control mb-2"
												placeholder={t("employees.lastName")}
												value={modalEmployee.lastName}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, lastName: e.target.value })
												}
												required
											/>
											
											{loadingRoles ? (
												<div className="mb-2">
													<div className="spinner-border spinner-border-sm" role="status">
														<span className="visually-hidden">Loading roles...</span>
													</div>
													<span className="ms-2">Loading roles...</span>
												</div>
											) : (
												<>
													<select
														className="form-control mb-2"
														value={showNewRoleInput ? "new" : modalEmployee.roleId}
														onChange={handleRoleChange}
														required
													>
														<option value="0">{t("employees.selectRole")}</option>
														{roles.map(role => (
															<option key={role.id} value={role.id}>
																{role.name}
															</option>
														))}
														<option value="new">{t("employees.newRole")}</option>
													</select>
													
													{showNewRoleInput && (
														<input
															className="form-control mb-2"
															placeholder={t("employees.newRolePlaceholder")}
															value={modalEmployee.roleName}
															onChange={(e) =>
																setModalEmployee({ ...modalEmployee, roleName: e.target.value })
															}
															required={showNewRoleInput}
														/>
													)}
												</>
											)}
										</div>
										<div className="modal-footer">
											<button type="button" className="btn btn-secondary" onClick={closeModal}>
												Close
											</button>
											<button 
												type="submit" 
												className="btn btn-primary"
												disabled={loadingRoles}
											>
												{submitButtonText}
											</button>
										</div>
									</form>
								)}
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}