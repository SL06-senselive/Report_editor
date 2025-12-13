"use client";
import React from 'react';
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import EditableField from './EditableField';
import { ReportState } from '@/lib/report-data';
import ImageSlot from './ImageSlot';
const MetaItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="item">
    <b className="label">{label}:</b>
    <div className='value-col'>
      {children}
    </div>
  </div>
);
type ReportHeaderProps = {
  data: ReportState;
  updateField: (id: string, value: any) => void;
};

export default function ReportHeader({ data, updateField }: ReportHeaderProps) {
  const date: DateRange | undefined = data.period;
  const handleDateChange = (newDate: DateRange | undefined) => {
    updateField('period', newDate);
  }
  return (
    <div className="report-header">
      <div className="flex items-center gap-4">
        <ImageSlot
          id="headerLogo"
          src={data.headerLogo}
          onUpload={updateField}
         // className="!h-24 !w-20 !min-h-0 !bg-primary-foreground/10 !border-primary-foreground/30 hover:!bg-primary-foreground/20"
         className='relative h-[60px] w-[120px] bg-primary-foreground/10 border border-primary-foreground/30 rounded-md hover:bg-primary-foreground/20 transition-all'
         hint="Logo"
        />
        <div className='flex-1'>
          <h1>
            <EditableField id="title" value={data.title} onChange={updateField} className="!font-bold text-primary-foreground" />
          </h1>
          <div style={{ opacity: 0.95 }} className="w-full">
            {/* <EditableField id="subTitle" value={data.subTitle} onChange={updateField} className="" /> */}
             <EditableField id="subTitle" value={data.subTitle} onChange={updateField} className="w-[600px] text-primary-foreground" />
          </div>
           <div className='w-full'>
          <MetaItem label="Prepared by">
            <EditableField id="preparedBy" value={data.preparedBy} onChange={updateField} />
          </MetaItem>                                        
        </div>
        </div>
      </div>
      <div className="right">
        <div className="tag">
          <EditableField id="clientName" value={data.clientName} onChange={updateField} />
        </div>
        <div className="tag">
          <EditableField id="clientLocation" value={data.clientLocation} onChange={updateField} />
        </div>

        <div className="print-only tag h-auto justify-start text-left font-normal !text-black bg-card text-card-foreground border-border hidden">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </div>
         
                              
    {/* <Popover>
          <PopoverTrigger asChild>
<Button
  id="date"
  variant={"outline"}
  data-hide-print="true"
  className={cn(
    "tag h-auto justify-start text-left font-normal !bg-white !text-slate-800 border",
    "!min-h-9 whitespace-nowrap",
    !date && "text-muted-foreground"
  )}
>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover> */}

        <Popover>
  <PopoverTrigger asChild>
    <Button
      id="date"
      variant="outline"
      data-hide-print="true"
      className={cn(
        "flex items-center gap-2 rounded-md border border-slate-300",
        "bg-white text-slate-800 px-3 py-2 h-10 shadow-sm hover:bg-slate-50",
        "!min-h-9 whitespace-nowrap text-sm font-medium",
        !date && "text-muted-foreground"
      )}
                           
    >
      <CalendarIcon className="h-4 w-4 opacity-70" />
      {date?.from ? (
        date.to ? (
          <>
            {format(date.from, "LLL dd, y")} – {format(date.to, "LLL dd, y")}
          </>
        ) : (
          format(date.from, "LLL dd, y")
        )
      ) : (
        <span>Select date range</span>
      )}
    </Button>
  </PopoverTrigger>

  <PopoverContent
    className="w-auto p-0 rounded-xl shadow-lg border bg-white"
    align="end"
  >
    <Calendar
      initialFocus
      mode="range"
      defaultMonth={date?.from}
      selected={date}
      onSelect={handleDateChange}
      numberOfMonths={2}
      className="rounded-xl"
    />
  </PopoverContent>
</Popover>

        <div className="tag">
          <EditableField id="reportTags" value={data.reportTags} onChange={updateField} />
        </div>
      </div >
    </div >
  );
}
