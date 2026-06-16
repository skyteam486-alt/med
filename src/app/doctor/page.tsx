import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ShieldAlert, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { diseaseLabel } from "@/lib/conditions";
import { DashboardHeader } from "@/components/dashboard-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function DoctorDashboard() {
  const { profile } = await requireProfile();
  if (profile.role !== "doctor") redirect("/patient");

  const supabase = await createClient();

  const { data: conditions } = await supabase
    .from("conditions")
    .select("*")
    .eq("doctor_id", profile.id)
    .order("created_at", { ascending: false });

  const profileIds = Array.from(new Set((conditions ?? []).map((c) => c.profile_id)));
  const { data: patients } = profileIds.length
    ? await supabase.from("profiles").select("id, name, age, gender").in("id", profileIds)
    : { data: [] };
  const patientById = new Map((patients ?? []).map((p) => [p.id, p]));

  const conditionIds = (conditions ?? []).map((c) => c.id);
  const { data: openAlerts } = conditionIds.length
    ? await supabase
        .from("alerts")
        .select("id, condition_id")
        .in("condition_id", conditionIds)
        .eq("acknowledged", false)
    : { data: [] };
  const alertCount = new Map<string, number>();
  (openAlerts ?? []).forEach((a) =>
    alertCount.set(a.condition_id, (alertCount.get(a.condition_id) ?? 0) + 1),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader name={profile.name} role={profile.role} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-teal-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Assigned patients</h1>
            <p className="text-slate-600">Monitoring plans where you are the assigned doctor.</p>
          </div>
        </div>

        {(openAlerts ?? []).length > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">
              {(openAlerts ?? []).length} unacknowledged alert(s) need your attention.
            </span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {(conditions ?? []).length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-slate-500">
                No patients yet. Patients assign themselves to you when creating a condition.
              </CardContent>
            </Card>
          )}

          {(conditions ?? []).map((c) => {
            const patient = patientById.get(c.profile_id);
            const alerts = alertCount.get(c.id) ?? 0;
            return (
              <Link key={c.id} href={`/doctor/conditions/${c.id}`}>
                <Card className="transition hover:border-teal-300 hover:shadow-md">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {patient?.name ?? "Patient"}
                        </h3>
                        <Badge variant="secondary">{c.title}</Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {diseaseLabel(c.condition_type)}
                        {patient?.age ? ` · ${patient.age}y` : ""}
                        {patient?.gender ? ` · ${patient.gender}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {alerts > 0 && (
                        <Badge className="bg-amber-100 text-amber-800">{alerts} alert(s)</Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
