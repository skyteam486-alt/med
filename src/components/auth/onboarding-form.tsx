"use client";

import { useActionState, useState } from "react";
import { createProfileAction, type AuthState } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(createProfileAction, null);
  const [role, setRole] = useState<"patient" | "doctor">("patient");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={role} />
      <div className="space-y-2">
        <Label>I am a</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["patient", "doctor"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition ${
                role === r
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
      </div>

      {role === "patient" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" min={0} max={149} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              defaultValue=""
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
