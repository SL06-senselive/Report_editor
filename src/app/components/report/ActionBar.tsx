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

      /* ---------------------------------------
         CLONE REPORT
      ---------------------------------------- */
      const clone = element.cloneNode(true) as HTMLElement;

      clone
        .querySelectorAll<HTMLElement>(
          `.section-controls,
           .add-section-container,
           .action-bar,
           [data-hide-print],
           button,
           .drag-handle,
           .popover-content`
        )
        .forEach((el) => el.remove());

      /* ---------------------------------------
         INPUT → TEXT
      ---------------------------------------- */
      clone
        .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          "input, textarea"
        )
        .forEach((input) => {
          const span = document.createElement("span");
          span.textContent = input.value || input.placeholder || "";
          span.style.cssText = window.getComputedStyle(input).cssText;
          span.style.border = "none";
          span.style.background = "transparent";
          input.parentNode?.replaceChild(span, input);
        });

      /* ---------------------------------------
         WRAPPER (A4 WIDTH)
      ---------------------------------------- */
      const wrapper = document.createElement("div");
      wrapper.style.width = "794px"; // A4 @ 96dpi
      wrapper.style.background = "#ffffff";
      wrapper.style.margin = "0 auto";
      wrapper.style.padding = "0";
      wrapper.appendChild(clone);

      /* ---------------------------------------
         ATTACH TO DOM (CRITICAL)
      ---------------------------------------- */
      wrapper.style.position = "absolute";
      wrapper.style.left = "-10000px";
      wrapper.style.top = "0";
      document.body.appendChild(wrapper);

      /* ---------------------------------------
         IMAGE FIX + BASE64 CONVERSION
      ---------------------------------------- */
      const images = clone.querySelectorAll<HTMLImageElement>("img");

      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>(async (resolve) => {
              try {
                const response = await fetch(img.src, { mode: "cors" });
                const blob = await response.blob();

                const reader = new FileReader();
                reader.onloadend = () => {
                  img.src = reader.result as string;
                  img.style.display = "block";
                  img.style.maxWidth = "100%";
                  img.style.height = "auto";
                  img.style.objectFit = "contain";
                  img.style.pageBreakInside = "avoid";
                  img.style.breakInside = "avoid";
                  img.style.margin = "0 auto";
                  resolve();
                };
                reader.readAsDataURL(blob);
              } catch {
                resolve();
              }
            })
        )
      );

      /* ---------------------------------------
         WAIT FOR FINAL PAINT
      ---------------------------------------- */
      await new Promise(requestAnimationFrame);

      /* ---------------------------------------
         GENERATE PDF
      ---------------------------------------- */
      await html2pdf()
        .set({
          margin: 0,
          filename: "Report.pdf",

          image: { type: "png", quality: 1.0 }, // ✅ PNG = SHARP
          html2canvas: {
            scale: 3, // ✅ HIGH DPI
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(wrapper)
        .save();

      toast({
        title: "Download Complete",
        description: "Your PDF is ready!",
      });

      /* ---------------------------------------
         CLEANUP
      ---------------------------------------- */
      document.body.removeChild(wrapper);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "PDF generation failed.",
        variant: "destructive",
      });
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
