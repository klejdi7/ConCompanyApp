"use client";

import Link from "next/link";

export default function NotAuthorizedPage() {
  return (
    <div className="container mt-5 text-center">
      <h1 className="text-danger mb-3">❌ Not Authorized</h1>
      <p className="mb-3">
        You do not have permission to access this page.
      </p>
      <Link href="/login" className="btn btn-primary">
        Go to Login
      </Link>
    </div>
  );
}
