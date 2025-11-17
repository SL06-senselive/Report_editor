"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ReportState } from '@/lib/report-data';
import EditableField from './EditableField';
import ImageSlot from './ImageSlot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Text, Trash2 } from 'lucide-react';
import DraggableText, { Overlay } from './DraggableText';
import OverlayEditor from './OverlayEditor';

type CustomSectionProps = {
  id: string;
  layout: 'overlay' | 'separate';
  data: ReportState;
  updateField: (id: string, value: any) => void;
  onDelete: () => void;
};

export default function CustomSection({ id, layout, data, updateField, onDelete }: CustomSectionProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const titleId = `${id}-title`;
  const imageId = `${id}-image`;
  const textId = `${id}-text`;
  const overlaysId = `${id}-overlays`;

  const overlays = data[overlaysId] || [];
  
  const addTextOverlay = () => {
    const newOverlay: Overlay = { id: Date.now(), text: 'New Text', color: '#000000', size: 24, x: 50, y: 50, bold: false, italic: false };
    updateField(overlaysId, [...overlays, newOverlay]);
    setSelectedId(newOverlay.id);
  };

  const updateOverlay = useCallback((overlayId: number, changes: Partial<Overlay>) => {
    const newOverlays = overlays.map((o: Overlay) => (o.id === overlayId ? { ...o, ...changes } : o));
    updateField(overlaysId, newOverlays);
  }, [overlays, updateField, overlaysId]);

  const deleteOverlay = (overlayId: number) => {
    updateField(overlaysId, overlays.filter((o: Overlay) => o.id !== overlayId));
    if (selectedId === overlayId) setSelectedId(null);
  };

  const handleDrag = useCallback((overlayId: number, dx: number, dy: number) => {
    const newOverlays = overlays.map((o: Overlay) => (o.id === overlayId ? { ...o, x: o.x + dx, y: o.y + dy } : o));
    updateField(overlaysId, newOverlays);
  }, [overlays, updateField, overlaysId]);

  const selectedOverlay = overlays.find((o: Overlay) => o.id === selectedId);

  return (
    <div className="report-section" id={id}>
      <h2>
        <EditableField id={titleId} value={data[titleId] || ''} onChange={updateField} className="font-bold" />
      </h2>
      <div className="chart-card">
        {layout === 'overlay' ? (
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
            <div className="flex flex-col gap-3 border p-4 rounded-lg">
              <h4 className="font-semibold">Overlay Tools</h4>
               <ImageSlot 
                id={imageId} 
                src={data[imageId]} 
                onUpload={updateField}
                className="!min-h-[150px]"
                hint="Upload background"
              />
              <Button onClick={addTextOverlay} disabled={!data[imageId]} variant="secondary">
                <Text className="mr-2"/> Add Text
              </Button>
              {selectedOverlay && (
                <OverlayEditor
                  overlay={selectedOverlay}
                  onChange={(changes) => updateOverlay(selectedId!, changes)}
                  onDelete={() => deleteOverlay(selectedId!)}
                />
              )}
            </div>

            <div 
              ref={containerRef} 
              className="relative min-h-[400px] bg-primary/5 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center overflow-hidden"
              onClick={(e) => { if (e.target === containerRef.current) setSelectedId(null); }}
            >
              {data[imageId] ? (
                <Image src={data[imageId]} alt="Custom section background" fill style={{ objectFit: 'contain' }} />
              ) : (
                <div className="text-muted-foreground">Upload an image to start</div>
              )}
              {overlays.map((overlay: Overlay) => (
                <DraggableText
                  key={overlay.id}
                  overlay={overlay}
                  isSelected={selectedId === overlay.id}
                  onSelect={() => setSelectedId(overlay.id)}
                  onDrag={(dx, dy) => handleDrag(overlay.id, dx, dy)}
                  containerRef={containerRef}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid-2">
            <ImageSlot 
              id={imageId} 
              src={data[imageId]} 
              onUpload={updateField}
              hint="Upload custom image"
            />
            <div className="remarks h-full">
              <EditableField
                id={textId}
                value={data[textId]}
                onChange={updateField}
                type="richtext"
                className="min-h-[220px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
