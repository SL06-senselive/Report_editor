"use client";

import React from 'react';
import { ReportState } from '@/lib/report-data';
import ChartCard from './ChartCard';
import ImageSlot from './ImageSlot';
import EditableField from './EditableField';

type SectionProps = {
  data: ReportState;
  updateField: (id: string, value: any) => void;
};

export default function PartBSection({ data, updateField }: SectionProps) {
  return (
    <div className="report-section" id="part-b">
      <h2>🅱️ Part B — Open Access (OA) Bill</h2>

      <div className="chart-card group">
        <h3>OA Energy: Consumption &amp; Charges</h3>
        <div className="subgrid">
          <ImageSlot id="b-oa-consumption" src={data['b-oa-consumption']} onUpload={updateField} hint="Consumption chart" />
          <ImageSlot id="b-oa-charges" src={data['b-oa-charges']} onUpload={updateField} hint="Charges chart" />
        </div>
        <div className="remarks">
          <EditableField id="b-oa-energy-remarks" value={data['b-oa-energy-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>
      
      <div className="chart-card mt-3.5 group">
        <h3>OA Other Charges</h3>
        <div className="subgrid-3">
          <ImageSlot id="b-oa-other1" src={data['b-oa-other1']} onUpload={updateField} hint="Other charge 1" />
          <ImageSlot id="b-oa-other2" src={data['b-oa-other2']} onUpload={updateField} hint="Other charge 2" />
          <ImageSlot id="b-oa-other3" src={data['b-oa-other3']} onUpload={updateField} hint="Other charge 3" />
        </div>
        <div className="remarks">
          <EditableField id="b-oa-other-remarks" value={data['b-oa-other-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>
      
      <div className="chart-card mt-3.5 group">
        <h3>OA Taxes &amp; Duties</h3>
        <div className="subgrid">
          <ImageSlot id="b-oa-tax1" src={data['b-oa-tax1']} onUpload={updateField} hint="Tax/Duty chart 1" />
          <ImageSlot id="b-oa-tax2" src={data['b-oa-tax2']} onUpload={updateField} hint="Tax/Duty chart 2" />
        </div>
        <div className="remarks">
          <EditableField id="b-oa-tax-remarks" value={data['b-oa-tax-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard title="OA Total & Usage Trend" slotId="b-oa-total" imageData={data['b-oa-total']} remarksId="b-oa-total-remarks" remarksData={data['b-oa-total-remarks']} updateField={updateField} slotHint="OA total/usage chart" />
        <ChartCard title="Total Bill Contribution (MSEDCL vs OA)" slotId="b-oa-contr" imageData={data['b-oa-contr']} remarksId="b-oa-contr-remarks" remarksData={data['b-oa-contr-remarks']} updateField={updateField} slotHint="Contribution split chart" />
      </div>
    </div>
  );
}
