"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/services/api";
import ProjectModal, { Project } from "@/components/project/ProjectModal";
import Loading from "@/components/Loading";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ProjectsPage() {
	const { t } = useTranslation();
	const { token } = useAuth();
	const { user, loading: authLoading } = useAuthGuard();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchProjects = async () => {
		if (!token) return;
		try {
			setLoading(true);
			const res = await api.get("/api/projects");
			setProjects(res.data);
		} catch (err) {
			console.error("Failed to fetch projects");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, [token]);

	const handleAction = async (project: Project, mode: "add" | "edit" | "delete") => {
		try {
			if (mode === "add") await api.post("/api/projects", project);
			if (mode === "edit") await api.put(`/api/projects/${project.id}`, project);
			if (mode === "delete") await api.delete(`/api/projects/${project.id}`);

			fetchProjects();
		} catch (err) {
			alert("Failed to process project action");
		}
	};

	if (authLoading) return <Loading text="Checking auth..." />;
	if (!user) return <Loading text="Redirecting" />;

	return (
		<div className="container mt-4">
			<h2>{t("projects.title")}</h2>

			{/* Add button */}
			<ProjectModal
				mode="add"
				onSubmit={(proj) => handleAction(proj, "add")}
				buttonText={t("projects.addProject")}
			/>

			{loading ? (
				<Loading text={t("projects.loading")} />
			) : (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>{t("projects.table.name")}</th>
							<th>{t("projects.table.location")}</th>
							<th>{t("projects.table.description")}</th>
							<th>{t("projects.table.actions")}</th>
						</tr>
					</thead>
					<tbody>
						{projects.map((proj) => (
							<tr key={proj.id}>
								<td>{proj.name}</td>
								<td>{proj.location}</td>
								<td>{proj.description}</td>

								<td>
									<Link href={`/projects/${proj.id}`}>
										<button className="btn btn-primary btn-sm me-2">
											<FaEye /> {t("button.viewProject")}
										</button>
									</Link>
									<ProjectModal
										mode="edit"
										project={proj}
										onSubmit={(proj) => handleAction(proj, "edit")}
										buttonText={<><FaEdit /> {t("common.edit")}</>}
										className="btn btn-success btn-sm me-2"
									/>
									<ProjectModal
										mode="delete"
										project={proj}
										onSubmit={(proj) => handleAction(proj, "delete")}
										buttonText={<><FaTrash /> {t("common.delete")}</>}
										className="btn btn-danger btn-sm"
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
