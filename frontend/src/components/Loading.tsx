"use client";

import { useTranslation } from "react-i18next";

export default function Loading({ text = "Loading..." }: { text?: string }) {
	const { t } = useTranslation();

	return (
		<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "200px" }} >
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">{t("common.loading")}</span>
			</div>
			<small className="mt-2 text-muted">{t("common.loading")}</small>
		</div>
	);
}