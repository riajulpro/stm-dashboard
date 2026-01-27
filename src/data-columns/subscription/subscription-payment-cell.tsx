"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  subscriptionId: string;
  amountPaid: number;
  paymentStatus: string;
  courseFee: number;
}

export function SubscriptionPaymentCell({
  subscriptionId,
  amountPaid,
  paymentStatus,
  courseFee,
}: Props) {
  const [amount, setAmount] = useState(amountPaid);
  const [status, setStatus] = useState(paymentStatus);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaid: amount,
          paymentStatus: status,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update payment");
        return;
      }

      toast.success("Payment updated");
    });
  };

  return (
    <div className="flex gap-2 items-center max-w-4/5">
      <Input
        type="number"
        min={0}
        max={courseFee}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="h-9"
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <Badge variant="secondary">Pending</Badge>
          </SelectItem>
          <SelectItem value="partial">
            <Badge variant="outline">Partial</Badge>
          </SelectItem>
          <SelectItem value="paid">
            <Badge className="bg-green-600">Paid</Badge>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button size="sm" onClick={handleSave} disabled={isPending}>
        Save
      </Button>
    </div>
  );
}
