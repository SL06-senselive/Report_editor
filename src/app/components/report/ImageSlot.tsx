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
  disabled?: boolean;
};

export default function ImageSlot({ id, src, onUpload, className, hint = "Drop image here or click Upload", disabled = false }: ImageSlotProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (disabled) return;
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
  }, [id, onUpload, toast, disabled]);
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Only trigger file input if not clicking on a button inside
    if (e.target instanceof HTMLElement && e.target.closest('button')) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUploadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.stopPropagation();
    onUpload(id, null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-[120px] w-full overflow-hidden border rounded-lg flex items-center justify-center", 
         
        className, 
        isDragging && 'drag-over', 
        !src && !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed bg-secondary/50'
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={handleClick}
    >
      <input
        type="file"
      
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      {src ? (
        <Image src={src} alt={`Chart for ${id}`} fill style={{ objectFit: 'cover' }}  />
      ) : (
        <div className="text-center text-muted-foreground text-sm p-4  flex items-center justify-center object-cover h-full">
          {hint}
        </div>
      )}
      {/* {src ? (
  <img
    src={src}
    alt={`Image ${id}`}
    style={{
      width: "100%",
       height: "100%",
      display: "block",
      objectFit: "contain"
    }}
  />
) : (
  <div className="text-center text-muted-foreground text-sm p-4  flex items-center justify-center h-full">
    {hint}
  </div>
)} */}

      
      {!disabled && (
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
      )}
    </div>
  );
}


