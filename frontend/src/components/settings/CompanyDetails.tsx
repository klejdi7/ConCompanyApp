"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

export default function CompanyDetails() {
	const { t } = useTranslation();

	const [company, setCompany] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		country: "",
		vatNumber: "",
		website: "",
		currency: "EUR"
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	useEffect(() => {
		loadCompanyDetails();
	}, []);

	const loadCompanyDetails = async () => {
		try {
			const response = await api.get("/api/company/details");
			if (response.data) {
				setCompany(response.data);
			}
		} catch (error) {
			console.error("Failed to load company details");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage({ type: "", text: "" });

		try {
			await api.put("/api/company/details", company);
			setMessage({ type: "success", text: "Company details saved successfully" });
		} catch (error: any) {
			setMessage({ 
				type: "error", 
				text: error.response?.data?.error || "Failed to save company details" 
			});
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setCompany({
			...company,
			[e.target.name]: e.target.value
		});
	};

	return (
		<div>
			<h5>{t("settings.company")}</h5>
			<form onSubmit={handleSubmit}>
				{/* Basic Company Information */}
				<div className="mb-4">
					<h5>{t("settings.basicInformation")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.companyName")} *</label>
								<input
									type="text"
									className="form-control"
									name="name"
									value={company.name}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.vatNumber")} *</label>
								<input
									type="text"
									className="form-control"
									name="vatNumber"
									value={company.vatNumber}
									onChange={handleChange}
									required
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Contact Information */}
				<div className="mb-4">
					<h5>{t("settings.contactInformation")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.emailAddress")}</label>
								<input
									type="email"
									className="form-control"
									name="email"
									value={company.email}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.phoneNumber")}</label>
								<input
									type="tel"
									className="form-control"
									name="phone"
									value={company.phone}
									onChange={handleChange}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Address Information */}
				<div className="mb-4">
					<h5>{t("settings.addressInformation")}</h5>
					<div className="row">
						<div className="col-md-8">
							<div className="mb-3">
								<label className="form-label">{t("settings.address")}</label>
								<input
									type="text"
									className="form-control"
									name="address"
									value={company.address}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className="col-md-4">
							<div className="mb-3">
								<label className="form-label">{t("settings.city")}</label>
								<input
									type="text"
									className="form-control"
									name="city"
									value={company.city}
									onChange={handleChange}
								/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.country")}</label>
								<input
									type="text"
									className="form-control"
									name="country"
									value={company.country}
									onChange={handleChange}
								/>
							</div>
						</div>
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.website")}</label>
								<input
									type="url"
									className="form-control"
									name="website"
									value={company.website}
									onChange={handleChange}
									placeholder="https://"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Financial Settings */}
				<div className="mb-4">
					<h5>{t("settings.financialSettings")}</h5>
					<div className="row">
						<div className="col-md-6">
							<div className="mb-3">
								<label className="form-label">{t("settings.defaultCurrency")}</label>
								<select
									className="form-select"
									name="currency"
									value={company.currency}
									onChange={handleChange}
								>
									<option value="EUR">{t("settings.euro")}</option>
									<option value="USD">{t("settings.usDollar")}</option>
									<option value="GBP">{t("settings.britishPound")}</option>
								</select>
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
							t("settings.saveCompanyDetails")
						)}
					</button>
				</div>
			</form>
		</div>
	);
}