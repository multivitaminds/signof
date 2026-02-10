export const TeamRole = {
  Owner: 'owner',
  Admin: 'admin',
  Member: 'member',
  Guest: 'guest',
} as const

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole]

export const ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  guest: 'Guest',
}

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: 'Full access, billing, and team management',
  admin: 'Full access except billing and ownership transfer',
  member: 'Can view and edit all content',
  guest: 'Limited access to shared content only',
}

export const InviteStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
  Expired: 'expired',
} as const

export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus]

export const MemberStatus = {
  Active: 'active',
  Invited: 'invited',
  Deactivated: 'deactivated',
} as const

export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus]

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  avatarUrl?: string
  joinedAt: string
  lastActiveAt: string
  status: MemberStatus
}

export interface TeamInvite {
  id: string
  email: string
  role: TeamRole
  invitedBy: string
  invitedAt: string
  expiresAt: string
  status: InviteStatus
}

export const ActivityAction = {
  MemberJoined: 'member_joined',
  RoleChanged: 'role_changed',
  MemberRemoved: 'member_removed',
  MemberDeactivated: 'member_deactivated',
  MemberReactivated: 'member_reactivated',
  InviteSent: 'invite_sent',
  InviteCancelled: 'invite_cancelled',
  InviteResent: 'invite_resent',
} as const

export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction]

export interface TeamActivity {
  id: string
  action: ActivityAction
  description: string
  timestamp: string
  actorName?: string
}

export interface Team {
  id: string
  name: string
  members: TeamMember[]
  invites: TeamInvite[]
  activities: TeamActivity[]
  createdAt: string
}
