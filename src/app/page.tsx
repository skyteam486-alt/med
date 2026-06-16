import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, LineChart, MessageSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionProfile } from "@/lib/auth";

export default async function Home() {
  const session = await getSessionProfile();
  if (session?.profile) {
    redirect(session.profile.role === "doctor" ? "/doctor" : "/patient");
  }
  if (session && !session.profile) {
    redirect("/onboarding");
  }

  const features = [
    {
      icon: Activity,
      title: "Condition-based plans",
      body: "Each condition tracks its own vitals — diabetes, hypertension, COPD, post-surgery and more.",
    },
    {
      icon: LineChart,
      title: "Trends at a glance",
      body: "Daily vitals turn into 7 / 30 / 90-day charts so improvement or decline is obvious.",
    },
    {
      icon: ShieldAlert,
      title: "Automatic alerts",
      body: "Out-of-range readings raise warnings and critical alerts for the care team instantly.",
    },
    {
      icon: MessageSquare,
      title: "Built-in chat & notes",
      body: "Patients and doctors message in real time; doctors leave clinical notes per condition.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold text-teal-700">
          <Activity className="h-6 w-6" />
          <span className="text-lg">MedTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button render={<Link href="/register" />}>Get started</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
              Remote patient follow-up
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Follow-up monitoring that actually gets followed up.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Doctors create a monitoring plan, patients log daily vitals, and everyone
              watches the trends, alerts and conversation in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/register" />}>
                Create your account
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/login" />}>
                I already have an account
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <f.icon className="h-7 w-7 text-teal-600" />
                <h3 className="mt-3 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
