import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Plus, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { diseaseLabel } from "@/lib/conditions";
import { DashboardHeader } from "@/components/dashboard-header";
import { NewConditionDialog } from "@/components/patient/new-condition-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function PatientDashboard() {
  const { profile } = await requireProfile();
  if (profile.role !== "patient") redirect("/doctor");

  const supabase = await createClient();

  const { data: conditions } = await supabase
    .from("conditions")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "doctor")
    .order("name");

  const conditionIds = (conditions ?? []).map((c) => c.id);
  const { data: openAlerts } = conditionIds.length
    ? await supabase
        .from("alerts")
        .select("id, condition_id, severity")
        .in("condition_id", conditionIds)
        .eq("acknowledged", false)
    : { data: [] };

  const alertCountByCondition = new Map<string, number>();
  (openAlerts ?? []).forEach((a) => {
    alertCountByCondition.set(a.condition_id, (alertCountByCondition.get(a.condition_id) ?? 0) + 1);
  });

  const doctorById = new Map((doctors ?? []).map((d) => [d.id, d.name]));

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader name={profile.name} role={profile.role} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your conditions</h1>
            <p className="text-slate-600">Each condition tracks its own set of vitals.</p>
          </div>
          <NewConditionDialog doctors={doctors ?? []} />
        </div>

        {(openAlerts ?? []).length > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">
              You have {(openAlerts ?? []).length} unacknowledged alert(s) across your conditions.
            </span>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(conditions ?? []).length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <Plus className="h-8 w-8 text-slate-400" />
                <p className="text-slate-600">
                  No conditions yet. Create your first monitoring plan to start logging vitals.
                </p>
                <NewConditionDialog doctors={doctors ?? []} />
              </CardContent>
            </Card>
          )}

          {(conditions ?? []).map((c) => {
            const alerts = alertCountByCondition.get(c.id) ?? 0;
            return (
              <Link key={c.id} href={`/patient/conditions/${c.id}`}>
                <Card className="h-full transition hover:border-teal-300 hover:shadow-md">
                  <CardContent className="space-y-3 py-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{c.title}</h3>
                        <p className="text-sm text-slate-500">{diseaseLabel(c.condition_type)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {c.status}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        Dr. {c.doctor_id ? doctorById.get(c.doctor_id) ?? "Assigned" : "Unassigned"}
                      </span>
                      {alerts > 0 && (
                        <Badge className="bg-amber-100 text-amber-800">{alerts} alert(s)</Badge>
                      )}
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
