import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type ConditionDetail = {
  condition: Tables<"conditions">;
  templates: Tables<"vital_templates">[];
  entries: Tables<"vital_entries">[];
  alerts: Tables<"alerts">[];
  notes: Tables<"clinical_notes">[];
  chats: Tables<"chats">[];
  patient: Pick<Tables<"profiles">, "id" | "name" | "age" | "gender"> | null;
  doctor: Pick<Tables<"profiles">, "id" | "name"> | null;
};

export async function loadConditionDetail(conditionId: string): Promise<ConditionDetail | null> {
  const supabase = await createClient();

  const { data: condition } = await supabase
    .from("conditions")
    .select("*")
    .eq("id", conditionId)
    .maybeSingle();
  if (!condition) return null;

  const { data: conditionVitals } = await supabase
    .from("condition_vitals")
    .select("template_id")
    .eq("condition_id", conditionId);

  const templateIds = (conditionVitals ?? []).map((cv) => cv.template_id);
  const { data: templates } = templateIds.length
    ? await supabase.from("vital_templates").select("*").in("id", templateIds).order("name")
    : { data: [] as Tables<"vital_templates">[] };

  const since = subDays(new Date(), 90).toISOString();
  const { data: entries } = await supabase
    .from("vital_entries")
    .select("*")
    .eq("condition_id", conditionId)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("condition_id", conditionId)
    .order("created_at", { ascending: false });

  const { data: notes } = await supabase
    .from("clinical_notes")
    .select("*")
    .eq("condition_id", conditionId)
    .order("created_at", { ascending: false });

  const { data: chats } = await supabase
    .from("chats")
    .select("*")
    .eq("condition_id", conditionId)
    .order("created_at", { ascending: true });

  const { data: patient } = await supabase
    .from("profiles")
    .select("id, name, age, gender")
    .eq("id", condition.profile_id)
    .maybeSingle();

  let doctor: ConditionDetail["doctor"] = null;
  if (condition.doctor_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("id", condition.doctor_id)
      .maybeSingle();
    doctor = data ?? null;
  }

  return {
    condition,
    templates: templates ?? [],
    entries: entries ?? [],
    alerts: alerts ?? [],
    notes: notes ?? [],
    chats: chats ?? [],
    patient: patient ?? null,
    doctor,
  };
}
