"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addNoteAction, type ActionState } from "@/app/condition-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteForm({ conditionId }: { conditionId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addNoteAction, null);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Note added");
      formRef.current?.reset();
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="condition_id" value={conditionId} />
      <Textarea name="body" placeholder="Add a clinical note for this patient…" required />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}
