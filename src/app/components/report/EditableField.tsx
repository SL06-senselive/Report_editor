

"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useLayoutEffect } from "react";

type EditableFieldProps = {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  type?: "text" | "textarea" | "richtext";
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  disabled?: boolean;
  placeholder?: string;
};

const EditableField: React.FC<EditableFieldProps> = ({
  id,
  value,
  onChange,
  type = "text",
  className,
  tag = "div",
  disabled = false,
  
}) => {
  const ref = useRef<any>(null);

  const isContentEditable = type === "richtext";
   

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    if (disabled) return;
    const newValue = e.currentTarget.innerHTML;
    if (value !== newValue) {
      onChange(id, newValue);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (disabled) return;
    onChange(id, e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (type === "textarea" && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, type]);

  // Prevent cursor jumping
  useLayoutEffect(() => {
    if (ref.current && isContentEditable) {
      if (ref.current.innerHTML !== value) {
        ref.current.innerHTML = value;
      }
    }
  }, [value, isContentEditable]);

  // Paste as plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (ref.current && ref.current.isContentEditable) {
      document.execCommand("insertText", false, text);
    }
  };

  // Apply formatting
  const applyFormat = (command: string, value?: string) => {
    if (disabled) return;
     if (!ref.current) return;
      ref.current.focus(); 
    document.execCommand(command, false, value);
    // Trigger onChange after formatting
    onChange(id, ref.current.innerHTML);
  };
    
  if (isContentEditable) {
    const Component = tag as React.ElementType;
    return (
      <div className="editable-container">
        {/* Toolbar */}
        <div className="format-buttons mb-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => applyFormat("bold")} className="font-bold px-2 py-1 border rounded">
            B
          </button>
          <button type="button" onClick={() => applyFormat("italic")} className="italic px-2 py-1 border rounded">
            I
          </button>
          <button type="button" onClick={() => applyFormat("underline")} className="underline px-2 py-1 border rounded">
            U
          </button>

          {/* Font size selector */}
          <select onChange={(e) => applyFormat("fontSize", e.target.value)} className="border rounded px-2 py-1">
            <option value="">Size</option>
            <option value="1">1 (8pt)</option>
            <option value="2">2 (10pt)</option>
            <option value="3">3 (12pt)</option>
            <option value="4">4 (14pt)</option>
            <option value="5">5 (18pt)</option>
            <option value="6">6 (24pt)</option>
            <option value="7">7 (36pt)</option>
          </select>

          {/* Font color */}
          <input
            type="color"
            onChange={(e) => applyFormat("foreColor", e.target.value)}
            className="w-8 h-8 p-0 border rounded"
            title="Text Color"
          />

          {/* Background highlight */}
          {/* <input
            type="color"
            onChange={(e) => applyFormat("hiliteColor", e.target.value)}
            className="w-8 h-8 p-0 border rounded"
            title="Highlight Color"
          /> */}
        </div>

        {/* Editable area */}
        {/* <Component
          ref={ref}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className={cn(
            "editable-field border p-2 rounded min-h-[50px]",
            disabled && "cursor-not-allowed",
            className
          )}
          placeholder={placeholder}
        /> */}
        <Component
  ref={ref}
  contentEditable={!disabled}
  suppressContentEditableWarning
  onInput={handleInput}
  onPaste={handlePaste}
  className={cn(
    "editable-field border p-2 rounded min-h-[50px] w-fit inline-block",
    disabled && "cursor-not-allowed",
    className
  )}

/>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={handleTextChange}
        onPaste={handlePaste}
        className={cn("editable-field resize-none overflow-hidden border p-2 rounded", className)}
        rows={1}
        disabled={disabled}
      
      />
    );
  }

  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onChange={handleTextChange}
      onPaste={handlePaste}
      className={cn("editable-field border p-2 rounded", className)}
      disabled={disabled}
      
    />
  );
};

export default React.memo(EditableField);

