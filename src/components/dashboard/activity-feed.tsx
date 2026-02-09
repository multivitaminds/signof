import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Avatar from "@/components/ui/avatar";
import { activities } from "@/lib/mock-data";
import { formatRelativeDate } from "@/lib/utils";

export default function ActivityFeed() {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Recent Activity</h2>
      </CardHeader>
      <CardContent className="space-y-5">
        {sorted.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Avatar name={activity.user.name} src={activity.user.avatarUrl} size="sm" />
              {index < sorted.length - 1 && (
                <div className="mt-2 w-px flex-1 bg-border" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatRelativeDate(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
