"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

/**
 * Reusable hook to protect pages from unauthorized access.
 * Redirects to /not_authorized if user is not logged in.
 */

export const useAuthGuard = () => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
		router.push("/not_authorized");
		}
	}, [user, loading, router]);

	return { user, loading };
};