import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Party } from "@/lib/types";

interface AgreementPartiesProps {
  parties: Party[];
}

export default function AgreementParties({ parties }: AgreementPartiesProps) {
  return (
    <div className="space-y-3">
      {parties.map((party) => (
        <div key={party.id} className="flex items-center gap-3">
          <Avatar name={party.name} src={party.avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {party.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {party.email}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="capitalize text-xs">
              {party.role}
            </Badge>
            {party.signedAt ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                Signed {formatDate(party.signedAt)}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Awaiting signature
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
