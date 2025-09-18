"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
const { user, logout } = useAuth();
const [mounted, setMounted] = useState(false);

useEffect(() => {
	setMounted(true);
}, []);

if (!mounted) {
	return <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3" />;
}

return (
	<nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
		{/* Brand */}
		<Link href="/" className="navbar-brand">
			Construction App
		</Link>

		{/* Toggler for mobile */}
		<button
			className="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarContent"
			aria-controls="navbarContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span className="navbar-toggler-icon"></span>
		</button>

		{/* Collapsible content */}
		<div className="collapse navbar-collapse" id="navbarContent">
			<ul className="navbar-nav me-auto">
			{user && (
				<>
				<li className="nav-item">
					<Link href="/employees" className="nav-link">
					Employees
					</Link>
				</li>
				<li className="nav-item">
					<Link href="/projects" className="nav-link">
					Projects
					</Link>
				</li>
				<li className="nav-item">
					<Link href="/invoices" className="nav-link">
					Invoices
					</Link>
				</li>
				</>
			)}
			</ul>

			<ul className="navbar-nav ms-auto">
			{user ? (
				<li className="nav-item dropdown">
				<button
					className="btn btn-outline-light dropdown-toggle"
					id="userDropdown"
					data-bs-toggle="dropdown"
					aria-expanded="false"
				>
					{user.name}
				</button>
				<ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
					<li>
					<Link className="dropdown-item" href="/settings">
						Settings
					</Link>
					</li>
					<li>
					<button className="dropdown-item text-danger" onClick={logout}>
						Logout
					</button>
					</li>
				</ul>
				</li>
			) : (
				<li className="nav-item">
				<Link href="/login" className="btn btn-outline-primary">
					Login
				</Link>
				</li>
			)}
			</ul>
		</div>
	</nav>
);
}
