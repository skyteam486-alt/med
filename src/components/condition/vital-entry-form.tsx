"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addVitalEntryAction, type ActionState } from "@/app/condition-actions";
import type { Tables } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VitalEntryForm({
  conditionId,
  templates,
}: {
  conditionId: string;
  templates: Tables<"vital_templates">[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addVitalEntryAction,
    null,
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Vital recorded");
      formRef.current?.reset();
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="condition_id" value={conditionId} />
      <div className="space-y-2">
        <Label htmlFor="template_id">Vital</Label>
        <select
          id="template_id"
          name="template_id"
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          defaultValue={templates[0]?.id}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.unit ? ` (${t.unit})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input id="value" name="value" type="number" step="any" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="optional" />
        </div>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Log vital"}
      </Button>
    </form>
  );
}
