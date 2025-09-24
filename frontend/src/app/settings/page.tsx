// app/settings/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import UserSettings from "@/components/settings/UserSettings";
import Preferences from "@/components/settings/Preferences";
import CompanyDetails from "@/components/settings/CompanyDetails";
import { FaUser, FaCog, FaBuilding } from "react-icons/fa";
import { useTranslation } from "react-i18next";

type SettingsSection = "user" | "preferences" | "company";

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState<SettingsSection>("user");

    const sections = [
        { id: "user" as SettingsSection, name: "User Settings", icon: <FaUser /> },
        { id: "preferences" as SettingsSection, name: "Preferences", icon: <FaCog /> },
        { id: "company" as SettingsSection, name: "Company Details", icon: <FaBuilding /> }
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
                                        className={`nav-link text-start py-3 border-bottom ${
                                            activeSection === section.id 
                                                ? "active bg-primary text-white fw-bold" 
                                                : "text-dark fw-semibold"
                                        }`}
                                        onClick={() => setActiveSection(section.id)}
                                        style={{ 
                                            border: "none",
                                            borderRadius: 0,
                                            cursor: "pointer",
                                            fontSize: "1.1rem"
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