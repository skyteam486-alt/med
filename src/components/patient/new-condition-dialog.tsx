"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createConditionAction, type ActionState } from "@/app/condition-actions";
import { DISEASE_TYPES } from "@/lib/conditions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewConditionDialog({ doctors }: { doctors: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createConditionAction,
    null,
  );

  useEffect(() => {
    if (state?.error) setOpen(true);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> New condition
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New monitoring plan</DialogTitle>
          <DialogDescription>
            Pick a condition type — its recommended vitals are added automatically.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="e.g. Type 2 Diabetes follow-up" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition_type">Condition type</Label>
            <select
              id="condition_type"
              name="condition_type"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              defaultValue="diabetes"
            >
              {DISEASE_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor_id">Assigned doctor</Label>
            <select
              id="doctor_id"
              name="doctor_id"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              defaultValue=""
            >
              <option value="">Unassigned</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" name="description" placeholder="Anything the doctor should know" />
          </div>
          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating…" : "Create condition"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
