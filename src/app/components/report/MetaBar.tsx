"use client";

import React from 'react';
import EditableField from './EditableField';
import { ReportState } from '@/lib/report-data';

type MetaBarProps = {
  data: ReportState;
  updateField: (id: string, value: string) => void;
};

const MetaItem = ({ label, id, value, onChange }: { label: string, id: string, value: string, onChange: (id: string, value: string) => void }) => (
  <div className="item">
    <b className="label">{label}:</b>
    <EditableField id={id} value={value} onChange={onChange} />
  </div>
);

export default function MetaBar({ data, updateField }: MetaBarProps) {
  return (
    <div className="meta-bar">
      <MetaItem label="Consumer" id="consumer" value={data.consumer} onChange={updateField} />
      <MetaItem label="Report Type" id="reportType" value={data.reportType} onChange={updateField} />
      <MetaItem label="Generated" id="generatedDate" value={data.generatedDate} onChange={updateField} />
      <MetaItem label="Prepared by" id="preparedBy" value={data.preparedBy} onChange={updateField} />
    </div>
  );
}
