import { useEffect, useState } from "react";
import { BentoCard } from "./BentoCard";
import { TrendingDown } from "lucide-react";
import { getTrajectory } from "@/services/api";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type Pt = { day: number; date: string; sizeCm2: number };

export function HealingTrajectoryCard() {
  const [data, setData] = useState<Pt[]>([]);
  useEffect(() => { getTrajectory().then(setData); }, []);

  const first = data[0]?.sizeCm2 ?? 0;
  const last = data[data.length - 1]?.sizeCm2 ?? 0;
  const reduction = first ? Math.round(((first - last) / first) * 100) : 0;

  return (
    <BentoCard
      title="Healing Trajectory"
      subtitle="Estimated wound size · last 30 days"
      icon={<TrendingDown className="h-5 w-5" />}
      action={
        <div className="text-right">
          <p className="text-2xl font-bold text-health-green leading-none">−{reduction}%</p>
          <p className="text-[11px] text-muted-foreground mt-1">size reduction</p>
        </div>
      }
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day" tickLine={false} axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              interval={5}
            />
            <YAxis
              tickLine={false} axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
              formatter={(v: any) => [`${v} cm²`, "Size"]}
              labelFormatter={(l) => `Day ${l}`}
            />
            <Area
              type="monotone" dataKey="sizeCm2"
              stroke="var(--color-primary)" strokeWidth={2.5}
              fill="url(#grad)" dot={false} activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BentoCard>
  );
}
