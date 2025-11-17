"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus, Text, Trash2, Palette, CaseSensitive } from 'lucide-react';
import DraggableText, { Overlay } from './DraggableText';
import OverlayEditor from './OverlayEditor';

type ImageComposerProps = {
  imageData: string | null;
  overlays: Overlay[];
  onImageChange: (src: string | null) => void;
  onOverlaysChange: (overlays: Overlay[]) => void;
}

export default function ImageComposer({ imageData, overlays, onImageChange, onOverlaysChange }: ImageComposerProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onImageChange(ev.target?.result as string);
      onOverlaysChange([]); // Reset overlays on new image
      setSelectedId(null);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  const addTextOverlay = () => {
    const id = Date.now();
    const newOverlay: Overlay = { id, text: 'New Text', color: '#000000', size: 24, x: 50, y: 50, bold: false, italic: false };
    onOverlaysChange([...overlays, newOverlay]);
    setSelectedId(id);
  };

  const updateOverlay = useCallback((id: number, changes: Partial<Overlay>) => {
    onOverlaysChange(overlays.map(o => (o.id === id ? { ...o, ...changes } : o)));
  }, [overlays, onOverlaysChange]);

  const deleteOverlay = (id: number) => {
    onOverlaysChange(overlays.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDrag = useCallback((id: number, dx: number, dy: number) => {
    onOverlaysChange(overlays.map(o => (o.id === id ? { ...o, x: o.x + dx, y: o.y + dy } : o)));
  }, [overlays, onOverlaysChange]);

  const selectedOverlay = overlays.find(o => o.id === selectedId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
      <div className="flex flex-col gap-3 border p-4 rounded-lg">
        <h4 className="font-semibold">Composer Tools</h4>
        <Label htmlFor="composer-image-upload" className="w-full">
          <Button asChild className="w-full">
            <span><ImagePlus className="mr-2"/> Upload Image</span>
          </Button>
          <input id="composer-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </Label>
        <Button onClick={addTextOverlay} disabled={!imageData} variant="secondary">
          <Text className="mr-2"/> Add Text
        </Button>
        {selectedOverlay && (
          <OverlayEditor
            overlay={selectedOverlay}
            onChange={(changes) => updateOverlay(selectedId!, changes)}
            onDelete={() => deleteOverlay(selectedId!)}
          />
        )}
        {!selectedOverlay && imageData && (
          <p className="text-sm text-muted-foreground mt-2">Click on a text overlay to edit its properties.</p>
        )}
      </div>

      <div 
        ref={containerRef} 
        className="relative min-h-[460px] bg-primary/5 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center overflow-hidden"
        onClick={(e) => { if (e.target === containerRef.current) setSelectedId(null); }}
      >
        {imageData ? (
          <Image src={imageData} alt="Composer background" fill style={{ objectFit: 'contain' }} />
        ) : (
          <div className="text-muted-foreground">Upload an image to start composing</div>
        )}
        {overlays.map(overlay => (
          <DraggableText
            key={overlay.id}
            overlay={overlay}
            isSelected={selectedId === overlay.id}
            onSelect={() => setSelectedId(overlay.id)}
            onDrag={(dx, dy) => handleDrag(overlay.id, dx, dy)}
          />
        ))}
      </div>
    </div>
  );
}
