import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { loadConditionDetail } from "@/lib/condition-detail";
import { DashboardHeader } from "@/components/dashboard-header";
import { ConditionView } from "@/components/condition/condition-view";

export default async function DoctorConditionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireProfile();
  if (profile.role !== "doctor") redirect(`/patient/conditions/${id}`);

  const detail = await loadConditionDetail(id);
  if (!detail) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader name={profile.name} role={profile.role} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          href="/doctor"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to patients
        </Link>
        <ConditionView detail={detail} viewerRole="doctor" currentUserId={userId} />
      </main>
    </div>
  );
}
