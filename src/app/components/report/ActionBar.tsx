// "use client";

// import React, { useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Download, RotateCcw } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// type ActionBarProps = {
//   onReset: () => void;
//   reportRef: React.RefObject<HTMLDivElement>;
// };

// export default function ActionBar({ onReset, reportRef }: ActionBarProps) {
//   const isGenerating = useRef(false);
//   const { toast } = useToast();

//   const handleDownload = async () => {
//     if (isGenerating.current) return;
//     isGenerating.current = true;

//     const element = reportRef.current;
//     if (!element) {
//       toast({
//         title: "Error",
//         description: "Report not found",
//         variant: "destructive",
//       });
//       isGenerating.current = false;
//       return;
//     }

//     toast({ title: "Generating PDF...", description: "Please wait" });

//     try {
//       const html2pdf = (await import("html2pdf.js")).default;

//       /* ------------------------------
//          CLONE REPORT
//       ------------------------------- */
//       const clone = element.cloneNode(true) as HTMLElement;

//       /* Remove UI-only elements */
//       clone
//         .querySelectorAll<HTMLElement>(
//           `
//           .action-bar,
//           .section-controls,
//           .add-section-container,
//           button,
//           [data-hide-print]
//         `
//         )
//         .forEach((el) => el.remove());

//       /* Convert inputs to text */
//       clone
//         .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
//           "input, textarea"
//         )
//         .forEach((input) => {
//           const span = document.createElement("span");
//           span.textContent = input.value || input.placeholder || "";
//           span.style.cssText = window.getComputedStyle(input).cssText;
//           span.style.border = "none";
//           span.style.background = "transparent";
//           input.replaceWith(span);
//         });

//       /* Ensure images render cleanly */
//       clone.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
//         img.style.display = "block";
//         img.style.maxWidth = "100%";
//         img.style.height = "auto";
//         img.style.objectFit = "contain";
//         img.style.pageBreakInside = "avoid";
//       });

//       /* ------------------------------
//          GENERATE PDF
//       ------------------------------- */
//       await html2pdf()
//         .set({
//           filename: "Report.pdf",
//           margin: 0,

//           image: {
//             type: "png", // ✅ PNG = sharp
//             quality: 1,
//           },

//           html2canvas: {
//             scale: 2.5, // ✅ clear but stable
//             useCORS: true,
//             backgroundColor: "#ffffff",
//             scrollX: 0,
//             scrollY: 0,
//           },

//           jsPDF: {
//             unit: "mm",
//             format: "a4",
//             orientation: "portrait",
//           },
//         })
//         .from(clone)
//         .save();

//       toast({
//         title: "Download complete",
//         description: "PDF generated successfully",
//       });
//     } catch (error) {
//       console.error(error);
//       toast({
//         title: "Error",
//         description: "PDF generation failed",
//         variant: "destructive",
//       });
//     } finally {
//       isGenerating.current = false;
//     }
//   };

//   return (
//     <div className="action-bar flex justify-end gap-3 p-4 border-t bg-white">
//       <Button
//         variant="outline"
//         onClick={onReset}
//         className="flex items-center gap-2"
//       >
//         <RotateCcw size={16} />
//         Reset
//       </Button>

//       <Button
//         onClick={handleDownload}
//         className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
//       >
//         <Download size={16} />
//         Download PDF
//       </Button>
//     </div>
//   );
// }

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

    toast({ title: "Generating PDF...", description: "Please wait" });

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      /* ------------------------------
         CLONE REPORT
      ------------------------------- */
      const clone = element.cloneNode(true) as HTMLElement;

      /* Remove UI-only elements */
      clone
        .querySelectorAll<HTMLElement>(`
          .action-bar,
          .section-controls,
          .add-section-container,
          button,
          [data-hide-print]
        `)
        .forEach((el) => el.remove());

      /* Convert inputs to plain text */
      clone
        .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
        .forEach((input) => {
          const span = document.createElement("span");
          span.textContent = input.value || input.placeholder || "";
          span.style.cssText = window.getComputedStyle(input).cssText;
          span.style.border = "none";
          span.style.background = "transparent";
          input.replaceWith(span);
        });

      /* Fix images for PDF */
      const images = clone.querySelectorAll<HTMLImageElement>("img");
      images.forEach((img) => {
        img.setAttribute("crossorigin", "anonymous");
        img.loading = "eager";
        img.style.display = "block";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.objectFit = "contain";
        img.style.pageBreakInside = "avoid";
      });

      /* ⏳ WAIT FOR IMAGES TO LOAD */
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve(true);
              img.onload = resolve;
              img.onerror = resolve;
            })
        )
      );

      /* ------------------------------
         GENERATE PDF
      ------------------------------- */
      await html2pdf()
        .set({
          filename: "Report.pdf",
          margin: 0,

          image: {
            type: "png",
            quality: 1,
          },

          html2canvas: {
            scale: 2.5,
            useCORS: true,
            allowTaint: false,
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
        .from(clone)
        .save();

      toast({
        title: "Download complete",
        description: "PDF generated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "PDF generation failed",
        variant: "destructive",
      });
    } finally {
      isGenerating.current = false;
    }
  };

  return (
    <div className="action-bar flex justify-end gap-3 p-4 border-t bg-white">
      <Button
        variant="outline"
        onClick={onReset}
        className="flex items-center gap-2"
      >
        <RotateCcw size={16} />
        Reset
      </Button>

      <Button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
      >
        <Download size={16} />
        Download PDF
      </Button>
    </div>
  );
}
