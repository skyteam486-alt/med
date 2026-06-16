import { format } from "date-fns";
import { BellRing, CheckCircle2, NotebookPen } from "lucide-react";
import type { ConditionDetail } from "@/lib/condition-detail";
import { diseaseLabel, SEVERITY_STYLES } from "@/lib/conditions";
import { acknowledgeAlertAction } from "@/app/condition-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VitalEntryForm } from "@/components/condition/vital-entry-form";
import { VitalsCharts } from "@/components/condition/vitals-charts";
import { ChatPanel } from "@/components/condition/chat-panel";
import { NoteForm } from "@/components/condition/note-form";

export function ConditionView({
  detail,
  viewerRole,
  currentUserId,
}: {
  detail: ConditionDetail;
  viewerRole: "patient" | "doctor";
  currentUserId: string;
}) {
  const { condition, templates, entries, alerts, notes, chats, patient, doctor } = detail;

  const latestByTemplate = new Map<string, (typeof entries)[number]>();
  for (const e of entries) latestByTemplate.set(e.template_id, e);

  const openAlerts = alerts.filter((a) => !a.acknowledged);
  const otherPartyName =
    viewerRole === "patient" ? (doctor ? `Dr. ${doctor.name}` : "Care team") : patient?.name ?? "Patient";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{condition.title}</h1>
          <p className="text-slate-600">{diseaseLabel(condition.condition_type)}</p>
          {condition.description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{condition.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <Badge variant="outline" className="capitalize">
              {condition.status}
            </Badge>
            {viewerRole === "doctor" && patient && (
              <span>
                Patient: <strong>{patient.name}</strong>
                {patient.age ? `, ${patient.age}y` : ""}
                {patient.gender ? `, ${patient.gender}` : ""}
              </span>
            )}
            {viewerRole === "patient" && (
              <span>Doctor: {doctor ? `Dr. ${doctor.name}` : "Unassigned"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {openAlerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-5 w-5 text-amber-600" /> Active alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openAlerts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                  SEVERITY_STYLES[a.severity] ?? ""
                }`}
              >
                <span>
                  <span className="font-semibold capitalize">{a.severity}:</span> {a.message}
                  <span className="ml-2 text-xs opacity-70">
                    {format(new Date(a.created_at), "MMM d, HH:mm")}
                  </span>
                </span>
                <form action={acknowledgeAlertAction}>
                  <input type="hidden" name="alert_id" value={a.id} />
                  <input type="hidden" name="condition_id" value={condition.id} />
                  <Button type="submit" size="sm" variant="outline">
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Acknowledge
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest vitals + entry */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Latest readings</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <p className="text-sm text-slate-500">No vitals configured.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vital</TableHead>
                    <TableHead>Latest</TableHead>
                    <TableHead>Range</TableHead>
                    <TableHead>Recorded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((t) => {
                    const latest = latestByTemplate.get(t.id);
                    const out =
                      latest &&
                      ((t.max_value !== null && Number(latest.value) > t.max_value) ||
                        (t.min_value !== null && Number(latest.value) < t.min_value));
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          {latest ? (
                            <span className={out ? "font-semibold text-red-600" : ""}>
                              {Number(latest.value)} {t.unit ?? ""}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {t.min_value ?? "–"}–{t.max_value ?? "–"}
                        </TableCell>
                        <TableCell className="text-slate-500">
                          {latest ? format(new Date(latest.recorded_at), "MMM d, HH:mm") : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {viewerRole === "patient" && templates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record a vital</CardTitle>
            </CardHeader>
            <CardContent>
              <VitalEntryForm conditionId={condition.id} templates={templates} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <VitalsCharts templates={templates} entries={entries} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chat with {otherPartyName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatPanel
              conditionId={condition.id}
              currentUserId={currentUserId}
              otherPartyName={otherPartyName}
              initialMessages={chats.map((c) => ({
                id: c.id,
                sender_id: c.sender_id,
                message: c.message,
                created_at: c.created_at,
              }))}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <NotebookPen className="h-5 w-5 text-teal-600" /> Doctor notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewerRole === "doctor" && <NoteForm conditionId={condition.id} />}
            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="text-sm text-slate-400">No notes yet.</p>
              )}
              {notes.map((n) => (
                <div key={n.id} className="rounded-lg border bg-slate-50 p-3 text-sm">
                  <p className="text-slate-800">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {format(new Date(n.created_at), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
