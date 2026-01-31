"use client";

import { useState } from "react";
import { Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoutineSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

const formatTime = (time: string) => {
  if (!time) return "";
  if (time.includes("AM") || time.includes("PM")) return time;

  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const getDayAbbr = (day: string) => {
  const map: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  return map[day] || day;
};

export function RoutineScheduleCell({
  schedule,
}: {
  schedule: RoutineSchedule[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!schedule || schedule.length === 0) {
    return <span className="text-sm text-muted-foreground">No schedule</span>;
  }

  const visibleSchedules = expanded ? schedule : schedule.slice(0, 1);

  return (
    <div className="space-y-1 max-w-75">
      {visibleSchedules.map((sched, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-2 py-1"
        >
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium w-10">{getDayAbbr(sched.day)}</span>
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatTime(sched.startTime)} – {formatTime(sched.endTime)}
          </span>
        </div>
      ))}

      {schedule.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          className="px-1 text-xs"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="h-3 w-3 ml-1" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
