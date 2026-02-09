import Badge from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/constants";
import type { AgreementStatus } from "@/lib/types";

interface AgreementStatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

export default function AgreementStatusBadge({ status, className }: AgreementStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.className} ${className ?? ""}`}>
      {config.label}
    </Badge>
  );
}
