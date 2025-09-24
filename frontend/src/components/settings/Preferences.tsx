"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

export default function Preferences() {
	const { t, i18n } = useTranslation();
	const [preferences, setPreferences] = useState({
		language: "en",
		timezone: "Europe/Athens",
		dateFormat: "DD/MM/YYYY",
		itemsPerPage: 10,
		emailNotifications: true,
		desktopNotifications: false
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		// Load user preferences
		loadPreferences();
	}, []);

	const loadPreferences = async () => {
		try {
			const response = await api.get("/api/user/preferences");
			if (response.data) {
				setPreferences(response.data);
			}
		} catch (error) {
			console.error("Failed to load preferences");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			await api.put("/api/user/preferences", preferences);
			setMessage({ type: "success", text: "Preferences saved successfully" });
		} catch (error: any) {
			setMessage({ 
				type: "error", 
				text: error.response?.data?.error || "Failed to save preferences" 
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		setPreferences(prev => ({
			...prev,
			[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
		}));

		if (name === 'language') {
			i18n.changeLanguage(value);
		}
	};

	return (
		<div>
			<h5>{t("settings.preferences")}</h5>
			<form onSubmit={handleSubmit}>
				{/* Language & Regional Settings */}
				<div className="mb-4">
					<h5>{t("settings.languageRegional")}</h5>
					<div className="row">
						<div className="col-md-4">
							<div className="mb-3">
								<label className="form-label">{t("settings.language")}</label>
								<select
									className="form-select"
									name="language"
									value={preferences.language}
									onChange={handleChange}
								>
									<option value="en">English</option>
									<option value="el">Greek</option>
									<option value="sq">Albanian</option>
								</select>
							</div>
						</div>
						<div className="col-md-4">
							<div className="mb-3">
								<label className="form-label">{t("settings.timezone")}</label>
								<select
									className="form-select"
									name="timezone"
									value={preferences.timezone}
									onChange={handleChange}
								>
									<option value="Europe/Athens">Athens (GMT+2)</option>
									<option value="Europe/Berlin">Berlin (GMT+1)</option>
									<option value="UTC">UTC</option>
								</select>
							</div>
						</div>
						<div className="col-md-4">
							<div className="mb-3">
								<label className="form-label">{t("settings.dateFormat")}</label>
								<select
									className="form-select"
									name="dateFormat"
									value={preferences.dateFormat}
									onChange={handleChange}
								>
									<option value="DD/MM/YYYY">DD/MM/YYYY</option>
									<option value="MM/DD/YYYY">MM/DD/YYYY</option>
									<option value="YYYY-MM-DD">YYYY-MM-DD</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Display Settings */}
				<div className="mb-4">
					<h5>{t("settings.display")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.itemsPerPage")}</label>
								<select
									className="form-select"
									name="itemsPerPage"
									value={preferences.itemsPerPage}
									onChange={handleChange}
								>
									<option value="5">5 items</option>
									<option value="10">10 items</option>
									<option value="25">25 items</option>
									<option value="50">50 items</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Notification Settings */}
				<div className="mb-4">
					<h5>{t("settings.notifications")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="form-check form-switch mb-3">
								<input
									className="form-check-input"
									type="checkbox"
									name="emailNotifications"
									checked={preferences.emailNotifications}
									onChange={handleChange}
								/>
								<label className="form-check-label">{t("settings.emailNotifications")}</label>
							</div>
							<div className="form-check form-switch">
								<input
									className="form-check-input"
									type="checkbox"
									name="desktopNotifications"
									checked={preferences.desktopNotifications}
									onChange={handleChange}
								/>
								<label className="form-check-label">{t("settings.desktopNotifications")}</label>
							</div>
						</div>
					</div>
				</div>

				{/* Message Alert */}
				{message.text && (
					<div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mb-3`}>
						{message.text}
					</div>
				)}

				{/* Submit Button */}
				<div className="d-flex justify-content-end">
					<button 
						type="submit" 
						className="btn btn-primary"
						disabled={loading}
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm me-2"></span>
								{t("settings.saving")}...
							</>
						) : (
							t("settings.savePreferences")
						)}
					</button>
				</div>
			</form>
		</div>
	);
}