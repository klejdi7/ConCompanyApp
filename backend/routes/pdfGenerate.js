import PDFDocument from 'pdfkit';
import fs from 'fs';
import Queue from 'bull';
import path from 'path';
import { PrismaClient } from "@prisma/client";
import express from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();
const pdfQueue = new Queue('pdf generation', 'redis://127.0.0.1');

/*
Project Offers CRUD
*/
router.get("/projects/:id/offers", authMiddleware, async (req, res) => {
	try {
		const projectId = Number(req.params.id);
		const offers = await prisma.projectOffers.findMany({
			where: { projectId },
			orderBy: { createdAt: 'desc' }
		});
		res.json(offers);
	} catch (err) {
		console.error("Error fetching offers:", err);
		res.status(500).json({ error: "Failed to fetch offers" });
	}
});

router.post("/projects/:id/generate-offer", authMiddleware, async (req, res) => {
	try {
		const projectId = Number(req.params.id);
		const { name = "Project Offer" } = req.body;

		// 1. Create offer record with empty file field
		const offer = await prisma.projectOffers.create({
			data: {
				name,
				projectId,
				offer: 0, // Will be calculated during PDF generation
				file: "" // Empty initially
			}
		});

		// 2. Add PDF generation job to queue
		await pdfQueue.add('generate-pdf', {
			offerId: offer.id,
			projectId: projectId
		}, {
			delay: 1000, // Small delay to ensure record is created
			attempts: 3 // Retry 3 times if fails
		});

		res.json({ 
			message: "Offer generation started", 
			offer 
		});

	} catch (err) {
		console.error("Error generating offer:", err);
		res.status(500).json({ error: "Failed to start offer generation" });
	}
});

router.get("/projects/:projectId/offers/:offerId/download", authMiddleware, async (req, res) => {
	try {
		const { projectId, offerId } = req.params;
		
		const offer = await prisma.projectOffers.findFirst({
			where: { 
				id: Number(offerId),
				projectId: Number(projectId)
			}
		});

		if (!offer || !offer.file) {
			return res.status(404).json({ error: "File not found or not generated yet" });
		}

		// Send the PDF file
		res.download(`public/${offer.file}`, `offer-${projectId}-${offerId}.pdf`);

	} catch (err) {
		console.error("Download error:", err);
		res.status(500).json({ error: "Download failed" });
	}
});

// PDF Generation Queue Processor
pdfQueue.process('generate-pdf', async (job) => {
	const { offerId, projectId } = job.data;
	
	try {
		// Fetch project data with expenses
		const project = await prisma.project.findUnique({
			where: { id: projectId },
			include: {
				ProjectExpenses: {
					include: { 
						expenses: { 
							include: { expenseCategories: true } 
						} 
					}
				}
			}
		});

		if (!project) {
			throw new Error("Project not found");
		}

		// Calculate total offer amount
		const totalAmount = project.ProjectExpenses.reduce((sum, expense) => {
			return sum + (expense.price * expense.Quantity);
		}, 0);

		// Generate PDF file path
		const fileName = `offers/offer-${projectId}-${offerId}-${Date.now()}.pdf`;
		const filePath = path.join(process.cwd(), 'public', fileName);

		// Ensure directory exists
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		// Generate PDF (using the PDF generation code from previous example)
		await generateOfferPDF(filePath, project, totalAmount);

		// Update offer record with file path and calculated amount
		await prisma.projectOffers.update({
			where: { id: offerId },
			data: {
				file: fileName,
				offer: totalAmount
			}
		});

		return { success: true, filePath };

	} catch (error) {
		console.error("PDF generation job failed:", error);
		throw error; 
	}
});

// Monitor queue progress 
pdfQueue.on('completed', (job, result) => {
	console.log(`PDF generation completed for offer ${job.data.offerId}`);
});

pdfQueue.on('failed', (job, err) => {
	console.error(`PDF generation failed for offer ${job.data.offerId}:`, err);
});

// PDF generation function
async function generateOfferPDF(filePath, project, totalAmount) {
	const doc = new PDFDocument({ margin: 50 });

	// Pipe the PDF to the specified file path
	doc.pipe(fs.createWriteStream(filePath));

	const { companyInfo, expenses } = await getOfferData(project);

	// Header: Company logo (bold, styled) left, info right
	doc.fontSize(28)
		.font('Helvetica-Bold')
		.fillColor('#2C3E50')
		.text(companyInfo.name, 50, 50, {
			align: 'left',
			underline: false,
			characterSpacing: 2
		});
	doc.fontSize(10)
		.font('Helvetica')
		.fillColor('black')
		.text(`Email: ${companyInfo.email}`, 400, 50, { align: 'right' })
		.text(`Address: ${companyInfo.address}`, 400, 65, { align: 'right' })
		.text(`VAT: ${companyInfo.vat}`, 400, 80, { align: 'right' })
		.text(`Website: ${companyInfo.website}`, 400, 95, { align: 'right' });

	// Heading
	doc.fontSize(16).text('OFFER', 50, 120);

	// Expenses Table
	let yPosition = 160;

	// Table Header
	doc.fontSize(10)
		.text('Description', 50, yPosition)
		.text('Category', 200, yPosition)
		.text('Qty', 350, yPosition)
		.text('Price', 400, yPosition)
		.text('Total', 450, yPosition);

	yPosition += 20;
	doc.moveTo(50, yPosition).lineTo(500, yPosition).stroke();
	yPosition += 10;

	// Table Rows
	project.ProjectExpenses.forEach(expense => {
		const total = expense.price * expense.Quantity;
		doc.text(expense.expenses.name, 50, yPosition)
			.text(expense.expenses.expenseCategories.name, 200, yPosition)
			.text(expense.Quantity.toString(), 350, yPosition)
			.text(`€${expense.price.toFixed(2)}`, 400, yPosition)
			.text(`€${total.toFixed(2)}`, 450, yPosition);

		yPosition += 20;
	});

	// Empty Space (for future content)
	yPosition += 30;
	doc.text('Additional Notes:', 50, yPosition);
	yPosition += 40; // Reserve space

	// Total
	yPosition += 20;
	doc.moveTo(50, yPosition).lineTo(500, yPosition).stroke();
	yPosition += 10;
	doc.fontSize(12).text(`TOTAL: €${totalAmount.toFixed(2)}`, 400, yPosition, { align: 'right' });

	doc.end();
}

async function getOfferData(project) {
	const userCompany = await prisma.userCompany.findFirst({
		where: { userId: project.userId },
		include: { company: true }
	});
	const company = userCompany?.company || {};
	return {
		companyInfo: {
			name: company.name || "Your Company",
			email: company.email || "info@company.com",
			address: company.address || "123 Business St, City",
			vat: company.vatNumber || "VAT123456789",
			website: company.website || "www.company.com"
		},
		expenses: project.ProjectExpenses
	};
}

export { generateOfferPDF };
export default router;