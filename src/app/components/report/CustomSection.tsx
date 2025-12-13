
"use client";

import React, { useRef } from "react";
import { ReportState } from "@/lib/report-data";
import EditableField from "./EditableField";
import ImageSlot from "./ImageSlot";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Trash2,
  GripVertical,
  Columns,
  Image as ImageIcon,
  Pilcrow,
  Table,
  Heading3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* -----------------------
   Block types & helpers
   ----------------------- */

export type Block = {
  id: string;
  type: "text" | "image_grid" | "table" | "layout" | "subheader";
  content?: string;
  images?: { id: string; src: string | null; caption: string }[];
  gridColumns?: number;
  placeholder?: string; 
  tableData?: string[][];
  layout?: "1-col" | "2-col" | "3-col";
  children?: Block[][];
};


const createId = (prefix = "block") => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const createNewBlock = (type: Block["type"]): Block => {
  const id = createId();
  switch (type) {
    case "text":
      return { id, type: "text", content: "Enter your text here...",   };
    case "subheader":
      return { id, type: "subheader", content: "Enter your text here... " , placeholder: "Enter your text here..."  };
    case "image_grid":
      return { id, type: "image_grid", images: [{ id: createId("img"), src: null, caption: "" }], gridColumns: 1 };
    case "table":
      return { id, type: "table", tableData: [["Header 1", "Header 2"], ["Data 1", "Data 2"]] };
    case "layout":
      return { id, type: "layout", layout: "2-col", children: [[], []] };
    default:
      throw new Error("Unknown block type");
  } 
};

/* 
  Recursively find the parent array and index for a block id.
  Returns { parentArray, index } where parentArray is an actual array reference (inside a cloned root),
  or null if not found.
*/
const findParentArrayAndIndex = (blocks: Block[], targetId: string): { parentArray: Block[]; index: number } | null => {
  const stack: { arr: Block[] }[] = [{ arr: blocks }];

  // helper recursion:
  const helper = (arr: Block[]): { parentArray: Block[]; index: number } | null => {
    for (let i = 0; i < arr.length; i++) {
      const b = arr[i];
      if (b.id === targetId) return { parentArray: arr, index: i };
      if (b.type === "layout" && b.children) {
        for (let col = 0; col < b.children.length; col++) {
          const res = helper(b.children[col]);
          if (res) return res;
        }
      }
    }
    return null;
  };
       
  return helper(blocks);
};

/* Safely deep-clone blocks */
const cloneBlocks = (b: Block[]) => JSON.parse(JSON.stringify(b)) as Block[];

/* -----------------------
   Child components
   ----------------------- */

type BlockContainerProps = {
  children: React.ReactNode;
  block: Block;
  isLocked: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDropOnBlock: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
  onDelete: (id: string) => void;
  className?: string;
};

const BlockContainer: React.FC<BlockContainerProps> = ({ children, block, isLocked, onDragStart, onDropOnBlock, onDelete, className }) => {
  return (
    <div
      className={cn("block-container relative group/block my-3", className)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDropOnBlock(e, block.id)}
      data-block-id={block.id}
    >
      {!isLocked && (
        <div className="block-toolbar" onMouseDown={(e) => e.stopPropagation()}>
          <div
            className="drag-handle-block"
            draggable
            onDragStart={(e) => onDragStart(e, block.id)}
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </div>
          <Button size="icon" variant="ghost" className="delete-handle-block" onClick={() => onDelete(block.id)} title="Delete block">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
      {children}
    </div>
  );
};

type AddBlockButtonProps = {
  parentId?: string;
  colIndex?: number;
  isLocked: boolean;
  addBlock: (type: Block["type"], parentId?: string, colIndex?: number) => void;
};

const AddBlockButton: React.FC<AddBlockButtonProps> = ({ parentId, colIndex, isLocked, addBlock }) => {
  if (isLocked) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full my-2 add-block-btn">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => addBlock("text", parentId, colIndex)}>
          <Pilcrow className="mr-2 h-4 w-4" /> Text
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addBlock("subheader", parentId, colIndex)}>
          <Heading3 className="mr-2 h-4 w-4" /> Subheader
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addBlock("image_grid", parentId, colIndex)}>
          <ImageIcon className="mr-2 h-4 w-4" /> Image Grid
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addBlock("table", parentId, colIndex)}>
          <Table className="mr-2 h-4 w-4" /> Table
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => addBlock("layout", parentId, colIndex)}>
          <Columns className="mr-2 h-4 w-4" /> Columns (Layout)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* -----------------------
   BlockRenderer
   ----------------------- */

