"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface Project {
	id: number;
	name: string;
	location: string;
	description: string;
}

interface ProjectModalProps {
	project?: Project | null;
	mode: "add" | "edit" | "delete";
	onSubmit: (project: Project, mode: "add" | "edit" | "delete") => void;
	buttonText: React.ReactNode;
	className?: string;
}

export default function ProjectModal({
project,
mode,
onSubmit,
buttonText,
className = "btn btn-primary mb-3",
}: ProjectModalProps) {
	const { t } = useTranslation();
	const [showModal, setShowModal] = useState(false);
	const [modalProject, setModalProject] = useState<Project>(
		project || { id: 0, name: "", location: "", description: "" }
	);
	const [fadeIn, setFadeIn] = useState(false);

	const openModal = () => {
		setModalProject(project || { id: 0, name: "", location: "", description: ""});
		setShowModal(true);
	};

	const closeModal = () => {
		setFadeIn(false);
		setTimeout(() => setShowModal(false), 300);
	};

	useEffect(() => {
		if (showModal) {
		setTimeout(() => setFadeIn(true), 20);
		}
	}, [showModal]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === "delete") {
			onSubmit(modalProject, "delete");
		} else {
			onSubmit(modalProject, mode);
		}
		closeModal();
	};

	// Replace hardcoded text with translations
	const modalTitle = mode === "add" ? t("projects.create") : t("common.edit");
	const submitButtonText = mode === "add" ? t("common.add") : t("common.save");

	return (
		<>
			<button className={className} onClick={openModal}>
				{buttonText}
			</button>

			{showModal && (
				<>
					<div className={`modal-backdrop fade ${fadeIn ? "show" : ""}`} style={{ transition: "opacity 0.3s" }} />
					<div className={`modal fade ${fadeIn ? "show d-block" : "d-none"}`} tabIndex={-1} style={{ transition: "opacity 0.3s" }}>
						<div className="modal-dialog">
							<div className="modal-content">
								{mode === "delete" ? (
								<>
									<div className="modal-header">
										<h5 className="modal-title">{t("projects.deleteProject")}</h5>
										<button type="button" className="btn-close" onClick={closeModal} />
									</div>
									<div className="modal-body">
										{t("common.deleteQ")} <b>{project?.name}</b>?
									</div>
									<div className="modal-footer">
										<button type="button" className="btn btn-secondary" onClick={closeModal}>
											No
										</button>
										<button type="button" className="btn btn-danger" onClick={handleSubmit}>
											Yes, Delete
										</button>
									</div>
								</>
								) : (
									<form onSubmit={handleSubmit}>
										<div className="modal-header">
											<h5 className="modal-title">{modalTitle}</h5>
											<button type="button" className="btn-close" onClick={closeModal} />
										</div>
										<div className="modal-body">
											<input
												className="form-control mb-2"
												placeholder={t("project.NamePlaceholder")}
												value={modalProject.name}
												onChange={(e) => setModalProject({ ...modalProject, name: e.target.value })}
												required
											/>
											<input
												className="form-control mb-2"
												placeholder={t("project.LocationPlaceholder")}
												value={modalProject.location}
												onChange={(e) => setModalProject({ ...modalProject, location: e.target.value })}
												required
											/>
											<textarea
												className="form-control mb-2"
												placeholder={t("project.DescriptionPlaceholder")}
												value={modalProject.description}
												onChange={(e) => setModalProject({ ...modalProject, description: e.target.value })}
												required
											/>
										</div>
										<div className="modal-footer">
											<button type="button" className="btn btn-secondary" onClick={closeModal}>
												Close
											</button>
											<button type="submit" className="btn btn-primary">
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
