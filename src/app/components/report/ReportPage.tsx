"use client";

import React, { useState, useRef, useCallback } from 'react';
import { initialReportState, ReportState } from '@/lib/report-data';
import ReportHeader from './ReportHeader';
import MetaBar from './MetaBar';
import ActionBar from './ActionBar';
import ConclusionSection from './ConclusionSection';
import { PlusCircle, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CustomSection, { Block } from './CustomSection';

const componentMap = {
  conclusion: ConclusionSection,
  custom: CustomSection,
};

const createNewSection = (id: string, title: string): { id: string; component: string; props: any; isDeletable: boolean } => ({
  id: id,
  component: 'custom',
  props: { id: id },
  isDeletable: true,
});

const initialSections: { id: string; component: string; props: any; isDeletable: boolean }[] = [
  createNewSection('custom-initial', "Section Title")
];

export default function ReportPage() {
  const [reportData, setReportData] = useState<ReportState>(() => {
      const initialId = 'custom-initial';
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type: 'layout',
        layout: '1-col',
        children: [],
      };
      return {
        ...initialReportState,
        [`${initialId}-title`]: "Your Section Title",
        [initialId]: [newBlock], // Start with one empty layout block
      }
  });

  const [sections, setSections] = useState(initialSections);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const draggedItemId = useRef<string | null>(null);

  const updateField = useCallback((key: string, value: any) => {
    setReportData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all fields and images? This action cannot be undone.')) {
        const newInitialSectionId = `custom-${Date.now()}`;
        const newInitialSection = createNewSection(newInitialSectionId, "Section Title");
         const newBlock: Block = {
          id: `block-${Date.now()}`,
          type: 'layout',
          layout: '1-col',
          children: [],
        };
        setReportData({
            ...initialReportState,
            [`${newInitialSectionId}-title`]: "Section Title",
            [newInitialSectionId]: [newBlock],
        });
        setSections([newInitialSection]);
    }
  }, []);

  const addSection = () => {
    const newSectionId = `custom-${Date.now()}`;
    const newSection = createNewSection(newSectionId, "New Section Title");
    
    setSections(prev => [...prev, newSection]);

    // Initialize data for the new section
     const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: 'layout',
      layout: '1-col',
      children: [],
    };
    setReportData(prev => ({
        ...prev,
        [`${newSectionId}-title`]: "New Section Title",
        [newSectionId]: [newBlock],
    }));
  };

  const deleteSection = (idToDelete: string) => {
    const section = sections.find(s => s.id === idToDelete);
    if (!section || !section.isDeletable) return;

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
  
  const conclusionSection = sections.find(s => s.component === 'conclusion');
  const customSections = sections.filter(s => s.component !== 'conclusion');

  const renderSection = (section: { id: string; component: string; props: any; isDeletable: boolean; }) => {
    const Component = componentMap[section.component as keyof typeof componentMap];
    if (!Component) return null;

    const sectionContent = (
      <Component 
          data={reportData} 
          updateField={updateField}
          {...section.props}
      />
    );

    if (section.id === 'conclusion') {
      return <div key={section.id}>{sectionContent}</div>
    }

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

          {sectionContent}
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

    