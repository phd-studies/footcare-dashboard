import { useEffect, useState } from "react";
import { BentoCard } from "./BentoCard";
import { Lightbulb, Bell, Droplet, Footprints, Sun } from "lucide-react";
import { getDailyTip, updateReminderSetting } from "@/services/api";
import { cn } from "@/lib/utils";

const ICONS: Record<string, any> = { Droplet, Footprints, Sun, Lightbulb };

export function InsightsSettingsCard() {
  const [tip, setTip] = useState<{ title: string; body: string; icon: string } | null>(null);
  const [reminders, setReminders] = useState(true);

  useEffect(() => { getDailyTip().then(setTip); }, []);

  const Icon = ICONS[tip?.icon ?? "Lightbulb"] ?? Lightbulb;

  const toggle = async () => {
    const next = !reminders;
    setReminders(next);
    await updateReminderSetting(next);
  };

  return (
    <BentoCard title="Insights & Settings" icon={<Lightbulb className="h-5 w-5" />}>
      <div className="rounded-2xl bg-gradient-to-br from-health-blue/15 to-health-purple/10 p-4">
        <div className="flex items-center gap-2 text-health-blue">
          <Icon className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-wide">Daily Tip</p>
        </div>
        <p className="mt-2 text-sm font-semibold">{tip?.title ?? "Loading…"}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip?.body}</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary/60 p-4 min-h-[64px]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-card flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Daily Photo Reminders</p>
            <p className="text-xs text-muted-foreground">Get notified at 8:00 PM</p>
          </div>
        </div>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={reminders}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors",
            reminders ? "bg-health-green" : "bg-muted-foreground/30",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all",
              reminders ? "left-[22px]" : "left-0.5",
            )}
          />
        </button>
      </div>
    </BentoCard>
  );
}
