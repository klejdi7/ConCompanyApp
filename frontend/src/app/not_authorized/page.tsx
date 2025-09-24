"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotAuthorizedPage() {
	const { t } = useTranslation();

	return (
		<div className="container mt-5 text-center">
			<h1 className="text-danger mb-3">{t("common.error")}</h1>
			<p className="mb-3">
				{t("common.notAuthorizedMessage")}
			</p>
			<Link href="/login" className="btn btn-primary">
				{t("common.goToLogin")}
			</Link>
		</div>
	);
}
