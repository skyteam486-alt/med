import Link from "next/link";
import { Activity } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const home = role === "doctor" ? "/doctor" : "/patient";
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href={home} className="flex items-center gap-2 font-semibold text-teal-700">
          <Activity className="h-6 w-6" />
          <span className="text-lg">MedTrack</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{name}</p>
            <Badge variant="secondary" className="capitalize">
              {role}
            </Badge>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
