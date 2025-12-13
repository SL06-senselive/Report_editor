"use client";

import React from 'react';
import EditableField from './EditableField';
import { cn } from '@/lib/utils';

type KpiCardProps = {
  titleId: string;
  title: string;
  valueId: string;
  value: string;
  hintId: string;
  hint: string;
  valueStatus?: 'good' | 'bad';
  updateField: (id: string, value: string) => void;
  isTitleEditable?: boolean;
};
const KpiCard: React.FC<KpiCardProps> = ({
  titleId,
  title,
  valueId,
  value,
  hintId,
  hint,
  valueStatus,
  updateField,
  isTitleEditable = true
}) => {
  
  return (
    <div className="kpi">
      <div className="title">
        {isTitleEditable ? (
          <EditableField id={titleId} value={title} onChange={updateField} />
        ) : (
          title
        )}
      </div>
      <div className={cn("value", valueStatus)}>
        <EditableField id={valueId} value={value} onChange={updateField} />
      </div>
      <div className="hint">
        <EditableField id={hintId} value={hint} onChange={updateField} />
      </div>
    </div>
  );
};                    
export default KpiCard;
