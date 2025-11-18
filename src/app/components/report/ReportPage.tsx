"use client";

import React, { useState, useRef, useCallback } from 'react';
import { initialReportState, ReportState } from '@/lib/report-data';
import ReportHeader from './ReportHeader';
import MetaBar from './MetaBar';
import ActionBar from './ActionBar';
import ConclusionSection from './ConclusionSection';
import { PlusCircle, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomSection from './CustomSection';

const componentMap = {
  conclusion: ConclusionSection,
  custom: CustomSection,
};

const createNewSection = (id: string) => ({
  id: id,
  component: 'custom',
  props: { id: id, layout: 'separate' }, // Defaulting to the flexible 'separate' layout
  isDeletable: true,
});

const initialSections: { id: string; component: string; props: any; isDeletable: boolean }[] = [
  createNewSection('custom-initial')
];

export default function ReportPage() {
  const [reportData, setReportData] = useState<ReportState>(() => ({
    ...initialReportState,
    'custom-initial-title': "Section Title",
    'custom-initial': [],
  }));
  const [sections, setSections] = useState(initialSections);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const draggedItemId = useRef<string | null>(null);

  const updateField = useCallback((key: string, value: any) => {
    setReportData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all fields and images? This action cannot be undone.')) {
        const newInitialSectionId = `custom-${Date.now()}`;
        const newInitialSection = createNewSection(newInitialSectionId);
        setReportData({
            ...initialReportState,
            [`${newInitialSectionId}-title`]: "Section Title",
            [newInitialSectionId]: [],
        });
        setSections([newInitialSection]);
    }
  }, []);

  const addSection = () => {
    const newSectionId = `custom-${Date.now()}`;
    const newSection = createNewSection(newSectionId);
    
    setSections(prev => [...prev, newSection]);

    // Initialize data for the new section
    setReportData(prev => ({
        ...prev,
        [`${newSectionId}-title`]: "New Section Title",
        [newSectionId]: [],
    }));
  };

  const deleteSection = (idToDelete: string) => {
    if (window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      setSections(sections => sections.filter(s => s.id !== idToDelete));
      // Note: Data associated with the section remains in reportData but becomes orphaned.
      // This is generally fine, but for a production app, you might want to clean it up.
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    draggedItemId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (draggedItemId.current === null || draggedItemId.current === targetId) {
      return;
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedItemId.current);
    const targetIndex = sections.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedItem);
    
    setSections(newSections);
    draggedItemId.current = null;
  };
  
  // Ensure Conclusion section is always at the end
  const conclusionSection = sections.find(s => s.component === 'conclusion');
  const customSections = sections.filter(s => s.component !== 'conclusion');

  const renderSection = (section: { id: string; component: string; props: any; isDeletable: boolean; }) => {
    const Component = componentMap[section.component as keyof typeof componentMap];
    if (!Component) return null;

    return (
        <div 
        key={section.id}
        draggable
        onDragStart={(e) => handleDragStart(e, section.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section.id)}
        className="draggable-section relative group/section"
        >
        <div className="drag-handle">
            <GripVertical size={20} />
        </div>

        {section.isDeletable && (
            <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 z-10 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover/section:opacity-100 transition-opacity"
            onClick={() => deleteSection(section.id)}
            aria-label="Delete section"
            >
                <Trash2 size={16}/>
            </Button>
        )}

        <Component 
            data={reportData} 
            updateField={updateField}
            {...section.props}
        />
        </div>
    );
  }

  return (
    <>
      <ActionBar onReset={handleReset} reportRef={reportContainerRef} />
      <div className="report-container" ref={reportContainerRef}>
        <ReportHeader data={reportData} updateField={updateField} />
        <MetaBar data={reportData} updateField={updateField} />
        
        <div className='report-body'>
            {customSections.map(renderSection)}
            {conclusionSection && renderSection(conclusionSection)}
        </div>

        <div className="p-5 flex justify-center border-t">
             <Button variant="outline" className="w-full md:w-auto" onClick={addSection}>
                <PlusCircle className="mr-2"/>
                Add Section
            </Button>
        </div>

        <footer className="report-footer">
          Energy Bill Audit Report generated by Energy Audit Pro.
        </footer>
      </div>
    </>
  );
}
