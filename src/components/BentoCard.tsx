import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface BentoCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function BentoCard({ title, subtitle, icon, action, className, children, ...rest }: BentoCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "group rounded-3xl bg-card text-card-foreground p-6 shadow-soft border border-border/60 transition-shadow hover:shadow-bento",
        className,
      )}
    >
      {(title || icon || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
