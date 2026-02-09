import { cn, formatRelativeDate } from "@/lib/utils";
import type { Activity } from "@/lib/types";

const typeColors: Record<Activity["type"], string> = {
  created: "bg-neutral-400",
  sent: "bg-blue-500",
  viewed: "bg-violet-500",
  signed: "bg-emerald-500",
  commented: "bg-amber-500",
  expired: "bg-red-500",
  reminder: "bg-amber-400",
};

interface AgreementTimelineProps {
  activities: Activity[];
}

export default function AgreementTimeline({ activities }: AgreementTimelineProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
    );
  }

  return (
    <div className="relative">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full mt-1.5 shrink-0",
                typeColors[activity.type]
              )}
            />
            {index < activities.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1.5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{activity.message}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeDate(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
