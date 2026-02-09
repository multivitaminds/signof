"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/layout/page-header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import AgreementStatusBadge from "@/components/agreements/agreement-status-badge";
import AgreementTimeline from "@/components/agreements/agreement-timeline";
import AgreementParties from "@/components/agreements/agreement-parties";
import { getAgreementById, getActivitiesForAgreement } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";

export default function AgreementDetailPage() {
  const params = useParams<{ id: string }>();
  const agreement = getAgreementById(params.id);
  const activities = agreement ? getActivitiesForAgreement(agreement.id) : [];

  if (!agreement) {
    return (
      <div className="space-y-6">
        <Link
          href="/agreements"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agreements
        </Link>
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="Agreement not found"
          description="The agreement you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/agreements"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agreements
      </Link>

      <PageHeader
        title={agreement.title}
        actions={<AgreementStatusBadge status={agreement.status} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {agreement.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{agreement.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                  <p className="text-sm text-foreground">{formatDate(agreement.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm text-foreground">{formatDate(agreement.updatedAt)}</p>
                </div>
                {agreement.expiresAt && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Expires</p>
                    <p className="text-sm text-foreground">{formatDate(agreement.expiresAt)}</p>
                  </div>
                )}
              </div>
              {agreement.tags && agreement.tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agreement.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Parties</h2>
            </CardHeader>
            <CardContent>
              <AgreementParties parties={agreement.parties} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Activity</h2>
            </CardHeader>
            <CardContent>
              <AgreementTimeline activities={activities} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
