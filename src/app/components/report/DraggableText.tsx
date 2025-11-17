"use client";

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export type Overlay = {
  id: number;
  text: string;
  color: string;
  size: number;
  x: number;
  y: number;
  bold: boolean;
  italic: boolean;
};

type DraggableTextProps = {
  overlay: Overlay;
  isSelected: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
};

export default function DraggableText({ overlay, isSelected, onSelect, onDrag, containerRef }: DraggableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({ isDragging: false, startX: 0, startY: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    dragInfo.current = { isDragging: true, startX: e.clientX, startY: e.clientY };
    onSelect();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragInfo.current.isDragging) return;
      const dx = moveEvent.clientX - dragInfo.current.startX;
      const dy = moveEvent.clientY - dragInfo.current.startY;
      dragInfo.current.startX = moveEvent.clientX;
      dragInfo.current.startY = moveEvent.clientY;
      onDrag(dx, dy);
    };

    const handleMouseUp = () => {
      dragInfo.current.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: `${overlay.x}px`,
        top: `${overlay.y}px`,
        color: overlay.color,
        fontSize: `${overlay.size}px`,
        fontWeight: overlay.bold ? 'bold' : 'normal',
        fontStyle: overlay.italic ? 'italic' : 'normal',
        cursor: 'move',
        userSelect: 'none',
        whiteSpace: 'pre',
      }}
      className={cn(
        "transition-all duration-100",
        isSelected ? 'p-1 border border-dashed border-primary bg-white/50' : 'p-1 border border-transparent'
      )}
      onMouseDown={onMouseDown}
      data-hide-print="true"
    >
      {overlay.text}
    </div>
  );
}
