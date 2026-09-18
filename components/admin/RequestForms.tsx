"use client";

import { useActionState, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { saveNotes, scheduleSession, updateStatus, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { US_TIMEZONES, formatDateTimeInZone, zonedTimeToUtc } from "@/lib/time";
import { cn } from "@/lib/cn";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled (sends an email)" },
];

const control =
  "block min-h-11 w-full rounded-[8px] border border-field bg-white px-3 py-2 text-navy focus:border-blue";

function Feedback({ state }: { state: ActionState }) {
  if (!state.message && !state.error) return null;
  const isError = Boolean(state.error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={cn("mt-3 flex items-start gap-2 text-sm font-medium", isError ? "text-danger" : "text-success")}
    >
      {isError ? (
        <CircleAlert size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
      ) : (
        <CircleCheck size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
      )}
      {state.error ?? state.message}
    </p>
  );
}

function Pending({ pending, idle, busy }: { pending: boolean; idle: string; busy: string }) {
  return pending ? (
    <>
      <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> {busy}
    </>
  ) : (
    <>{idle}</>
  );
}

export function StatusForm({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateStatus.bind(null, id), {});
  return (
    <form
      action={action}
      className="mt-4"
      onSubmit={(e) => {
        const next = new FormData(e.currentTarget).get("status");
        if (next === "CANCELLED" && status !== "CANCELLED" && !window.confirm("Cancel this consultation and email the visitor?")) {
          e.preventDefault();
        }
      }}
    >
      <label htmlFor="status" className="block text-sm font-semibold text-navy">
        Request status
      </label>
      <select id="status" name="status" defaultValue={status} className={cn(control, "mt-2")}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" size="sm" className="mt-3 w-full" disabled={pending}>
        <Pending pending={pending} idle="Update status" busy="Updating…" />
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function NotesForm({ id, notes }: { id: string; notes: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveNotes.bind(null, id), {});
  return (
    <form action={action} className="mt-4">
      <label htmlFor="adminNotes" className="block text-sm font-semibold text-navy">
        Notes <span className="font-normal text-muted">(only visible here)</span>
      </label>
      <textarea id="adminNotes" name="adminNotes" defaultValue={notes} rows={8} maxLength={10000} className={cn(control, "mt-2 resize-y")} />
      <Button type="submit" variant="secondary" size="sm" className="mt-3 w-full" disabled={pending}>
        <Pending pending={pending} idle="Save notes" busy="Saving…" />
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function ScheduleForm({
  id,
  defaults,
  hasSchedule,
}: {
  id: string;
  defaults: { date: string; time: string; timezone: string; meetingLink: string };
  hasSchedule: boolean;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(scheduleSession.bind(null, id), {});
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [timezone, setTimezone] = useState(defaults.timezone);
  // Controlled so values survive React's automatic form reset after the action runs.
  const [meetingLink, setMeetingLink] = useState(defaults.meetingLink);

  const zones = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [...US_TIMEZONES];
    if (!list.some((z) => z.value === defaults.timezone)) list.unshift({ value: defaults.timezone, label: defaults.timezone });
    return list;
  }, [defaults.timezone]);

  // Live preview in the admin's own time zone, to avoid scheduling mistakes.
  const preview = useMemo(() => {
    if (!date || !time) return null;
    try {
      const utc = zonedTimeToUtc(date, time, timezone);
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return { visitor: formatDateTimeInZone(utc, timezone), admin: local !== timezone ? formatDateTimeInZone(utc, local) : null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid time" };
    }
  }, [date, time, timezone]);

  return (
    <form action={action} className="mt-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-navy">Date</label>
          <input id="date" name="date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={cn(control, "mt-2")} />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-semibold text-navy">Time</label>
          <input id="time" name="time" type="time" required step={300} value={time} onChange={(e) => setTime(e.target.value)} className={cn(control, "mt-2")} />
        </div>
        <div>
          <label htmlFor="timezone" className="block text-sm font-semibold text-navy">Time zone</label>
          <select id="timezone" name="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={cn(control, "mt-2")}>
            {zones.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {preview && "error" in preview ? (
          <span className="text-danger">{preview.error}</span>
        ) : preview ? (
          <>
            Visitor sees: <strong className="text-navy">{preview.visitor}</strong>
            {preview.admin && <> · Your time: {preview.admin}</>}
          </>
        ) : (
          "Times are emailed in the selected time zone (defaults to the visitor’s detected zone)."
        )}
      </p>

      <div className="mt-4">
        <label htmlFor="meetingLink" className="block text-sm font-semibold text-navy">
          Meeting link or joining details <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="meetingLink"
          name="meetingLink"
          type="text"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          maxLength={500}
          placeholder="https://meet.google.com/… or “I’ll call you at the number you provided”"
          className={cn(control, "mt-2")}
        />
      </div>

      <Button type="submit" className="mt-5" disabled={pending}>
        <Pending
          pending={pending}
          idle={hasSchedule ? "Save and send update" : "Confirm and send invite"}
          busy="Saving and sending…"
        />
      </Button>
      <Feedback state={state} />
    </form>
  );
}
