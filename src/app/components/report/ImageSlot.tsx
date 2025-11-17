"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ImageSlotProps = {
  id: string;
  src: string | null;
  onUpload: (id: string, src: string | null) => void;
  className?: string;
  hint?: string;
};

export default function ImageSlot({ id, src, onUpload, className, hint = "Drop image here or click Upload" }: ImageSlotProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload(id, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (e.g., PNG, JPG, GIF).",
        variant: "destructive"
      })
    }
  }, [id, onUpload, toast]);
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onUpload(id, null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn("chart-slot", className, isDragging && 'drag-over')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {src ? (
        <Image src={src} alt={`Chart for ${id}`} fill style={{ objectFit: 'contain' }} />
      ) : (
        <div className="text-center text-muted-foreground text-sm p-4">
          {hint}
        </div>
      )}

      <div className="chart-tools opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button size="sm" variant="outline" className="btn bg-background" onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-1" /> Upload
        </Button>
        {src && (
          <Button size="sm" variant="outline" className="btn danger" onClick={handleClear}>
              <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
