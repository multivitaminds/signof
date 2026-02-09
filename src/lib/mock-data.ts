import type { Agreement, Activity, User, StatsData } from "./types";

export const currentUser: User = {
  id: "u1",
  name: "Sam Lightson",
  email: "sam@signof.io",
  role: "owner",
  company: "SignOf",
  jobTitle: "Founder",
};

const users: Record<string, User> = {
  u1: currentUser,
  u2: { id: "u2", name: "Maria Chen", email: "maria@acme.co", role: "member", company: "Acme Corp" },
  u3: { id: "u3", name: "David Park", email: "david@venturelaw.com", role: "member", company: "Venture Law" },
  u4: { id: "u4", name: "Priya Sharma", email: "priya@designco.io", role: "member", company: "DesignCo" },
  u5: { id: "u5", name: "Alex Rivera", email: "alex@startup.inc", role: "admin", company: "Startup Inc" },
  u6: { id: "u6", name: "Jenna Torres", email: "jenna@signof.io", role: "member", company: "SignOf" },
};

export const agreements: Agreement[] = [
  {
    id: "1",
    title: "Series A Term Sheet",
    status: "signed",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-28T14:30:00Z",
    parties: [
      { id: "p1", name: "Sam Lightson", email: "sam@signof.io", role: "signer", signedAt: "2026-01-20T09:00:00Z" },
      { id: "p2", name: "Maria Chen", email: "maria@acme.co", role: "signer", signedAt: "2026-01-28T14:30:00Z" },
    ],
    createdBy: users.u1,
    description: "Series A investment term sheet for SignOf platform",
    tags: ["investment", "legal"],
  },
  {
    id: "2",
    title: "NDA - Acme Partnership",
    status: "sent",
    createdAt: "2026-02-01T09:00:00Z",
    updatedAt: "2026-02-01T09:00:00Z",
    parties: [
      { id: "p3", name: "Sam Lightson", email: "sam@signof.io", role: "signer", signedAt: "2026-02-01T10:00:00Z" },
      { id: "p4", name: "David Park", email: "david@venturelaw.com", role: "signer" },
    ],
    createdBy: users.u1,
    description: "Non-disclosure agreement for potential Acme partnership",
    tags: ["nda", "partnership"],
  },
  {
    id: "3",
    title: "Freelance Design Contract",
    status: "viewed",
    createdAt: "2026-02-03T11:00:00Z",
    updatedAt: "2026-02-05T16:20:00Z",
    parties: [
      { id: "p5", name: "Sam Lightson", email: "sam@signof.io", role: "signer" },
      { id: "p6", name: "Priya Sharma", email: "priya@designco.io", role: "signer", viewedAt: "2026-02-05T16:20:00Z" },
    ],
    createdBy: users.u1,
    description: "Contract for brand redesign project",
    tags: ["freelance", "design"],
  },
  {
    id: "4",
    title: "SaaS Subscription Agreement",
    status: "draft",
    createdAt: "2026-02-06T14:00:00Z",
    updatedAt: "2026-02-06T14:00:00Z",
    parties: [
      { id: "p7", name: "Sam Lightson", email: "sam@signof.io", role: "signer" },
    ],
    createdBy: users.u1,
    description: "Enterprise subscription agreement template",
    tags: ["saas", "template"],
  },
  {
    id: "5",
    title: "Office Lease Renewal",
    status: "expiring",
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2026-02-01T08:00:00Z",
    expiresAt: "2026-02-15T00:00:00Z",
    parties: [
      { id: "p8", name: "Sam Lightson", email: "sam@signof.io", role: "signer" },
      { id: "p9", name: "Alex Rivera", email: "alex@startup.inc", role: "approver" },
    ],
    createdBy: users.u5,
    description: "Annual office lease renewal for HQ",
    tags: ["lease", "urgent"],
  },
  {
    id: "6",
    title: "Consulting Agreement - Q1",
    status: "signed",
    createdAt: "2026-01-05T08:00:00Z",
    updatedAt: "2026-01-12T11:00:00Z",
    parties: [
      { id: "p10", name: "Jenna Torres", email: "jenna@signof.io", role: "signer", signedAt: "2026-01-10T09:00:00Z" },
      { id: "p11", name: "David Park", email: "david@venturelaw.com", role: "signer", signedAt: "2026-01-12T11:00:00Z" },
    ],
    createdBy: users.u6,
    description: "Q1 consulting engagement with Venture Law",
    tags: ["consulting"],
  },
  {
    id: "7",
    title: "Employment Offer - Senior Engineer",
    status: "sent",
    createdAt: "2026-02-04T10:00:00Z",
    updatedAt: "2026-02-04T10:00:00Z",
    parties: [
      { id: "p12", name: "Sam Lightson", email: "sam@signof.io", role: "approver" },
      { id: "p13", name: "Alex Rivera", email: "alex@startup.inc", role: "signer" },
    ],
    createdBy: users.u1,
    description: "Offer letter for senior full-stack engineer position",
    tags: ["hr", "offer"],
  },
  {
    id: "8",
    title: "Vendor Services Agreement",
    status: "expired",
    createdAt: "2025-09-15T10:00:00Z",
    updatedAt: "2025-12-15T00:00:00Z",
    expiresAt: "2025-12-15T00:00:00Z",
    parties: [
      { id: "p14", name: "Sam Lightson", email: "sam@signof.io", role: "signer", signedAt: "2025-09-20T10:00:00Z" },
      { id: "p15", name: "Maria Chen", email: "maria@acme.co", role: "signer", signedAt: "2025-09-22T14:00:00Z" },
    ],
    createdBy: users.u2,
    description: "Annual vendor services contract - needs renewal",
    tags: ["vendor", "expired"],
  },
  {
    id: "9",
    title: "Brand Partnership MOU",
    status: "draft",
    createdAt: "2026-02-07T09:00:00Z",
    updatedAt: "2026-02-07T09:00:00Z",
    parties: [
      { id: "p16", name: "Sam Lightson", email: "sam@signof.io", role: "signer" },
      { id: "p17", name: "Priya Sharma", email: "priya@designco.io", role: "viewer" },
    ],
    createdBy: users.u1,
    description: "Memorandum of understanding for co-branding initiative",
    tags: ["partnership", "branding"],
  },
  {
    id: "10",
    title: "Data Processing Agreement",
    status: "signed",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-25T16:00:00Z",
    parties: [
      { id: "p18", name: "Jenna Torres", email: "jenna@signof.io", role: "signer", signedAt: "2026-01-22T10:00:00Z" },
      { id: "p19", name: "Maria Chen", email: "maria@acme.co", role: "signer", signedAt: "2026-01-25T16:00:00Z" },
    ],
    createdBy: users.u6,
    description: "GDPR-compliant data processing agreement",
    tags: ["compliance", "gdpr"],
  },
];

