"use client";

import React from 'react';
import { ReportState } from '@/lib/report-data';
import KpiCard from './KpiCard';
import ChartCard from './ChartCard';

type SectionProps = {
  data: ReportState;
  updateField: (id: string, value: any) => void;
};

export default function SummarySection({ data, updateField }: SectionProps) {
  return (
    <div className="report-section" id="summary">
      <h2>📌 Summary</h2>

      <div className="kpis">
        <KpiCard
          titleId="kpi-avg-kwh-title"
          title={data['kpi-avg-kwh-title']}
          valueId="kpi-avg-kwh-value"
          value={data['kpi-avg-kwh-value']}
          hintId="kpi-avg-kwh-hint"
          hint={data['kpi-avg-kwh-hint']}
          updateField={updateField}
        />
        <KpiCard
          titleId="kpi-avg-kvah-title"
          title={data['kpi-avg-kvah-title']}
          valueId="kpi-avg-kvah-value"
          value={data['kpi-avg-kvah-value']}
          hintId="kpi-avg-kvah-hint"
          hint={data['kpi-avg-kvah-hint']}
          updateField={updateField}
        />
        <KpiCard
          titleId="kpi-pf-status-title"
          title={data['kpi-pf-status-title']}
          isTitleEditable={false}
          valueId="kpi-pf-status-value"
          value={data['kpi-pf-status-value']}
          valueStatus="good"
          hintId="kpi-pf-status-hint"
          hint={data['kpi-pf-status-hint']}
          updateField={updateField}
        />
        <KpiCard
          titleId="kpi-load-factor-title"
          title={data['kpi-load-factor-title']}
          isTitleEditable={false}
          valueId="kpi-load-factor-value"
          value={data['kpi-load-factor-value']}
          valueStatus="bad"
          hintId="kpi-load-factor-hint"
          hint={data['kpi-load-factor-hint']}
          updateField={updateField}
        />
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard
          title="Consumption Summary (kWh)"
          slotId="summary-consumption"
          imageData={data['summary-consumption']}
          remarksId="summary-consumption-remarks"
          remarksData={data['summary-consumption-remarks']}
          updateField={updateField}
          slotHint="Drop consumption summary image"
        />
        <ChartCard
          title="KVAH Consumption Trend"
          slotId="summary-kvah"
          imageData={data['summary-kvah']}
          remarksId="summary-kvah-remarks"
          remarksData={data['summary-kvah-remarks']}
          updateField={updateField}
          slotHint="Drop KVAH trend image"
        />
      </div>

      <div className="grid-2 mt-3.5">
        <ChartCard
          title="OA Contract Demand (CD) Trend"
          slotId="summary-oa-cd"
          imageData={data['summary-oa-cd']}
          remarksId="summary-oa-cd-remarks"
          remarksData={data['summary-oa-cd-remarks']}
          updateField={updateField}
          slotHint="Drop OA CD chart"
        />
        <ChartCard
          title="Contract Demand vs BD/HRD"
          slotId="summary-cd-bd-hrd"
          imageData={data['summary-cd-bd-hrd']}
          remarksId="summary-cd-bd-hrd-remarks"
          remarksData={data['summary-cd-bd-hrd-remarks']}
          updateField={updateField}
          slotHint="Drop CD/BD/HRD chart"
        />
      </div>
    </div>
  );
}
