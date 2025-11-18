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
    const reportContainer = reportRef.current;
    if (!reportContainer) {
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

    const originalBackgroundColor = reportContainer.style.backgroundColor;
    reportContainer.style.backgroundColor = 'white';

    reportContainer.classList.add('printing-pdf');
    
    const textareas = reportContainer.querySelectorAll('textarea');
    const originalTextareas: { parent: ParentNode; nextSibling: Node | null; textarea: HTMLTextAreaElement }[] = [];
    textareas.forEach(textarea => {
      if (textarea.style.display === 'none') return;
      const div = document.createElement('div');
      // Use innerText to respect newlines, but use styling to ensure wrapping
      div.innerText = textarea.value; 
      div.style.whiteSpace = 'pre-wrap'; // respects newlines and spaces
      div.style.wordBreak = 'break-word'; // breaks long words
      div.className = textarea.className;
      div.classList.add('printable-div');
      // Ensure the div mimics the textarea's dimensions to help with layout
      div.style.width = `${textarea.offsetWidth}px`;
      div.style.minHeight = `${textarea.offsetHeight}px`;
      originalTextareas.push({ parent: textarea.parentNode!, nextSibling: textarea.nextSibling, textarea });
      textarea.parentNode!.replaceChild(div, textarea);
    });
    
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const pageMargin = 10;
      
      const canvas = await html2canvas(reportContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: reportContainer.scrollWidth,
          windowHeight: reportContainer.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = imgWidth / pdfWidth;
      const totalPdfHeight = imgHeight / ratio;
      const pageContentHeight = pdfHeight - (pageMargin * 2);

      let yOffset = 0;
      let pageNum = 1;

      while (yOffset < totalPdfHeight) {
        if (pageNum > 1) {
          pdf.addPage();
        }
        
        // Calculate the portion of the canvas to draw
        const sourceY = yOffset * ratio;
        const sourceHeight = Math.min((pageContentHeight * ratio), (imgHeight - sourceY));
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = tempCanvas.toDataURL('image/png');
            const pageImgHeight = tempCanvas.height / ratio;

            pdf.addImage(pageImgData, 'PNG', 0, pageMargin, pdfWidth, pageImgHeight);
        }

        yOffset += pageContentHeight;
        pageNum++;
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
      // Restore the view
      reportContainer.classList.remove('printing-pdf');
      
      reportContainer.querySelectorAll('.printable-div').forEach(div => {
        if (div.parentNode) {
            div.parentNode.removeChild(div);
        }
      });
      originalTextareas.forEach(({ parent, nextSibling, textarea }) => {
        parent.insertBefore(textarea, nextSibling);
      });
      
      reportContainer.style.backgroundColor = originalBackgroundColor;
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
