import { useEffect, useState } from "react";
import { BentoCard } from "./BentoCard";
import { User } from "lucide-react";
import { getProfile } from "@/services/api";

type Profile = {
  name: string; age: number; gender: string; heightCm: number; weightKg: number;
  diagnosis: string; avatarUrl: string;
};

export function PatientProfileCard() {
  const [p, setP] = useState<Profile | null>(null);
  useEffect(() => { getProfile().then(setP); }, []);

  return (
    <BentoCard title="Patient Profile" subtitle="Demographics & diagnosis" icon={<User className="h-5 w-5" />}>
      {p && (
        <div className="flex items-center gap-4">
          <img src={p.avatarUrl} alt={p.name} className="h-16 w-16 rounded-2xl object-cover ring-2 ring-border" />
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate">{p.name}</p>
            <p className="text-sm text-muted-foreground truncate">{p.diagnosis}</p>
          </div>
        </div>
      )}
      {p && (
        <dl className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Age", `${p.age}`],
            ["Gender", p.gender],
            ["Height", `${p.heightCm} cm`],
            ["Weight", `${p.weightKg} kg`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-secondary/60 p-3">
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="text-sm font-semibold mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </BentoCard>
  );
}
