"use client";

import React from 'react';
import EditableField from './EditableField';
import { ReportState } from '@/lib/report-data';
import ImageSlot from './ImageSlot';

type MetaBarProps = {
  data: ReportState;
  updateField: (id: string, value: string) => void;
};

const MetaItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="item">
    <b className="label">{label}:</b>
    <div className='value-col'>
      {children}
    </div>
  </div>
);

export default function MetaBar({ data, updateField }: MetaBarProps) {
  return (
    <div className="meta-bar">
        <div className='logo-col'>
            <ImageSlot 
                id="logo"
                src={data.logo}
                onUpload={updateField}
                className="!min-h-[60px] h-full"
                hint="Upload Logo"
            />
        </div>
        <div className='details-col'>
            <MetaItem label="Consumer">
                <EditableField id="consumer" value={data.consumer} onChange={updateField} />
            </MetaItem>
            <MetaItem label="Report Type">
                <EditableField id="reportType" value={data.reportType} onChange={updateField} />
            </MetaItem>
            <MetaItem label="Generated">
                {data.generatedDate}
            </MetaItem>
             <MetaItem label="Prepared by">
                <EditableField id="preparedBy" value={data.preparedBy} onChange={updateField} />
            </MetaItem>
        </div>
    </div>
  );
}
