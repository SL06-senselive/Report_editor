"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useEffect } from "react";

type EditableFieldProps = {
  id: string;
  value: string;
  onChange: (id: string, value: string) => void;
  type?: "text" | "textarea" | "richtext";
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
};

const EditableField: React.FC<EditableFieldProps> = ({
  id,
  value,
  onChange,
  type = "text",
  className,
  tag = "div",
}) => {
  const ref = useRef<any>(null);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onChange(id, e.currentTarget.innerHTML);
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(id, e.target.value);
  };

  // For auto-resizing textarea
  useEffect(() => {
    if (type === "textarea" && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, type]);

  // Handle paste as plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (type === 'richtext') {
      document.execCommand("insertText", false, text);
    } else if (ref.current) {
      const start = ref.current.selectionStart;
      const end = ref.current.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(id, newValue);
      // Move cursor after pasted text
      setTimeout(() => {
        ref.current.selectionStart = ref.current.selectionEnd = start + text.length;
      }, 0);
    }
  };


  if (type === "richtext") {
    const Component = tag;
    return (
      <Component
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        className={cn("editable-field", className)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  if (type === "textarea") {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={handleTextChange}
        onPaste={handlePaste}
        className={cn("editable-field resize-none overflow-hidden", className)}
        rows={1}
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
      className={cn("editable-field", className)}
    />
  );
};

export default React.memo(EditableField);
