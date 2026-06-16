"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export type ActionState = { error?: string; ok?: boolean } | null;

export async function createConditionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile();
  if (profile.role !== "patient") return { error: "Only patients can create conditions." };

  const title = String(formData.get("title") ?? "").trim();
  const condition_type = String(formData.get("condition_type") ?? "general");
  const description = String(formData.get("description") ?? "").trim() || null;
  const doctorRaw = String(formData.get("doctor_id") ?? "").trim();
  const doctor_id = doctorRaw || null;

  if (!title) return { error: "A title is required." };

  const supabase = await createClient();
  const { data: condition, error } = await supabase
    .from("conditions")
    .insert({ profile_id: profile.id, title, condition_type, description, doctor_id })
    .select("id")
    .single();
  if (error || !condition) return { error: error?.message ?? "Could not create condition." };

  // Attach the vitals catalogued for this condition type (template-driven, not hardcoded).
  const { data: templates } = await supabase
    .from("vital_templates")
    .select("id")
    .eq("condition_type", condition_type);

  if (templates && templates.length > 0) {
    await supabase.from("condition_vitals").insert(
      templates.map((t) => ({ condition_id: condition.id, template_id: t.id })),
    );
  }

  redirect(`/patient/conditions/${condition.id}`);
}

export async function addVitalEntryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await requireProfile();

  const condition_id = String(formData.get("condition_id") ?? "");
  const template_id = String(formData.get("template_id") ?? "");
  const valueRaw = String(formData.get("value") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!condition_id || !template_id) return { error: "Pick a vital to record." };
  if (valueRaw === "" || Number.isNaN(Number(valueRaw))) return { error: "Enter a numeric value." };

  const supabase = await createClient();
  const { error } = await supabase.from("vital_entries").insert({
    condition_id,
    template_id,
    value: Number(valueRaw),
    notes,
    created_by: userId,
  });
  if (error) return { error: error.message };

  revalidatePath(`/patient/conditions/${condition_id}`);
  revalidatePath(`/doctor/conditions/${condition_id}`);
  return { ok: true };
}

export async function addNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { profile } = await requireProfile();
  if (profile.role !== "doctor") return { error: "Only doctors can add clinical notes." };

  const condition_id = String(formData.get("condition_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!condition_id || !body) return { error: "Write a note first." };

  const supabase = await createClient();
  const { error } = await supabase.from("clinical_notes").insert({
    condition_id,
    doctor_id: profile.id,
    body,
  });
  if (error) return { error: error.message };

  revalidatePath(`/doctor/conditions/${condition_id}`);
  revalidatePath(`/patient/conditions/${condition_id}`);
  return { ok: true };
}

export async function acknowledgeAlertAction(formData: FormData) {
  const condition_id = String(formData.get("condition_id") ?? "");
  const alert_id = String(formData.get("alert_id") ?? "");
  if (!alert_id) return;

  const supabase = await createClient();
  await supabase.from("alerts").update({ acknowledged: true }).eq("id", alert_id);

  revalidatePath(`/doctor/conditions/${condition_id}`);
  revalidatePath(`/patient/conditions/${condition_id}`);
}
