import {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  Circle, Loader2, CheckCircle2, XCircle,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
  BookOpen, Home, Heart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AGENT_DEFINITIONS } from './agentDefinitions'
import { StepStatus, RunStatus, AgentCategory, AgentType } from '../types'

// ─── Icon Mapping ─────────────────────────────────────────────────

export const ICON_MAP: Record<string, LucideIcon> = {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
}

export const DOMAIN_ICON: Record<string, LucideIcon> = {
  work: ClipboardList,
  finance: DollarSign,
  health: Heart,
  learning: BookOpen,
  relationships: Users,
  home: Home,
  creativity: Palette,
  business: TrendingUp,
  travel: Globe,
  legal: Scale,
  parenting: UserPlus,
  wellness: HeartHandshake,
  developer: Code2,
}

export const DOMAIN_AGENT_TYPE: Record<string, AgentType> = {
  work: AgentType.Planner,
  finance: AgentType.Finance,
  health: AgentType.Researcher,
  learning: AgentType.Researcher,
  relationships: AgentType.Coordinator,
  home: AgentType.Planner,
  creativity: AgentType.Designer,
  business: AgentType.Sales,
  travel: AgentType.Planner,
  legal: AgentType.Legal,
  parenting: AgentType.Planner,
  wellness: AgentType.Researcher,
  developer: AgentType.Developer,
}

export function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Circle
}

// ─── Category Config ──────────────────────────────────────────────

export interface CategoryTab {
  key: string
  label: string
  count: number
}

export function buildCategoryTabs(): CategoryTab[] {
  const counts: Record<string, number> = {}
  for (const d of AGENT_DEFINITIONS) {
    counts[d.category] = (counts[d.category] ?? 0) + 1
  }
  return [
    { key: 'all', label: 'All', count: AGENT_DEFINITIONS.length },
    { key: AgentCategory.Business, label: 'Business', count: counts[AgentCategory.Business] ?? 0 },
    { key: AgentCategory.Creative, label: 'Creative', count: counts[AgentCategory.Creative] ?? 0 },
    { key: AgentCategory.Technical, label: 'Technical', count: counts[AgentCategory.Technical] ?? 0 },
    { key: AgentCategory.People, label: 'People', count: counts[AgentCategory.People] ?? 0 },
    { key: AgentCategory.Legal, label: 'Legal', count: counts[AgentCategory.Legal] ?? 0 },
    { key: AgentCategory.Core, label: 'Core', count: counts[AgentCategory.Core] ?? 0 },
    { key: 'favorites', label: 'Favorites', count: 0 },
  ]
}

// ─── Step Status Icons ────────────────────────────────────────────

export const STEP_ICON: Record<StepStatus, LucideIcon> = {
  [StepStatus.Pending]: Circle,
  [StepStatus.Running]: Loader2,
  [StepStatus.Completed]: CheckCircle2,
  [StepStatus.Error]: XCircle,
}

export const STEP_CLASS: Record<StepStatus, string> = {
  [StepStatus.Pending]: 'copilot-agents__step-icon--pending',
  [StepStatus.Running]: 'copilot-agents__step-icon--running',
  [StepStatus.Completed]: 'copilot-agents__step-icon--completed',
  [StepStatus.Error]: 'copilot-agents__step-icon--error',
}

export const RUN_STATUS_VARIANT: Record<RunStatus, 'primary' | 'warning' | 'success' | 'danger' | 'default'> = {
  [RunStatus.Running]: 'primary',
  [RunStatus.Paused]: 'warning',
  [RunStatus.Completed]: 'success',
  [RunStatus.Cancelled]: 'default',
  [RunStatus.Failed]: 'danger',
}

// ─── Helpers ──────────────────────────────────────────────────────

export function formatDuration(startedAt: string, completedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diffMs = end - start
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}