type BlockRendererProps = {
  block: Block;
  isLocked: boolean;
  updateBlock: (id: string, patch: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  addBlock: (type: Block["type"], parentId?: string, colIndex?: number) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  handleDropOnBlock: (e: React.DragEvent<HTMLDivElement>, targetId: string) => void;
};

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  isLocked,
  updateBlock,
  deleteBlock,
  addBlock,
  handleDragStart,
  handleDropOnBlock,
}) => {
  switch (block.type) {
    case "text":
      return (
        <BlockContainer block={block} isLocked={isLocked} onDragStart={handleDragStart} onDropOnBlock={handleDropOnBlock} onDelete={deleteBlock}>
          <div className="p-3 border rounded-lg bg-secondary/20">
            <EditableField
              id={`${block.id}-content`}
              value={block.content || ""}
              onChange={(_, value) => updateBlock(block.id, { content: value })}
                placeholder={block.placeholder}  // <-- ADD THIS
              type="richtext"
              className="min-h-[120px]"
              disabled={isLocked}
            />
          </div>
        </BlockContainer>
      );
    case "subheader":
      return (
        <BlockContainer block={block} isLocked={isLocked} onDragStart={handleDragStart} onDropOnBlock={handleDropOnBlock} onDelete={deleteBlock} className="my-2">
          <EditableField
            id={`${block.id}-content`}
            value={block.content || ""}
            onChange={(_, value) => updateBlock(block.id, { content: value })}
              placeholder={block.placeholder}  // <-- ADD THIS
            type="text"
            tag="h3"
            className="!text-base !font-semibold text-primary/90"
            disabled={isLocked}
          />
        </BlockContainer>
      );
    case "image_grid":
      return (
        <BlockContainer block={block} isLocked={isLocked} onDragStart={handleDragStart} onDropOnBlock={handleDropOnBlock} onDelete={deleteBlock}>
          <div className="p-3 border rounded-lg">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.gridColumns || 1}, 1fr)` }}>
              {(block.images || []).map((img, index) => (
                <div key={img.id} className="relative group/image  w-full h-[500] flex items-center justify-center bg-gray-100 overflow-hidden rounded-lg">
                  <ImageSlot
                    id={img.id}
                    src={img.src}
                    onUpload={(_, src) => {
                      const newImages = [...(block.images || [])];
                      newImages[index].src = src;
                      updateBlock(block.id, { images: newImages });
                    }}
                    className="w-full h-full object-cover"
                     //className="w-full h-auto object-contain print-image"
                    disabled={isLocked}
                  />
                  {!isLocked && block.images && block.images.length > 1 && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/image:opacity-100"
                      onClick={() => {
                        const newImages = (block.images || []).filter((i) => i.id !== img.id);
                        updateBlock(block.id, { images: newImages });
                      }}
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  {!isLocked && (
                    <div className="p-1 pt-2">
                      <EditableField
                        id={`${img.id}-caption`}
                        value={img.caption || ""}
                        onChange={(_, value) => {
                          const newImages = [...(block.images || [])];
                          newImages[index].caption = value;
                          updateBlock(block.id, { images: newImages });
                        }}
                        type="text"
                        className="w-full text-xs text-center text-muted-foreground italic"
                        placeholder="Add a caption..."
                        disabled={isLocked}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!isLocked && (
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newImages = [...(block.images || []), { id: createId("img"), src: null, caption: "" }];
                    updateBlock(block.id, { images: newImages });
                  }}
                >
                  <PlusCircle size={14} className="mr-2" />
                  Add Image
                </Button>

                {block.images && block.images.length > 1 && (
                  <>
                    <label className="text-sm ml-auto">Cols:</label>
                    <select
                      value={block.gridColumns}
                      onChange={(e) => updateBlock(block.id, { gridColumns: parseInt(e.target.value || "1") })}
                      className="border rounded-md px-2 py-1 text-sm bg-background"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </>
                )}
              </div>
            )}
          </div>
        </BlockContainer>
      );
    case "table": {
      const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newTableData = JSON.parse(JSON.stringify(block.tableData || []));
        newTableData[rowIndex][colIndex] = value;
        updateBlock(block.id, { tableData: newTableData });
      };
      const addRow = () => {
        const newTableData = JSON.parse(JSON.stringify(block.tableData || []));
        const numCols = newTableData[0]?.length || 1;
        newTableData.push(Array(numCols).fill(""));
        updateBlock(block.id, { tableData: newTableData });
      };
      const addCol = () => {
        const newTableData = JSON.parse(JSON.stringify(block.tableData || []));
        newTableData.forEach((row: string[]) => row.push(""));
        updateBlock(block.id, { tableData: newTableData });
      };
      const removeRow = (rowIndex: number) => {
        if ((block.tableData || []).length <= 1) return;
        const newTableData = (block.tableData || []).filter((_, i) => i !== rowIndex);
        updateBlock(block.id, { tableData: newTableData });
      };
      const removeCol = (colIndex: number) => {
        if ((block.tableData || [])[0]?.length <= 1) return;
        const newTableData = (block.tableData || []).map((row) => row.filter((_, i) => i !== colIndex));
        updateBlock(block.id, { tableData: newTableData });
      };

      return (
        <BlockContainer block={block} isLocked={isLocked} onDragStart={handleDragStart} onDropOnBlock={handleDropOnBlock} onDelete={deleteBlock}>
          <div className="p-3 border rounded-lg overflow-x-auto">
            <table className="w-full border-collapse editable-table">
              <tbody>
                {(block.tableData || []).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        contentEditable={!isLocked}
                        suppressContentEditableWarning
                        onBlur={(e) => updateCell(rowIndex, colIndex, e.currentTarget.innerText || "")}
                        className="border p-2 min-w-[100px]"
                      >
                        {cell}
                      </td>
                    ))}
                    {!isLocked && (
                      <td className="p-1 border-l-0 border-transparent">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => removeRow(rowIndex)} title="Remove row">
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLocked && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Button onClick={addRow} variant="ghost" size="sm">
                  <PlusCircle size={14} className="mr-1" />
                  Row
                </Button>
                <Button onClick={addCol} variant="ghost" size="sm">
                  <PlusCircle size={14} className="mr-1" />
                  Col
                </Button>
                {(block.tableData || [])[0]?.map((_, colIndex) => (
                  <Button key={colIndex} onClick={() => removeCol(colIndex)} variant="ghost" size="icon" className="h-6 w-6 ml-auto first:ml-auto text-muted-foreground" title="Remove column">
                    <Trash2 size={14} />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </BlockContainer>
      );
    }
    case "layout": {
      const columnClass = { "1-col": "grid-cols-1", "2-col": "grid-cols-2", "3-col": "grid-cols-3" }[block.layout || "1-col"];
      return (
        <BlockContainer block={block} isLocked={isLocked} onDragStart={handleDragStart} onDropOnBlock={handleDropOnBlock} onDelete={deleteBlock}>
          <div className="p-3 border rounded-lg bg-primary/5">
            {!isLocked && (
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Columns:</label>
                <select
                  value={block.layout}
                  onChange={(e) => {
                    const newLayout = e.target.value as "1-col" | "2-col" | "3-col";
                    const numCols = { "1-col": 1, "2-col": 2, "3-col": 3 }[newLayout];
                    // ensure children length
                    const newChildren = Array.from({ length: numCols }, (_, i) => block.children?.[i] || []);
                    updateBlock(block.id, { layout: newLayout, children: newChildren });
                  }}
                  className="border rounded-md px-2 py-1 text-sm bg-background"
                >
                  <option value="1-col">1</option>
                  <option value="2-col">2</option>
                  <option value="3-col">3</option>
                </select>
              </div>
            )}

            <div className={cn("grid gap-4", columnClass)}>
              {(block.children || []).map((colBlocks, colIndex) => (
                <div
                  key={colIndex}
                  className="flex flex-col min-h-[100px] p-1 break-words whitespace-normal min-w-0"
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    // drop on empty column - we'll handle outside by reading dragged id and inserting to this column end
                    e.preventDefault();
                    const dragId = e.dataTransfer.getData("text/plain");
                    // We handle drop via parent drop handler in CustomSection
                    // store a special attribute so parent can find intended column (we handle here by bubbling)
                  }}
                >
                  {colBlocks.map((childBlock, blockIndex) => (
                    <BlockRenderer
                      key={childBlock.id}
                      block={childBlock}
                      isLocked={isLocked}
                      updateBlock={updateBlock}
                      deleteBlock={deleteBlock}
                      addBlock={addBlock}
                      handleDragStart={handleDragStart}
                      handleDropOnBlock={handleDropOnBlock}
                    />
                  ))}
                  <AddBlockButton parentId={block.id} colIndex={colIndex} isLocked={isLocked} addBlock={addBlock} />
                </div>
              ))}
            </div>
          </div>
        </BlockContainer>
      );
    }
    default:
      return <div>Unknown block</div>;
  }
};

/* -----------------------
   Main component
   ----------------------- */

type CustomSectionProps = {
  id: string;
  data: ReportState;
  updateField: (id: string, value: any) => void;
  isLocked: boolean;
};

export default function CustomSection({ id: sectionId, data, updateField, isLocked }: CustomSectionProps) {
  const sectionTitleKey = `${sectionId}-title`;
  const blocks: Block[] = (data[sectionId] as Block[]) || [];

  const draggedBlockId = useRef<string | null>(null);

  const updateBlocks = (newBlocks: Block[]) => {
    updateField(sectionId, newBlocks);
  };

  const updateBlock = (blockId: string, patch: Partial<Block>) => {
    if (isLocked) return;
    const newBlocks = cloneBlocks(blocks);
    const found = findParentArrayAndIndex(newBlocks, blockId);
    if (!found) return;
    found.parentArray[found.index] = { ...found.parentArray[found.index], ...patch };
    updateBlocks(newBlocks);
  };

  const deleteBlock = (blockId: string) => {
    if (isLocked) return;
    if (!window.confirm("Are you sure you want to delete this block?")) return;
    const newBlocks = cloneBlocks(blocks);
    const found = findParentArrayAndIndex(newBlocks, blockId);
    if (!found) return;
    found.parentArray.splice(found.index, 1);
    updateBlocks(newBlocks);
  };

  const addBlock = (type: Block["type"], parentId?: string, colIndex?: number) => {
    if (isLocked) return;
    const newBlock = createNewBlock(type);
    const newBlocks = cloneBlocks(blocks);

    if (!parentId) {
      // top-level append
      newBlocks.push(newBlock);
      updateBlocks(newBlocks);
      return;
    }

    // try find parent block
    const parentFound = findParentArrayAndIndex(newBlocks, parentId);
    if (parentFound && parentFound.parentArray[parentFound.index].type === "layout") {
      // parentFound identifies the layout block index; get layout block reference
      const layoutBlock = parentFound.parentArray[parentFound.index] as Block;
      if (layoutBlock.type === "layout") {
        // ensure children exist
        layoutBlock.children = layoutBlock.children || [[]];
        const ci = typeof colIndex === "number" && colIndex >= 0 && colIndex < layoutBlock.children.length ? colIndex : 0;
        layoutBlock.children[ci].push(newBlock);
        updateBlocks(newBlocks);
        return;
      }
    }

    // fallback: append to top-level
    newBlocks.push(newBlock);
    updateBlocks(newBlocks);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (isLocked) return;
    draggedBlockId.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDropOnBlock = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    if (isLocked) return;
    e.preventDefault();
    const dragId = e.dataTransfer.getData("text/plain") || draggedBlockId.current;
    if (!dragId || dragId === targetId) return;

    const newBlocks = cloneBlocks(blocks);
    const source = findParentArrayAndIndex(newBlocks, dragId);
    const target = findParentArrayAndIndex(newBlocks, targetId);

    if (!source || !target) return;

    // Remove source
    const [moved] = source.parentArray.splice(source.index, 1);
    // If source parent was before target parent and they are the same array and source index < target index,
    // adjust target index because array has shifted after removal
    let insertIndex = target.index;
    if (source.parentArray === target.parentArray && source.index < target.index) {
      insertIndex = target.index - 1;
    }
    // Insert before target
    target.parentArray.splice(insertIndex, 0, moved);

    updateBlocks(newBlocks);
    draggedBlockId.current = null;
  };

  // allow dropping on empty area (append)
  const handleDropOnContainer = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLocked) return;
    e.preventDefault();
    const dragId = e.dataTransfer.getData("text/plain") || draggedBlockId.current;
    if (!dragId) return;
    const newBlocks = cloneBlocks(blocks);
    const source = findParentArrayAndIndex(newBlocks, dragId);
    if (!source) return;
    const [moved] = source.parentArray.splice(source.index, 1);
    newBlocks.push(moved);
    updateBlocks(newBlocks);
    draggedBlockId.current = null;
  };

  return (
    <div className="report-section" id={sectionId}>
      <EditableField id={sectionTitleKey} value={(data as any)[sectionTitleKey] || ""} onChange={updateField} className="mb-3" tag="h2" disabled={isLocked} />

      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnContainer}>
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            isLocked={isLocked}
            updateBlock={updateBlock}
            deleteBlock={deleteBlock}
            addBlock={addBlock}
            handleDragStart={handleDragStart}
            handleDropOnBlock={handleDropOnBlock}
          />
        ))}
      </div>

      <AddBlockButton isLocked={isLocked} addBlock={addBlock} />

      {/* Inline styles for handles */}
      {typeof window !== "undefined" && (() => {
        const styleId = "custom-section-styles";
        if (!document.getElementById(styleId)) {
          const styleSheet = document.createElement("style");
          styleSheet.id = styleId;
          styleSheet.innerText = `
            .block-toolbar {
              position: absolute;
              top: -10px;
              right: 8px;
              z-index: 10;
              opacity: 0;
              transition: opacity 0.18s ease, transform 0.18s ease;
              transform: translateY(4px);
              display: flex;
              align-items: center;
              gap: 6px;
              background-color: var(--background);
              border: 1px solid var(--border);
              border-radius: 8px;
              padding: 4px;
              box-shadow: 0 6px 18px rgba(0,0,0,0.06);
            }
            .block-container:hover .block-toolbar {
              opacity: 1;
              transform: translateY(0);
            }
            .block-toolbar .drag-handle-block {
              cursor: move;
              color: var(--muted-foreground);
              padding: 4px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .block-toolbar .drag-handle-block:hover {
              color: var(--foreground);
            }
            .block-toolbar .delete-handle-block {
              height: 1.75rem;
              width: 1.75rem;
              color: var(--muted-foreground);
            }
            .block-toolbar .delete-handle-block:hover {
              background-color: rgba(220,38,38,0.06);
              color: rgb(220,38,38);
            }
            .editable-table td {
              outline: none;
            }
            .editable-table td:focus {
              background-color: rgba(59,130,246,0.06);
            }
          `;
          document.head.appendChild(styleSheet);
        }
        return null;
      })()}
    </div>
  );
}
