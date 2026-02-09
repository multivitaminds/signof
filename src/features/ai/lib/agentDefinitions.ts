import { AgentType } from '../types'
import type { AgentTypeDefinition } from '../types'

export const AGENT_DEFINITIONS: AgentTypeDefinition[] = [
  {
    type: AgentType.Planner,
    label: 'Planner',
    description: 'Breaks down complex tasks into actionable plans with clear milestones',
    icon: 'ClipboardList',
    color: '#4F46E5',
    defaultSteps: [
      { label: 'Analyzing requirements', durationMs: 2000 },
      { label: 'Identifying dependencies', durationMs: 1500 },
      { label: 'Creating task breakdown', durationMs: 2500 },
      { label: 'Setting milestones', durationMs: 1000 },
      { label: 'Finalizing plan', durationMs: 1500 },
    ],
  },
  {
    type: AgentType.Researcher,
    label: 'Researcher',
    description: 'Gathers information, analyzes data sources, and synthesizes findings',
    icon: 'Search',
    color: '#0891B2',
    defaultSteps: [
      { label: 'Defining research scope', durationMs: 1500 },
      { label: 'Gathering primary sources', durationMs: 3000 },
      { label: 'Analyzing data patterns', durationMs: 2500 },
      { label: 'Cross-referencing findings', durationMs: 2000 },
      { label: 'Compiling research brief', durationMs: 1500 },
    ],
  },
  {
    type: AgentType.Writer,
    label: 'Writer',
    description: 'Creates clear, structured content from drafts to polished documents',
    icon: 'PenTool',
    color: '#7C3AED',
    defaultSteps: [
      { label: 'Outlining structure', durationMs: 1500 },
      { label: 'Writing first draft', durationMs: 3000 },
      { label: 'Refining language', durationMs: 2000 },
      { label: 'Adding details and examples', durationMs: 2500 },
      { label: 'Final polish', durationMs: 1000 },
    ],
  },
  {
    type: AgentType.Analyst,
    label: 'Analyst',
    description: 'Processes data, identifies trends, and generates actionable insights',
    icon: 'BarChart3',
    color: '#059669',
    defaultSteps: [
      { label: 'Collecting data points', durationMs: 2000 },
      { label: 'Running statistical analysis', durationMs: 2500 },
      { label: 'Identifying trends', durationMs: 2000 },
      { label: 'Generating visualizations', durationMs: 1500 },
      { label: 'Preparing insights report', durationMs: 1500 },
    ],
  },
  {
    type: AgentType.Designer,
    label: 'Designer',
    description: 'Creates wireframes, prototypes, and visual design specifications',
    icon: 'Palette',
    color: '#EC4899',
    defaultSteps: [
      { label: 'Reviewing design requirements', durationMs: 1500 },
      { label: 'Sketching wireframes', durationMs: 2500 },
      { label: 'Creating high-fidelity mockups', durationMs: 3000 },
      { label: 'Defining design tokens', durationMs: 1500 },
      { label: 'Preparing design handoff', durationMs: 1000 },
    ],
  },
  {
    type: AgentType.Developer,
    label: 'Developer',
    description: 'Implements features, writes code, and handles technical architecture',
    icon: 'Code2',
    color: '#F59E0B',
    defaultSteps: [
      { label: 'Setting up project structure', durationMs: 1500 },
      { label: 'Implementing core logic', durationMs: 3000 },
      { label: 'Writing unit tests', durationMs: 2000 },
      { label: 'Integrating components', durationMs: 2500 },
      { label: 'Running build checks', durationMs: 1000 },
      { label: 'Code cleanup', durationMs: 1000 },
    ],
  },
  {
    type: AgentType.Reviewer,
    label: 'Reviewer',
    description: 'Reviews work quality, checks for issues, and provides feedback',
    icon: 'CheckSquare',
    color: '#DC2626',
    defaultSteps: [
      { label: 'Reviewing requirements compliance', durationMs: 2000 },
      { label: 'Checking code quality', durationMs: 2500 },
      { label: 'Testing edge cases', durationMs: 2000 },
      { label: 'Writing review comments', durationMs: 1500 },
    ],
  },
  {
    type: AgentType.Coordinator,
    label: 'Coordinator',
    description: 'Orchestrates team workflow, manages handoffs, and ensures alignment',
    icon: 'Users',
    color: '#6366F1',
    defaultSteps: [
      { label: 'Assessing team readiness', durationMs: 1500 },
      { label: 'Distributing tasks', durationMs: 1000 },
      { label: 'Monitoring progress', durationMs: 2000 },
      { label: 'Resolving blockers', durationMs: 2000 },
      { label: 'Compiling team report', durationMs: 1500 },
    ],
  },
]

export function getDefinition(type: AgentType): AgentTypeDefinition | undefined {
  return AGENT_DEFINITIONS.find(d => d.type === type)
}
