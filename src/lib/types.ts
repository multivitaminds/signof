export type AgreementStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "signed"
  | "expiring"
  | "expired";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "owner" | "admin" | "member";
  company?: string;
  jobTitle?: string;
}

export interface Party {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "signer" | "viewer" | "approver";
  signedAt?: string;
  viewedAt?: string;
}

export interface Agreement {
  id: string;
  title: string;
  status: AgreementStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  parties: Party[];
  createdBy: User;
  description?: string;
  tags?: string[];
}

export interface Activity {
  id: string;
  type: "created" | "sent" | "viewed" | "signed" | "commented" | "expired" | "reminder";
  message: string;
  timestamp: string;
  user: Pick<User, "id" | "name" | "avatarUrl">;
  agreementId?: string;
  agreementTitle?: string;
}

export interface StatsData {
  label: string;
  value: number;
  change?: number;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
