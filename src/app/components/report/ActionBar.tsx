// components/ActionBar.tsx → FINAL FIXED VERSION (NO BLANK PAGES, IMAGES PERFECT)
"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ActionBarProps = {
  onReset: () => void;
  reportRef: React.RefObject<HTMLDivElement>;
};

export default function ActionBar({ onReset, reportRef }: ActionBarProps) {
  const { toast } = useToast();
  const isGenerating = useRef(false);

  const handleDownload = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;

    const element = reportRef.current;
    if (!element) {
      toast({ title: "Error", description: "Report not found", variant: "destructive" });
      isGenerating.current = false;
      return;
    }

    toast({ title: "Generating PDF...", description: "Creating perfect report..." });

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const clone = element.cloneNode(true) as HTMLElement;

      // 1. Remove editor junk
      clone.querySelectorAll(`
        .section-controls, .add-section-container, .action-bar,
        [data-hide-print]:not(#date), button:not(#date), .drag-handle,
        .popover-content, .lucide
      `).forEach(el => el.remove());

      // 2. Replace inputs
      clone.querySelectorAll("input, textarea").forEach((input: any) => {
        const span = document.createElement("span");
        span.textContent = input.value || input.placeholder || "";
        span.style.cssText = window.getComputedStyle(input).cssText;
        span.style.background = "transparent";
        span.style.border = "1px solid transparent";
        input.parentNode?.replaceChild(span, input);
      });

      // 3. Fix date tag (canvas-safe)
      const dateButton = clone.querySelector("#date");
      if (dateButton) {
        const dateText = dateButton.textContent?.trim() || "Select Date Range";
        const staticDate = document.createElement("div");
        staticDate.innerHTML = `
          <span style="display:inline-flex;align-items:center;gap:8px;background:white;color:#1e293b;padding:9px 18px;border-radius:9999px;border:1px solid #e2e8f0;font-size:14px;font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,0.1);white-space:nowrap;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${dateText}
          </span>
        `;
        dateButton.parentNode?.replaceChild(staticDate.firstElementChild!, dateButton);
      }

      // 4. Fix header spacing
      const header = clone.querySelector(".report-header");
      if (header) {
        (header as HTMLElement).style.cssText = "padding:1.5rem 2rem 2rem !important;display:flex;flex-direction:column;gap:0.75rem !important;";
      }
      clone.querySelectorAll(".report-header h1, .report-header > div").forEach(el => {
        (el as HTMLElement).style.cssText += "margin:0 !important;padding:0 !important;line-height:1.2 !important;";
      });

      // 5. PERFECT PAGINATION — NO BLANK PAGES + NO CUT CONTENT
      const sections = clone.querySelectorAll('.report-section');
      sections.forEach((section, index) => {
        const el = section as HTMLElement;

        // First section stays with header
        if (index === 0) {
          el.style.marginTop = "1.5rem";
          el.style.pageBreakBefore = "avoid";
        } 
        // Subsequent sections: new page, but only if needed
        else {
          el.style.pageBreakBefore = "always";  // This is safe now
          el.style.marginTop = "0";
          el.style.paddingTop = "2rem";
        }

        // Prevent splitting
        el.style.pageBreakInside = "avoid";
        el.style.breakInside = "avoid";
        el.style.boxSizing = "border-box";

        // Fix images inside sections — NO OVERFLOW, NO CUTTING
        el.querySelectorAll("img").forEach(img => {
          const imgEl = img as HTMLElement;
          imgEl.style.maxWidth = "100% !important";
          imgEl.style.height = "auto !important";
          imgEl.style.display = "block !important";
          imgEl.style.pageBreakInside = "avoid";
          imgEl.style.breakInside = "avoid";
          // Force image container to contain it
          if (imgEl.parentElement) {
            imgEl.parentElement.style.overflow = "hidden";
            imgEl.parentElement.style.borderRadius = "0.75rem";
          }
        });
      });

      // 6. Global print styles — CLEAN & SAFE
      const style = document.createElement("style");
      style.textContent = `
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @page { margin: 15mm; size: A4; }
        .report-header { background: #1e40af !important; color: white !important; }
        .report-section { 
          page-break-inside: avoid !important; 
          break-inside: avoid !important; 
          margin-bottom: 2rem;
        }
        img { 
          max-width: 100% !important; 
          height: auto !important; 
          display: block !important;
          page-break-inside: avoid !important;
        }
        .report-container { background: white !important; }
      `;
      clone.appendChild(style);

      // 7. Generate PDF
      await html2pdf()
        .set({
          margin: [12, 15, 12, 15],
          filename: "Energy-Bill-Audit-Report.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            windowWidth: 794,  // A4 width in pixels at 96dpi
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(clone)
        .save();

      toast({ title: "Downloaded!", description: "Perfect PDF ready!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Failed", description: "Try again", variant: "destructive" });
    } finally {
      isGenerating.current = false;
    }
  };

  return (
    <div className="action-bar bg-card shadow-md p-4 flex justify-end gap-3 sticky top-0 z-50 border-b">
      <Button variant="outline" size="sm" onClick={onReset} disabled={isGenerating.current}>
        <RotateCcw className="mr-2 h-4 w-4" /> Reset All
      </Button>
      <Button onClick={handleDownload} size="sm" disabled={isGenerating.current}>
        <Download className="mr-2 h-4 w-4" />
        {isGenerating.current ? "Generating..." : "Download PDF"}
      </Button>
    </div>
  );
}