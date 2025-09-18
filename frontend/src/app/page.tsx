"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
	const { user } = useAuth();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Avoid hydration errors
		return <div className="container mt-5">Loading...</div>;
	}

	return (
		<div className="container mt-5">
			<h1 className="mb-4">🏗️ Construction Management Dashboard</h1>

			{user ? (
				<div className="alert alert-success"> Welcome back, <strong>{user.name}</strong>! </div>
			) : (
				<div className="alert alert-warning">
					You are not logged in. <Link href="/login">Login here</Link>
				</div>
			)}

			<div className="row mt-4">
				<div className="col-md-4">
					<div className="card shadow-sm">
						<div className="card-body">
							<h5 className="card-title">👷 Employees</h5>
							<p className="card-text">
								Manage employees, their rates, and assign them to projects.
							</p>
							<Link href="/employees" className="btn btn-primary">
								Go to Employees
							</Link>
						</div>
					</div>
				</div>

				<div className="col-md-4">
					<div className="card shadow-sm">
						<div className="card-body">
							<h5 className="card-title">🏗️ Projects</h5>
							<p className="card-text">
								Track construction projects, locations, budgets, and expenses.
							</p>
							<Link href="/projects" className="btn btn-primary">
								Go to Projects
							</Link>
							</div>
					</div>
				</div>

				<div className="col-md-4">
					<div className="card shadow-sm">
						<div className="card-body">
							<h5 className="card-title">💰 Invoices</h5>
							<p className="card-text">
								Generate and manage invoices for clients and contractors.
							</p>
							<Link href="/invoices" className="btn btn-primary">
								Go to Invoices
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
