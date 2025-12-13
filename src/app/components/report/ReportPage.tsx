
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { initialReportState, ReportState } from "@/lib/report-data";
import ReportHeader from "./ReportHeader";
import MetaBar from "./MetaBar";
import ActionBar from "./ActionBar";
import ConclusionSection from "./ConclusionSection";
import CustomSection, { Block } from "./CustomSection";
import { PlusCircle, GripVertical, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";


const componentMap = {
  conclusion: ConclusionSection,
  custom: CustomSection,
};


type Section = {
  id: string;
  component: string;
  props: any;
  isDeletable: boolean;
  isLocked: boolean;
};


const createNewSection = (id: string, title: string): Section => ({
  id,
  component: "custom",
  props: { id },
  isDeletable: true,
  isLocked: false,
});

const initialSections: Section[] = [
  createNewSection("custom-initial", "Section Title"),
];

export default function ReportPage() {
  const [reportData, setReportData] = useState<ReportState>(() => {
    const initialId = "custom-initial";
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: "layout",
      layout: "1-col",
      children: [[]],
    };
    return {
      ...initialReportState,
      [`${initialId}-title`]: "Your Section Title",
      [initialId]: [newBlock],
    };
  });

  const [sections, setSections] = useState(initialSections);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const draggedItemId = useRef<string | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("reportData");
    const savedSections = localStorage.getItem("sections");
    const savedRecent = localStorage.getItem("recentReports");

    if (savedData) setReportData(JSON.parse(savedData));
    if (savedSections) setSections(JSON.parse(savedSections));
    if (savedRecent) setRecentReports(JSON.parse(savedRecent));
  }, []);

  useEffect(() => {
    localStorage.setItem("reportData", JSON.stringify(reportData));
  }, [reportData]);

  useEffect(() => {
    localStorage.setItem("sections", JSON.stringify(sections));
  }, [sections]);

  const updateField = useCallback((key: string, value: any) => {
    setReportData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset everything?")) return;

    localStorage.removeItem("reportData");
    localStorage.removeItem("sections");

    const newId = `custom-${Date.now()}`;
    const newSection = createNewSection(newId, "Section Title");
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: "layout",
      layout: "1-col",
      children: [[]],
    };
                                                 
    setReportData({
      ...initialReportState,
      [`${newId}-title`]: "Section Title",
      [newId]: [newBlock],
    });

    setSections([newSection]);
  }, []);

  const addSection = () => {
    const newId = `custom-${Date.now()}`;
    const newSection = createNewSection(newId, "New Section Title");
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: "layout",
      layout: "1-col",
      children: [[]],
    };

    setReportData((prev) => ({
      ...prev,
      [`${newId}-title`]: "New Section Title",
      [newId]: [newBlock],
    }));

    setSections((prev) => [...prev, newSection]);
  };

  const deleteSection = (idToDelete: string) => {
    const section = sections.find((s) => s.id === idToDelete);
    if (!section || !section.isDeletable || section.isLocked) return;

    if (!window.confirm("Delete this section?")) return;

    setSections((prev) => prev.filter((s) => s.id !== idToDelete));
  };

  const toggleLockSection = (idToToggle: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === idToToggle ? { ...s, isLocked: !s.isLocked } : s
      )
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section?.isLocked) {
      e.preventDefault();
      return;
    }
    draggedItemId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    e.preventDefault();
    if (!draggedItemId.current || draggedItemId.current === targetId) return;

    const draggedIndex = sections.findIndex(
      (s) => s.id === draggedItemId.current
    );
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedItem);

    setSections(newSections);
    draggedItemId.current = null;
  };

  const renderSection = (section: Section) => {
    const Component =
      componentMap[section.component as keyof typeof componentMap];
    if (!Component) return null;

    return (
      <div
        key={section.id}
        className={`
          relative bg-white border rounded-lg shadow-sm p-5 mb-6
          group transition-all duration-200 hover:shadow-md
          ${section.isLocked ? "opacity-75" : ""}
        `}
        draggable={!section.isLocked}
        onDragStart={(e) => handleDragStart(e, section.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section.id)}
      >
        <div className="absolute top-3 right-3 flex space-x-2 bg-white border rounded-md px-2 py-1 opacity-0 group-hover:opacity-100">
          {!section.isLocked && (
            <GripVertical size={18} className="cursor-move text-gray-500" />
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleLockSection(section.id)}
          >
            {section.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </Button>

          {section.isDeletable && !section.isLocked && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600"
              onClick={() => deleteSection(section.id)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>

        <Component
          data={reportData}
          updateField={updateField}
          isLocked={section.isLocked}
          {...section.props}
        />
      </div>
    );
  };

  // 🔥 NEW: STORE RECENT REPORT NAME
  const recentReportsRef = useRef(recentReports);
  useEffect(() => {
    recentReportsRef.current = recentReports;
  }, [recentReports]);

  const saveToRecentlyEdited = (
    data: { reportData: any; sections: any },
    reportName: string
  ) => {
    const recent = [...recentReportsRef.current];

    recent.unshift({
      id: Date.now(),
      name: reportName,
      timestamp: new Date().toLocaleString(),
      data,
    });

    if (recent.length > 10) recent.pop();

    setRecentReports(recent);
    localStorage.setItem("recentReports", JSON.stringify(recent));
  };

  // 🔥 UPDATED SAVE FUNCTION
  const downloadReport = () => {
    const reportName = window.prompt("Enter a name for this report:");

    if (!reportName || reportName.trim() === "") {
      alert("Report name is required!");
      return;
    }

    const dataToSave = { reportData, sections };
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${reportName}.json`;
    document.body.appendChild(element);
    element.click();

    saveToRecentlyEdited(dataToSave, reportName);
  };

  const loadRecentReport = (report: any) => {
    setReportData(report.data.reportData);
    setSections(report.data.sections);
  };

  return (
    <>
      <ActionBar onReset={handleReset} reportRef={reportContainerRef} />

      <div className="report-container px-8 py-5 bg-gray-100 min-h-screen" ref={reportContainerRef}>
        
        <ReportHeader data={reportData} updateField={updateField} />
        <MetaBar data={reportData} updateField={updateField} />

        {sections.map((s) => renderSection(s))}

        <div className="p-5 flex justify-center bg-white rounded-lg shadow-sm mt-4">
          <Button variant="outline" onClick={addSection}>
            <PlusCircle className="mr-2" />
            Add Section
          </Button>
        </div>

        <div data-hide-print className="p-5 flex justify-center">
          <Button variant="outline" onClick={downloadReport}>
            Save Report
          </Button>
        </div>

    
        <div data-hide-print className="p-5 bg-white rounded shadow-sm mt-6">
          <h3 className="font-semibold mb-2">Recently Saved Reports</h3>

          {recentReports.length === 0 && <p>No recent reports</p>}

          <ul>
            {recentReports.map((r) => (
              <li key={r.id} className="mb-2 flex justify-between items-center">
                <div>
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({r.timestamp})
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => loadRecentReport(r)}>
                    Load
                  </Button>
                                           


                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (!window.confirm("Delete this recent report?")) return;

                      const updated = recentReports.filter((rep) => rep.id !== r.id);
                      setRecentReports(updated);
                      localStorage.setItem("recentReports", JSON.stringify(updated));
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* <footer className="mt-6 text-center text-xs text-gray-500"> */}
        {/* <footer className="mt-6 text-center text-sm text-gray-600 leading-normal w-full">
          Energy Bill Audit Report — Corporate Version
        </footer> */}
        <footer className="mt-10 py-3 text-center text-sm text-gray-600 leading-relaxed w-full ">
  Energy Bill Audit Report — Corporate Version
</footer>
      </div>
    </>
  );
}
                                                             