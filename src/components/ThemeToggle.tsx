import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
    >
      {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
