"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

type ActionBarProps = {
  onReset: () => void;
  reportRef: React.RefObject<HTMLDivElement>;
};

export default function ActionBar({ onReset, reportRef }: ActionBarProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) {
      toast({
        title: "Error",
        description: "Could not find report content to download.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
        title: "Generating PDF...",
        description: "Please wait while your report is being generated. This may take a moment.",
    });

    // Temporarily hide elements that shouldn't be in the PDF
    const elementsToHide = reportElement.querySelectorAll('.chart-tools, .ai-insights-btn, [data-hide-print="true"]');
    elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
          // On clone, find all textareas and replace them with divs showing their value
          // This ensures the text is rendered correctly in the canvas
          document.querySelectorAll('textarea').forEach(textarea => {
            const div = document.createElement('div');
            div.innerText = textarea.value;
            // Copy relevant styles
            div.style.whiteSpace = 'pre-wrap';
            div.style.wordWrap = 'break-word';
            div.style.width = `${textarea.clientWidth}px`;
            div.style.height = `${textarea.clientHeight}px`;
            div.className = textarea.className;
            textarea.parentNode?.replaceChild(div, textarea);
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = imgWidth / pdfWidth;
      const canvasHeightInPdf = imgHeight / ratio;
      const totalPages = Math.ceil(canvasHeightInPdf / pdfHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        const yPos = -pdfHeight * i;
        pdf.addImage(imgData, 'PNG', 0, yPos, pdfWidth, canvasHeightInPdf);
      }
      
      pdf.save('energy-bill-audit-report.pdf');
      
      toast({
        title: "Success!",
        description: "Your PDF report has been downloaded.",
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "An unexpected error occurred while generating the PDF.",
        variant: "destructive",
      });
    } finally {
      // Restore hidden elements
      elementsToHide.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  return (
    <div className="action-bar bg-card shadow-md p-2 flex justify-end items-center gap-2 sticky top-0 z-40">
      <Button variant="outline" onClick={onReset}>
        <RotateCcw />
        Reset All
      </Button>
      <Button onClick={handleDownload}>
        <Download />
        Download Report as PDF
      </Button>
    </div>
  );
}
