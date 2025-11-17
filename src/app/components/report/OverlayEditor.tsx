"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Bold, Italic } from 'lucide-react';
import type { Overlay } from './DraggableText';
import { cn } from '@/lib/utils';

type OverlayEditorProps = {
  overlay: Overlay;
  onChange: (changes: Partial<Overlay>) => void;
  onDelete: () => void;
};

export default function OverlayEditor({ overlay, onChange, onDelete }: OverlayEditorProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background mt-2">
       <h5 className="font-semibold text-sm">Edit Text Overlay</h5>
      <div>
        <Label htmlFor="overlay-text">Text</Label>
        <Textarea
          id="overlay-text"
          value={overlay.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Overlay text"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="overlay-size">Size</Label>
          <Input
            id="overlay-size"
            type="number"
            min={8}
            max={120}
            value={overlay.size}
            onChange={(e) => onChange({ size: parseInt(e.target.value || '8', 10) })}
          />
        </div>
        <div className="flex items-center gap-2">
            <input
                id="overlay-color"
                type="color"
                value={overlay.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"
            />
            <div className='flex items-center border rounded-md'>
                <Button variant="ghost" size="icon" onClick={() => onChange({ bold: !overlay.bold })} className={cn(overlay.bold && "bg-primary/10")}>
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onChange({ italic: !overlay.italic })} className={cn(overlay.italic && "bg-primary/10")}>
                    <Italic className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
      <Button variant="destructive" onClick={onDelete} className="w-full">
        <Trash2 className="mr-2" /> Delete Text
      </Button>
    </div>
  );
}
