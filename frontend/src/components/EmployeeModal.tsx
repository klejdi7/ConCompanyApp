"use client";

import { useState, useEffect } from "react";

export interface Employee {
	id: number;
	firstName: string;
	lastName: string;
	rate: number;
	workDays: number;
}

interface EmployeeModalProps {
	employee?: Employee | null;
	mode?: "add" | "edit" | "delete";
	onSubmit: (employee?: Employee) => void; // delete doesn’t need data
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
	const [showModal, setShowModal] = useState(false);
	const [modalEmployee, setModalEmployee] = useState<Employee>(
		employee || { id: 0, firstName: "", lastName: "", rate: 0, workDays: 0 }
	);
	const [fadeIn, setFadeIn] = useState(false);

	// Reset state when opening
	const openModal = () => {
		if (mode === "edit" && employee) {
			setModalEmployee(employee);
		} else {
			setModalEmployee({ id: 0, firstName: "", lastName: "", rate: 0, workDays: 0 });
		}
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

	const handleSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (mode === "delete") {
			onSubmit(employee!); // for delete we just pass the employee
		} else {
			onSubmit(modalEmployee);
		}
		closeModal();
	};

	return (
		<>
			{/* Open button */}
			<button className={className} onClick={openModal}>
				{buttonText || (mode === "edit" ? "Edit Employee": mode === "delete" ? "Delete Employee" : "Add Employee")}
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
					>
						<div className="modal-dialog">
							<div className="modal-content">
								{mode === "delete" ? (
									<>
										<div className="modal-header">
											<h5 className="modal-title">Confirm Delete</h5>
											<button type="button" className="btn-close" onClick={closeModal} />
										</div>
										<div className="modal-body">
											<p>Are you sure you want to delete this employee?</p>
											<p>
												<strong>{employee?.firstName} {employee?.lastName}</strong>
											</p>
										</div>
										<div className="modal-footer">
											<button type="button" className="btn btn-secondary" onClick={closeModal}>
												No
											</button>
											<button type="button" className="btn btn-danger" onClick={() => handleSubmit()}>
												Yes
											</button>
										</div>
									</>
								) : (
									<form onSubmit={handleSubmit}>
										<div className="modal-header">
											<h5 className="modal-title">
												{mode === "edit" ? "Edit Employee" : "Add Employee"}
											</h5>
											<button type="button" className="btn-close" onClick={closeModal} />
										</div>
										<div className="modal-body">
											<input
												className="form-control mb-2"
												placeholder="First Name"
												value={modalEmployee.firstName}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, firstName: e.target.value })
												}
												required
											/>
											<input
												className="form-control mb-2"
												placeholder="Last Name"
												value={modalEmployee.lastName}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, lastName: e.target.value })
												}
												required
											/>
											<input
												className="form-control mb-2"
												type="number"
												placeholder="Rate"
												value={modalEmployee.rate}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, rate: parseFloat(e.target.value) })
												}
												required
											/>
											<input
												className="form-control"
												type="number"
												placeholder="Work Days"
												value={modalEmployee.workDays}
												onChange={(e) =>
													setModalEmployee({ ...modalEmployee, workDays: parseInt(e.target.value) })
												}
												required
											/>
										</div>
										<div className="modal-footer">
											<button type="button" className="btn btn-secondary" onClick={closeModal}>
												Close
											</button>
											<button type="submit" className="btn btn-primary">
												{mode === "edit" ? "Save Changes" : "Add Employee"}
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
