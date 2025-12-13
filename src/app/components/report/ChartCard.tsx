"use client";

import React from 'react';
import ImageSlot from './ImageSlot';
import EditableField from './EditableField';

type ChartCardProps = {
  title: string;
  slotId: string;
  imageData: string | null;
  remarksId: string;
  remarksData: string;
  updateField: (id: string, value: any) => void;
  slotClassName?: string;
  slotHint?: string;
};

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  slotId,
  imageData,
  remarksId,
  remarksData,
  updateField,
  slotClassName,
  slotHint
}) => {
  return (
    <div className="chart-card group">
      <h3>{title}</h3>
      <ImageSlot 
        id={slotId} 
        src={imageData} 
        onUpload={updateField}
        className={slotClassName}
        hint={slotHint}
      />
      <div className="remarks">
        <EditableField 
          id={remarksId}
          value={remarksData}
          onChange={updateField}
          type="textarea"
          className="w-full"
        />
      </div>
    </div>
  );
};
export default ChartCard;

