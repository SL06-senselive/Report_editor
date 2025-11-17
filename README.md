# Energy Audit Pro

This is a Next.js application that allows users to create, edit, and export Energy Bill Audit Reports.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Features

- **Inline Editing**: All text fields in the report are editable. Click on any text to start editing.
- **Image Upload**: All chart slots support both drag-and-drop and click-to-upload for images.
- **Image Composer**: An advanced tool to upload a base image and overlay it with draggable text elements.
- **AI-Powered Insights**: The "Conclusion" section features an AI assistant that analyzes report data to suggest insights and recommendations.
- **PDF Export**: A "Download Report as PDF" button captures the entire report and generates a clean, multi-page A4 PDF document.
- **Reset**: A "Reset All" button quickly clears all edited text and uploaded images, restoring the report to its initial state.

## How PDF Generation Works

The PDF generation feature is powered by the `html2canvas` and `jspdf` libraries.

1.  When you click "Download Report as PDF", the application uses `html2canvas` to take a high-resolution "screenshot" of the entire report container.
2.  The resulting image is then passed to `jspdf`.
3.  The logic calculates the total height required for the image and automatically splits it across multiple A4 pages, ensuring no content is cut off.
4.  Finally, it prompts you to save the generated `energy-bill-audit-report.pdf` file.
