import PageHeader from "@/components/layout/page-header";
import Button from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";
import QuickActions from "@/components/dashboard/quick-actions";
import NeedsAttention from "@/components/dashboard/needs-attention";
import ActivityFeed from "@/components/dashboard/activity-feed";
import { statsData } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            New Agreement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NeedsAttention />
        <ActivityFeed />
      </div>
    </div>
  );
}
