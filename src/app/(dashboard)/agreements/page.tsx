"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/page-header";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import AgreementFilters from "@/components/agreements/agreement-filters";
import AgreementRow from "@/components/agreements/agreement-row";
import { agreements } from "@/lib/mock-data";
import type { AgreementStatus } from "@/lib/types";
import { FileText } from "lucide-react";

export default function AgreementsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let result = [...agreements];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.title.toLowerCase().includes(q)
      );
    }

    if (status !== "all") {
      result = result.filter((a) => a.status === (status as AgreementStatus));
    }

    result.sort((a, b) => {
      if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.title.localeCompare(b.title);
    });

    return result;
  }, [search, status, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agreements"
        description="Manage and track all your agreements"
        actions={
          <Link href="/agreements/new">
            <Button>New Agreement</Button>
          </Link>
        }
      />

      <AgreementFilters
        search={search}
        status={status}
        sort={sort}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      {filtered.length > 0 ? (
        <Card>
          {filtered.map((agreement) => (
            <AgreementRow key={agreement.id} agreement={agreement} />
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No agreements found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      )}
    </div>
  );
}
