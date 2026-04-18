import { useEffect, useState } from "react";
import { BentoCard } from "./BentoCard";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import { getTimeline, symptomColor } from "@/services/api";
import { useUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Entry = { id: string; date: string; thumb: string; symptoms: string[]; note?: string };

const colorClass: Record<string, string> = {
  red: "bg-health-red/15 text-health-red",
  orange: "bg-health-orange/15 text-health-orange",
  yellow: "bg-health-yellow/20 text-health-yellow",
  green: "bg-health-green/15 text-health-green",
  blue: "bg-health-blue/15 text-health-blue",
  purple: "bg-health-purple/15 text-health-purple",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export function ClinicalTimelineCard({ extraEntries = [] as Entry[] }) {
  const { user } = useUser();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getTimeline(user.id)
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.message ?? "Could not load history.";
        setError(msg);
        toast.error("Failed to load history", { description: msg });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const all = [...extraEntries, ...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <BentoCard
      title="Clinical Timeline"
      subtitle="Past daily check-ins"
      icon={<Clock className="h-5 w-5" />}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">Loading history…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <AlertCircle className="h-6 w-6 mb-2 text-destructive" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <ol className="max-h-[520px] overflow-y-auto pr-1 space-y-3">
          {all.map((e) => (
            <li
              key={e.id}
              className="flex gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <img src={e.thumb} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{fmt(e.date)}</p>
                {e.note && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{e.note}</p>}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.symptoms.map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium",
                        colorClass[symptomColor(s)],
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
          {all.length === 0 && (
            <li className="text-sm text-muted-foreground text-center py-8">No entries yet.</li>
          )}
        </ol>
      )}
    </BentoCard>
  );
}
