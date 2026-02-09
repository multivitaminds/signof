import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertTriangle, type LucideIcon } from "lucide-react";
import type { StatsData } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  "file-text": FileText,
  clock: Clock,
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
};

export default function StatsCard({ label, value, change, icon }: StatsData) {
  const Icon = iconMap[icon] ?? FileText;

  return (
    <Card>
      <CardContent className="flex items-start gap-4 py-5">
        <div className="rounded-[var(--radius-md)] bg-muted p-2.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            {change !== undefined && (
              <span
                className={`text-xs font-medium ${
                  change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
