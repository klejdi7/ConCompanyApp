"use client";

export default function Loading({ text = "Loading..." }: { text?: string }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "200px" }} >
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">{text}</span>
			</div>
			<small className="mt-2 text-muted">{text}</small>
		</div>
	);
}