import type { LucideProps } from 'lucide-react'
import { ICON_MAP } from './iconMap'

/**
 * Pre-built icon component that resolves an icon name from the ICON_MAP.
 * Use this instead of getIconComponent() in JSX to avoid the
 * "cannot create components during render" lint error.
 */
export default function MappedIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICON_MAP[name]
  if (!Icon) return null
  return <Icon {...props} />
}
