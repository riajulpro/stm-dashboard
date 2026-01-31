/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RoutineStatusCellProps {
  routineId: string;
  initialValue: boolean;
}

export function RoutineStatusCell({
  routineId,
  initialValue,
}: RoutineStatusCellProps) {
  const [value, setValue] = useState(initialValue);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.patch(`/routines/${routineId}`, {
        isActive: value,
      });

      toast.success("Routine status updated");
      setDirty(false);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value ? "active" : "inactive"}
        onValueChange={(val) => {
          setValue(val === "active");
          setDirty((val === "active") !== initialValue);
        }}
      >
        <SelectTrigger className="w-30 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {dirty && (
        <Button size="sm" onClick={handleUpdate} disabled={loading}>
          {loading ? "Saving..." : "Update"}
        </Button>
      )}

      {!dirty && (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )}
    </div>
  );
}
