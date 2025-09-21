"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
const [form, setForm] = useState({ email: "", password: "" });
const [error, setError] = useState<string | null>(null);
const router = useRouter();
const { login } = useAuth();

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	try {
		const res = await axios.post("http://localhost:4000/auth/login", form);
		await login(res.data.token);
		router.push("/");
	} catch (err) {
		setError("Invalid email or password");
	}
};

return (
	<div className="container mt-5">
		<h2>Login</h2>
		<form onSubmit={handleSubmit} className="mt-3">
			<div className="mb-3">
				<label>Email</label>
				<input
					type="email"
					name="email"
					value={form.email}
					onChange={handleChange}
					className="form-control"
					required
				/>
			</div>
			<div className="mb-3">
				<label>Password</label>
				<input
					type="password"
					name="password"
					value={form.password}
					onChange={handleChange}
					className="form-control"
					required
				/>
			</div>
			{error && <p className="text-danger">{error}</p>}
			<button type="submit" className="btn btn-primary">
				Login
			</button>
		</form>
	</div>
);
}
