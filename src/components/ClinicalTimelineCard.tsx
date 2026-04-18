import { useEffect, useState } from "react";
import { BentoCard } from "./BentoCard";
import { Clock, Trash2 } from "lucide-react";
import { deleteTimelineEntry, getTimeline, symptomColor } from "@/services/api";
import { cn } from "@/lib/utils";

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
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => { getTimeline().then(setEntries); }, []);

  const all = [...extraEntries, ...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const remove = async (id: string) => {
    setEntries((c) => c.filter((e) => e.id !== id));
    await deleteTimelineEntry(id);
  };

  return (
    <BentoCard
      title="Clinical Timeline"
      subtitle="Past daily check-ins"
      icon={<Clock className="h-5 w-5" />}
    >
      <ol className="max-h-[520px] overflow-y-auto pr-1 space-y-3">
        {all.map((e) => (
          <li
            key={e.id}
            className="flex gap-3 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <img src={e.thumb} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{fmt(e.date)}</p>
                <button
                  onClick={() => remove(e.id)}
                  aria-label="Delete entry"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
    </BentoCard>
  );
}
