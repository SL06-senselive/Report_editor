// app/api/generate-pdf/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs"; // Required for Puppeteer

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content missing" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Print-optimized CSS
    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 15mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; background: #ffffff; }
        .section-controls, .action-bar, .add-section-container, .drag-handle-block, button { display: none !important; }
        img { max-width: 100% !important; height: auto !important; max-height: 260mm !important; object-fit: contain !important; display: block !important; margin: 8mm auto !important; page-break-inside: avoid !important; break-inside: avoid !important; }
        .grid, .block-container, figure, .image-block { page-break-inside: avoid !important; break-inside: avoid !important; }
        p, h1, h2, h3, table { page-break-inside: auto; }
        .page-break { page-break-before: always; }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    // ✅ Use Buffer.from to ensure type-safe body for NextResponse
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Report.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
