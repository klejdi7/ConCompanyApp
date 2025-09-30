"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Home() {
	const { user } = useAuth();
	const [mounted, setMounted] = useState(false);
	const { t } = useTranslation();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Avoid hydration errors
		return <div className="container mt-5">Loading...</div>;
	}

	return (
		<div className="container mt-5">
			<h1 className="mb-4">{t("nav.dashboard")}</h1>

			{user ? (
				<div className="alert alert-success">
					{" "}
					{t("welcome.back")}, <strong>{user.name}</strong>!{" "}
				</div>
			) : (
				<div className="alert alert-warning">
					{t("welcome.notLoggedIn")}.{" "}
					<Link href="/login">{t("welcome.loginHere")}</Link>
				</div>
			)}

			<div className="row mt-4">
				<div className="col-md-4 d-flex">
					<div className="card shadow-sm h-130 w-100 d-flex flex-column">
						<div className="card-body d-flex flex-column">
							<h5 className="card-title">👷 {t("employees.title")}</h5>
							<p className="card-text">{t("employees.description")}</p>
							<div className="mt-auto">
								<Link href="/employees" className="btn btn-primary">
									{t("employees.goTo")}
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-md-4 d-flex">
					<div className="card shadow-sm h-130 w-100 d-flex flex-column">
						<div className="card-body d-flex flex-column">
							<h5 className="card-title">🏗️ {t("projects.title")}</h5>
							<p className="card-text">{t("projects.description")}</p>
							<div className="mt-auto">
								<Link href="/projects" className="btn btn-primary">
									{t("projects.goTo")}
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="col-md-4 d-flex">
					<div className="card shadow-sm h-130 w-100 d-flex flex-column">
						<div className="card-body d-flex flex-column">
							<h5 className="card-title">💰 {t("invoices.title")}</h5>
							<p className="card-text">{t("invoices.description")}</p>
							<div className="mt-auto">
								<Link href="/invoices" className="btn btn-primary">
									{t("invoices.goTo")}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
