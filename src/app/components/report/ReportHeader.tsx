"use client";

import React from 'react';
import EditableField from './EditableField';
import { ReportState } from '@/lib/report-data';

type ReportHeaderProps = {
  data: ReportState;
  updateField: (id: string, value: string) => void;
};

export default function ReportHeader({ data, updateField }: ReportHeaderProps) {
  return (
    <div className="report-header">
      <div>
        <h1>
          <EditableField id="title" value={data.title} onChange={updateField} className="font-bold" />
        </h1>
        <div style={{ opacity: 0.95 }}>
          <EditableField id="subTitle" value={data.subTitle} onChange={updateField} />
        </div>
      </div>
      <div className="right">
        <div className="tag">
          <EditableField id="clientLocation" value={data.clientLocation} onChange={updateField} />
        </div>
        <div className="tag">
          <EditableField id="period" value={data.period} onChange={updateField} />
        </div>
        <div className="badge">MSEDCL • OA</div>
      </div>
    </div>
  );
}
