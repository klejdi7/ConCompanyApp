// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import UserSettings from "@/components/settings/UserSettings";
import Preferences from "@/components/settings/Preferences";
import CompanyDetails from "@/components/settings/CompanyDetails";
import { FaUser, FaCog, FaBuilding } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Loading from "@/components/Loading"


type SettingsSection = "user" | "preferences" | "company";

export default function SettingsPage() {
	const { token } = useAuth();
	const { t } = useTranslation();
	const { user, loading } = useAuthGuard();
	const [activeSection, setActiveSection] = useState<SettingsSection>("user");
	const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

	// Listen for theme changes in localStorage (e.g., from Preferences)
	useEffect(() => {
		const handleStorage = () => {
			const newTheme = localStorage.getItem("theme") || "light";
			setTheme(newTheme);
			document.documentElement.setAttribute("data-bs-theme", newTheme);
		};
		window.addEventListener("storage", handleStorage);
		// Also update theme on mount
		handleStorage();
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	const sections = [
		{ id: "user" as SettingsSection, name: t("settings.user"), icon: <FaUser /> },
		{ id: "preferences" as SettingsSection, name: t("settings.preferences"), icon: <FaCog /> },
		{ id: "company" as SettingsSection, name: t("settings.company"), icon: <FaBuilding /> }
	];

	const renderActiveSection = () => {
		switch (activeSection) {
			case "user":
				return <UserSettings user={user} />;
			case "preferences":
				return <Preferences />;
			case "company":
				return <CompanyDetails />;
			default:
				return <UserSettings user={user} />;
		}
	};

	if (loading) return <Loading text={t("common.loading")} />;
	if (!user) return <Loading text={t("common.redirecting")} />;
	
	return (
		<div className="container-fluid mt-2 p-5">
			<div className="row">
				<div className="col-12">
					<h1 className="mb-4">{t("settings.title")}</h1>
				</div>
			</div>
			
			<div className="row">
				{/* Sidebar */}
				<div className="col-md-3 col-lg-2">
					<div className="card">
						<div className="card-body p-0">
							<nav className="nav flex-column">
								{sections.map((section) => (
									<button
										key={section.id}
										className={
											theme === "dark"
												? `nav-link text-start py-3 border-bottom fw-semibold ${
													activeSection === section.id
														? "active bg-white text-dark fw-bold"
														: "bg-dark text-light"
												}`
												: `nav-link text-start py-3 border-bottom fw-semibold ${
													activeSection === section.id
														? "active bg-dark text-white fw-bold"
														: "text-dark"
												}`
										}
										onClick={() => setActiveSection(section.id)}
										style={{
											border: "none",
											borderRadius: 0,
											cursor: "pointer",
											fontSize: "1.1rem",
											...(theme === "dark"
												? {
													backgroundColor: activeSection === section.id ? "#212529" : "#181818",
													color: activeSection === section.id ? "#fff" : "#f8f9fa"
												}
												: {
													backgroundColor: activeSection === section.id ? "#f8f9fa" : "#fff",
													color: activeSection === section.id ? "#0d6efd" : "#212529"
												})
										}}
									>
										<span className="me-2">{section.icon}</span>
										{section.name}
									</button>
								))}
							</nav>
						</div>
					</div>
				</div>

				{/* Content Area */}
				<div className="col-md-9 col-lg-10">
					<div className="card">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h4 className="mb-0">
									{sections.find(s => s.id === activeSection)?.name}
								</h4>
							</div>
							{renderActiveSection()}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}