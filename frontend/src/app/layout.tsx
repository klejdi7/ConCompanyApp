'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useEffect } from 'react';
import '@/lib/i18n';

export default function RootLayout({ children }: { children: React.ReactNode }) {
useEffect(() => {
	// @ts-ignore
	import('bootstrap/dist/js/bootstrap.bundle.min.js');
}, []);

return (
	<html lang="en">
		<body>
			<AuthProvider>
				<Navbar />
				<main>{children}</main>
			</AuthProvider>
		</body>
	</html>
);
}
