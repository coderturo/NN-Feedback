"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  value?: Date | null;
  onChange?: (d: Date | null) => void;
};

export function DatePicker({ value, onChange }: Props) {
  const [date, setDate] = React.useState<Date | null>(value ?? null);
  const selected = value ?? date;
  const [open, setOpen] = React.useState(false);

  const handleSelect = (d?: Date) => {
    const v = d ?? null;
    setDate(v);
    onChange?.(v);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-medium rounded-xl h-12 text-base px-4 border-neutral-300",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-5 w-5 opacity-70" />
          {selected ? (
            <span>{format(selected, "dd/MM/yyyy", { locale: es })}</span>
          ) : (
            <span className="text-neutral-400">Selecciona una fecha</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-2 shadow-lg border border-neutral-200 bg-white rounded-xl scale-105"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={(d) => {
            handleSelect(d);
            setOpen(false); 
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2030}
          locale={es}
          className="rounded-xl"
        />
      </PopoverContent>
    </Popover>
  );
}
