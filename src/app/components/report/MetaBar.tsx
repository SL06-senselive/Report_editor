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
  const handleUpload = (id: string, src: string | null) => {
    // If src is null (cleared), set empty string or keep previous value as needed
    updateField(id, src ?? '');
  };
  return (
  
    <div className="meta-bar flex items-start gap-6">
  <div className="logo-col flex items-center justify-center">
    <ImageSlot
      id="logo"
      src={data.logo}
      onUpload={handleUpload}
      className="relative h-[40px] w-[120px]"
      hint="Upload Logo"
    />
  </div>

  
  {/*  <div className="details-col flex flex-col gap-3 w-full">
    <div className="w-full">
      <MetaItem label="Consumer">
        <EditableField id="consumer" value={data.consumer} onChange={updateField} />
      </MetaItem>
    </div>

    <div className="grid grid-cols-2 gap-x-4 w-full">
      <MetaItem label="Report Type">
        <EditableField id="reportType" value={data.reportType} onChange={updateField} />
      </MetaItem>
     

       <MetaItem label="Generated">
      <EditableField
        id="generatedDate"
        value={data.generatedDate}
        onChange={updateField}
      />
    </MetaItem>
    </div>
  </div> */}
  <div className="details-col flex flex-col gap-6 w-full p-4 bg-white rounded-lg shadow-sm">
  {/* Consumer Field */}
  <div className="w-full">
    <MetaItem label="Consumer">
      <EditableField
        id="consumer"
        value={data.consumer}
        onChange={updateField}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </MetaItem>
  </div>

  {/* Report Type & Generated Date */}
  <div className="grid grid-cols-2 gap-6 w-full">
    <MetaItem label="Report Type">
      <EditableField
        id="reportType"
        value={data.reportType}
        onChange={updateField}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </MetaItem>

    <MetaItem label="Generated">
      <EditableField
        id="generatedDate"
        value={data.generatedDate}
        onChange={updateField}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </MetaItem>
  </div>
</div>

</div>

  );
}  

