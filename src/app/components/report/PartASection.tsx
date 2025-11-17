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

export default function PartASection({ data, updateField }: SectionProps) {
  return (
    <div className="report-section" id="part-a">
      <h2>🅰️ Part A — MSEDCL Bill</h2>

      <div className="grid-2">
        <ChartCard title="Demand Charges (DC) Trend" slotId="a-dc" imageData={data['a-dc']} remarksId="a-dc-remarks" remarksData={data['a-dc-remarks']} updateField={updateField} slotHint="Drop DC chart" />
        <ChartCard title="Demand Penalty (Exceeding CD)" slotId="a-penalty" imageData={data['a-penalty']} remarksId="a-penalty-remarks" remarksData={data['a-penalty-remarks']} updateField={updateField} slotHint="Drop penalty chart" />
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard title="Energy Charges (EC) Trend" slotId="a-ec" imageData={data['a-ec']} remarksId="a-ec-remarks" remarksData={data['a-ec-remarks']} updateField={updateField} slotHint="Drop EC chart" />
        <ChartCard title="TOD Consumption" slotId="a-tod-cons" imageData={data['a-tod-cons']} remarksId="a-tod-cons-remarks" remarksData={data['a-tod-cons-remarks']} updateField={updateField} slotHint="Drop ToD consumption chart" />
      </div>

      <div className="chart-card mt-3.5 group">
        <h3>TOD Tariff</h3>
        <div className="subgrid">
          <ImageSlot id="a-tod-tariff" src={data['a-tod-tariff']} onUpload={updateField} hint="Drop ToD tariff chart" />
          <div className="subgrid">
            <ImageSlot id="a-tod-ref1" src={data['a-tod-ref1']} onUpload={updateField} className="small" hint="Reference image 1" />
            <ImageSlot id="a-tod-ref2" src={data['a-tod-ref2']} onUpload={updateField} className="small" hint="Reference image 2" />
          </div>
        </div>
        <div className="remarks">
            <EditableField id="a-tod-tariff-remarks" value={data['a-tod-tariff-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>
      
      <div className="chart-card mt-3.5 group">
        <h3>PF &amp; LF Analysis</h3>
        <div className="subgrid">
          <ImageSlot id="a-pf" src={data['a-pf']} onUpload={updateField} hint="PF chart" />
          <ImageSlot id="a-lf" src={data['a-lf']} onUpload={updateField} hint="LF chart" />
        </div>
        <div className="remarks">
          <EditableField id="a-pf-lf-remarks" value={data['a-pf-lf-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>

      <div className="chart-card mt-3.5 group">
        <h3>BCR &amp; ICR Trends</h3>
        <div className="subgrid">
          <ImageSlot id="a-bcr" src={data['a-bcr']} onUpload={updateField} hint="BCR trend" />
          <ImageSlot id="a-icr" src={data['a-icr']} onUpload={updateField} hint="ICR trend" />
        </div>
        <div className="remarks">
          <EditableField id="a-bcr-icr-remarks" value={data['a-bcr-icr-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard title="FAC Trend (Rate & Total)" slotId="a-fac" imageData={data['a-fac']} remarksId="a-fac-remarks" remarksData={data['a-fac-remarks']} updateField={updateField} slotHint="FAC chart" />
        <ChartCard title="Wheeling Charges (WC) Trend" slotId="a-wc" imageData={data['a-wc']} remarksId="a-wc-remarks" remarksData={data['a-wc-remarks']} updateField={updateField} slotHint="WC chart" />
      </div>

      <div className="chart-card mt-3.5 group">
        <h3>Taxes &amp; Duties (ED &amp; ToSE)</h3>
        <div className="subgrid">
          <ImageSlot id="a-tax1" src={data['a-tax1']} onUpload={updateField} hint="Chart 1" />
          <ImageSlot id="a-tax2" src={data['a-tax2']} onUpload={updateField} hint="Chart 2" />
        </div>
        <div className="remarks">
          <EditableField id="a-taxes-remarks" value={data['a-taxes-remarks']} onChange={updateField} type="textarea" />
        </div>
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard title="Total Adjustments" slotId="a-adj" imageData={data['a-adj']} remarksId="a-adj-remarks" remarksData={data['a-adj-remarks']} updateField={updateField} slotHint="Adjustments chart" />
        <ChartCard title="Total MSEDCL Bill (Calculated vs Billed)" slotId="a-total" imageData={data['a-total']} remarksId="a-total-remarks" remarksData={data['a-total-remarks']} updateField={updateField} slotHint="Total MSEDCL chart" />
      </div>
    </div>
  );
}
