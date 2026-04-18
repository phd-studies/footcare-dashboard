import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useUser } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { PatientProfileCard } from "@/components/PatientProfileCard";
import { UploadSymptomsCard } from "@/components/UploadSymptomsCard";
import { HealingTrajectoryCard } from "@/components/HealingTrajectoryCard";
import { ClinicalTimelineCard } from "@/components/ClinicalTimelineCard";
import { InsightsSettingsCard } from "@/components/InsightsSettingsCard";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const { isSignedIn, user } = useUser();
  const [extra, setExtra] = useState<any[]>([]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="text-sm text-muted-foreground mt-2">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Good {greeting()}, {user?.firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's how your healing is progressing today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5 auto-rows-min">
          <div className="md:col-span-2"><PatientProfileCard /></div>
          <div className="md:col-span-4"><HealingTrajectoryCard /></div>
          <div className="md:col-span-3"><UploadSymptomsCard onUploaded={(e) => setExtra((c) => [e, ...c])} /></div>
          <div className="md:col-span-3 md:row-span-2"><ClinicalTimelineCard extraEntries={extra} /></div>
          <div className="md:col-span-3"><InsightsSettingsCard /></div>
        </div>
      </main>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
