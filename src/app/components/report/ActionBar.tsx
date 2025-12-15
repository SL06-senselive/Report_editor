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
  const isGenerating = useRef(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;

    const element = reportRef.current;
    if (!element) {
      toast({
        title: "Error",
        description: "Report not found",
        variant: "destructive",
      });
      isGenerating.current = false;
      return;
    }

    toast({ title: "Generating PDF...", description: "Please wait..." });

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Cast cloned node as HTMLElement
      const clone = element.cloneNode(true) as HTMLElement;

      // Remove unwanted elements
      clone.querySelectorAll<HTMLElement>(`
        .section-controls, .add-section-container, .action-bar,
        [data-hide-print], button, .drag-handle, .popover-content
      `).forEach((el) => el.remove());


      // Replace inputs and textareas with spans
      clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
        .forEach((input) => {
          const span = document.createElement("span");
          span.textContent = input.value || input.placeholder || "";
          span.style.cssText = window.getComputedStyle(input).cssText;
          span.style.border = "none";
          span.style.background = "transparent";
          input.parentNode?.replaceChild(span, input);
        });

      // Wrap content in A4 sized container
      const wrapper = document.createElement("div");
      wrapper.style.width = "794px";
      wrapper.style.minHeight = "auto";
      wrapper.style.margin = "0 auto";
      wrapper.style.background = "#fff";
      wrapper.style.padding = "0";
      wrapper.appendChild(clone);

      // Fix images
      clone.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        img.style.maxWidth = "100%";
       // img.style.height = "1123px";
       img.style.height = "auto";
         img.style.maxWidth = "100%";    
        img.style.display = "block";
        img.style.objectFit = "contain";
        img.style.pageBreakInside = "avoid";
        img.style.breakInside = "avoid";
        img.style.margin = "10px auto";
      });

 // ✅ WAIT FOR IMAGES TO LOAD (MAIN FIX)
      const images = clone.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            })
        )
      );


      // Add print styles
      const style = document.createElement("style");
      style.textContent = `
        img, 
        .image-block, 
        .img-container {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .section, 
        .content-block {
          page-break-inside: auto !important;
          break-inside: auto !important;
        }

        .page-break {
          page-break-before: always !important;
        }
      `;
      wrapper.appendChild(style);

      // Generate PDF
      await html2pdf()
        .set({
          margin: 0,
          filename: "Report.pdf",
          image: { type: "jpeg", quality: 1.0 },
          html2canvas: {
            scale: 3,
            scrollY: 0,
            scrollX: 0,
            useCORS: true,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(wrapper)
        .save();

      toast({ title: "Download Complete", description: "Your PDF is ready!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "PDF failed.", variant: "destructive" });
    } finally {
      isGenerating.current = false;
    }
  };

  return (
    <div className="action-bar flex justify-end gap-3 p-4 border-t bg-white shadow-sm">
      <Button
        variant="outline"
        onClick={onReset}
        className="flex items-center gap-2"
      >
        <RotateCcw size={16} /> Reset
      </Button>

      <Button
        onClick={handleDownload}
        className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
      >
        <Download size={16} /> Download PDF
      </Button>
    </div>
  );
}

