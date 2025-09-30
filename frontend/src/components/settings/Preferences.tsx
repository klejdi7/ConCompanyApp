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
		currency: "EUR",
		itemsPerPage: 10,
		emailNotifications: true,
		darkMode: false
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

	useEffect(() => {
		// Load user preferences
		loadPreferences();
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	// Update the darkMode state in preferences when the theme changes
	useEffect(() => {
		setPreferences((prev: typeof preferences) => ({
			...prev,
			darkMode: theme === "dark"
		}));
	}, [theme]);

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

	// Update the theme state when the switch is toggled
	const handleDarkModeToggle = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
		// Manually dispatch a storage event for immediate update in other components
		window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: newTheme }));
	};

	return (
		<div>
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
									<option value="Europe/London">London (GMT+0)</option>
									<option value="Europe/Berlin">Berlin (GMT+1)</option>
									<option value="Europe/Paris">Paris (GMT+1)</option>
									<option value="Europe/Rome">Rome (GMT+1)</option>
									<option value="Europe/Madrid">Madrid (GMT+1)</option>
									<option value="UTC">UTC (GMT+0)</option>
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
						<div className="col-md-4">
							<div className="mb-3">
								<label className="form-label">{t("settings.currency")}</label>
								<select
									className="form-select"
									name="currency"
									value={preferences.currency}
									onChange={handleChange}
								>
									<option value="EUR">Euro (€)</option>
									<option value="USD">US Dollar ($)</option>
									<option value="GBP">British Pound (£)</option>
									<option value="ALL">Albanian Lek (L)</option>
								</select>
							</div>
						</div>
						<div className="col-md-4">
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

				{/* Notification & Theme Settings */}
				<div className="mb-4">
					<h5>{t("settings.notifications")} & {t("settings.theme")}</h5>
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
									name="darkMode"
									checked={preferences.darkMode}
									onChange={handleDarkModeToggle}
								/>
								<label className="form-check-label">{t("settings.darkMode")}</label>
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