import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Target,
  BarChart3,
  Scale,
  Bug,
  Map,
  Ruler,
  Search,
  RefreshCw,
  Handshake,
  Building2,
  ClipboardList,
  Rocket,
  PenTool,
  BookOpen,
  Calendar,
  Zap,
  Users,
  FileCheck,
  Lightbulb,
} from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  'file-text': FileText,
  'target': Target,
  'bar-chart': BarChart3,
  'scale': Scale,
  'bug': Bug,
  'map': Map,
  'ruler': Ruler,
  'search': Search,
  'refresh-cw': RefreshCw,
  'handshake': Handshake,
  'building': Building2,
  'clipboard-list': ClipboardList,
  'rocket': Rocket,
  'edit': PenTool,
  'book-open': BookOpen,
  'calendar': Calendar,
  'sprint': Zap,
  'users': Users,
  'file-check': FileCheck,
  'lightbulb': Lightbulb,
}

export function getIconComponent(name: string): LucideIcon | null {
  return ICON_MAP[name] ?? null
}

export function isEmojiIcon(icon: string): boolean {
  return icon.length <= 4 && !/^[a-zA-Z0-9_-]+$/.test(icon)
}
