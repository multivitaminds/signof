"use client";

import Link from "next/link";
import Avatar from "@/components/ui/avatar";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import AgreementStatusBadge from "@/components/agreements/agreement-status-badge";
import { formatRelativeDate } from "@/lib/utils";
import type { Agreement } from "@/lib/types";
import { MoreHorizontal, Eye, Download, Trash2 } from "lucide-react";

interface AgreementRowProps {
  agreement: Agreement;
}

export default function AgreementRow({ agreement }: AgreementRowProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <Link
        href={`/agreements/${agreement.id}`}
        className="flex-1 min-w-0 flex items-center gap-4"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {agreement.title}
          </p>
          {agreement.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {agreement.description}
            </p>
          )}
        </div>

        <div className="flex -space-x-2 shrink-0">
          {agreement.parties.slice(0, 3).map((party) => (
            <Avatar
              key={party.id}
              name={party.name}
              src={party.avatarUrl}
              size="sm"
              className="ring-2 ring-surface"
            />
          ))}
          {agreement.parties.length > 3 && (
            <div className="h-7 w-7 rounded-full bg-muted text-xs font-medium flex items-center justify-center ring-2 ring-surface text-muted-foreground">
              +{agreement.parties.length - 3}
            </div>
          )}
        </div>

        <AgreementStatusBadge status={agreement.status} />

        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 w-20 text-right">
          {formatRelativeDate(agreement.updatedAt)}
        </span>
      </Link>

      <DropdownMenu
        align="right"
        trigger={
          <button className="p-1 rounded-[var(--radius-md)] hover:bg-muted transition-colors">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        }
      >
        <DropdownItem onClick={() => {}}>
          <Eye className="h-4 w-4" />
          View
        </DropdownItem>
        <DropdownItem onClick={() => {}}>
          <Download className="h-4 w-4" />
          Download
        </DropdownItem>
        <DropdownItem destructive onClick={() => {}}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownItem>
      </DropdownMenu>
    </div>
  );
}