export const activities: Activity[] = [
  {
    id: "a1",
    type: "signed",
    message: "Maria Chen signed Series A Term Sheet",
    timestamp: "2026-01-28T14:30:00Z",
    user: { id: "u2", name: "Maria Chen" },
    agreementId: "1",
    agreementTitle: "Series A Term Sheet",
  },
  {
    id: "a2",
    type: "sent",
    message: "You sent NDA - Acme Partnership for signature",
    timestamp: "2026-02-01T09:00:00Z",
    user: { id: "u1", name: "Sam Lightson" },
    agreementId: "2",
    agreementTitle: "NDA - Acme Partnership",
  },
  {
    id: "a3",
    type: "viewed",
    message: "Priya Sharma viewed Freelance Design Contract",
    timestamp: "2026-02-05T16:20:00Z",
    user: { id: "u4", name: "Priya Sharma" },
    agreementId: "3",
    agreementTitle: "Freelance Design Contract",
  },
  {
    id: "a4",
    type: "created",
    message: "You created SaaS Subscription Agreement",
    timestamp: "2026-02-06T14:00:00Z",
    user: { id: "u1", name: "Sam Lightson" },
    agreementId: "4",
    agreementTitle: "SaaS Subscription Agreement",
  },
  {
    id: "a5",
    type: "reminder",
    message: "Reminder sent to Alex Rivera for Office Lease Renewal",
    timestamp: "2026-02-07T08:00:00Z",
    user: { id: "u1", name: "Sam Lightson" },
    agreementId: "5",
    agreementTitle: "Office Lease Renewal",
  },
  {
    id: "a6",
    type: "sent",
    message: "You sent Employment Offer - Senior Engineer",
    timestamp: "2026-02-04T10:00:00Z",
    user: { id: "u1", name: "Sam Lightson" },
    agreementId: "7",
    agreementTitle: "Employment Offer - Senior Engineer",
  },
  {
    id: "a7",
    type: "created",
    message: "You created Brand Partnership MOU",
    timestamp: "2026-02-07T09:00:00Z",
    user: { id: "u1", name: "Sam Lightson" },
    agreementId: "9",
    agreementTitle: "Brand Partnership MOU",
  },
  {
    id: "a8",
    type: "expired",
    message: "Vendor Services Agreement has expired",
    timestamp: "2025-12-15T00:00:00Z",
    user: { id: "u2", name: "Maria Chen" },
    agreementId: "8",
    agreementTitle: "Vendor Services Agreement",
  },
];

export const statsData: StatsData[] = [
  { label: "Total Agreements", value: 10, change: 12, icon: "file-text" },
  { label: "Awaiting Signature", value: 3, change: -5, icon: "clock" },
  { label: "Signed This Month", value: 2, change: 25, icon: "check-circle" },
  { label: "Expiring Soon", value: 1, icon: "alert-triangle" },
];

export function getAgreementById(id: string): Agreement | undefined {
  return agreements.find((a) => a.id === id);
}

export function getActivitiesForAgreement(agreementId: string): Activity[] {
  return activities.filter((a) => a.agreementId === agreementId);
}
