import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

interface AttentionItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  urgency: "amber" | "red";
}

const attentionItems: AttentionItem[] = [
  {
    id: "1",
    title: "Office Lease Renewal",
    description: "Expires in 7 days - needs immediate action",
    timestamp: "2026-02-01T08:00:00Z",
    urgency: "red",
  },
  {
    id: "2",
    title: "NDA - Acme Partnership",
    description: "Awaiting signature from David Park",
    timestamp: "2026-02-01T09:00:00Z",
    urgency: "amber",
  },
];

export default function NeedsAttention() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">Needs Attention</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {attentionItems.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                item.urgency === "red"
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeDate(item.timestamp)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
