import { ThemeToggle } from "./ThemeToggle";
import { useUser } from "@/lib/auth";
import { Activity } from "lucide-react";

export function TopBar() {
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">FootCare</p>
            <p className="text-[11px] text-muted-foreground">Wound Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <img
              src={user.imageUrl} alt={user.firstName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
            />
          )}
        </div>
      </div>
    </header>
  );
}
