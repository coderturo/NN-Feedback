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
            "w-full justify-start text-left font-normal rounded-lg h-10 text-sm px-3 border-neutral-300 bg-white hover:bg-neutral-50",
            !selected && "text-neutral-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-neutral-500" />
          {selected ? (
            <span className="text-neutral-900 font-medium">
              {format(selected, "dd 'de' MMMM, yyyy", { locale: es })}
            </span>
          ) : (
            <span>Seleccionar fecha</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-2 shadow-xl border border-neutral-200 bg-white rounded-xl"
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
          fromYear={2022}
          toYear={2030}
          locale={es}
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
}
