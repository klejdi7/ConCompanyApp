"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

interface User {
	id: number;
	name: string;
	email: string;
}

interface AuthContextType {
	token: string | null;
	user: User | null;
	login: (token: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	token: null,
	user: null,
	login: async () => {},
	logout: () => {},
	loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			setToken(storedToken);
			fetchUser(storedToken).finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, []);

	const fetchUser = async (jwt: string) => {
		try {
			const res = await api.get("http://localhost:4000/api/me");
			setUser(res.data);
		} catch (err) {
			console.error("Failed to fetch user:", err);
			logout();
		}
	};

	const login = async (newToken: string) => {
		localStorage.setItem("token", newToken);
		setToken(newToken);
		await fetchUser(newToken);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
		window.location.href = "/login";
	};

	return (
		<AuthContext.Provider value={{ token, user, login, logout, loading }}>
		{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
