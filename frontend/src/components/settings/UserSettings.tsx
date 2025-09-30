"use client";

import { useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface UserSettingsProps {
	user: any;
}

export default function UserSettings({ user }: UserSettingsProps) {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		currentPassword: "",
		newPassword: "",
		confirmPassword: ""
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			// Update user profile
			await api.post("/auth/user/update", {
				name: formData.name,
				email: formData.email
			});

			// Update password if provided
			if (formData.newPassword) {
				if (formData.newPassword !== formData.confirmPassword) {
					setMessage({ type: "error", text: "New passwords do not match" });
					return;
				}
				await api.put("/auth/user/password", {
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword
				});
			}

			setMessage({ type: "success", text: "Profile updated successfully" });
			
			// Reset password fields
			setFormData(prev => ({
				...prev,
				currentPassword: "",
				newPassword: "",
				confirmPassword: ""
			}));

		} catch (error: any) {
			setMessage({ 
				type: "error", 
				text: error.response?.data?.error || "Failed to update profile" 
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	return (
		<div>
			<hr/>
			<form onSubmit={handleSubmit}>
				{/* Profile Information */}
				<div className="mb-4">
					<h5>{t("settings.profileInformation")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.fullName")}</label>
								<input
									type="text"
									className="form-control"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.emailAddress")}</label>
								<input
									type="email"
									className="form-control"
									name="email"
									value={formData.email}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Password Change */}
				<div className="mb-4">
					<h5>{t("settings.changePassword")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.currentPassword")}</label>
								<input
									type="password"
									className="form-control"
									name="currentPassword"
									value={formData.currentPassword}
									onChange={handleChange}
									placeholder={t("settings.leaveBlank")}
								/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.newPassword")}</label>
								<input
									type="password"
									className="form-control"
									name="newPassword"
									value={formData.newPassword}
									onChange={handleChange}
									placeholder={t("settings.enterNewPassword")}
								/>
							</div>
						</div>
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.confirmNewPassword")}</label>
								<input
									type="password"
									className="form-control"
									name="confirmPassword"
									value={formData.confirmPassword}
									onChange={handleChange}
									placeholder={t("settings.confirmNewPassword")}
								/>
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
							t("settings.saveChanges")
						)}
					</button>
				</div>
			</form>
		</div>
	);
}