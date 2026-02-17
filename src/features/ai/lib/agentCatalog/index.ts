import { registerAgent } from '../agentRegistry'
import { AGENTS as accountingAgents } from './accounting'
import { AGENTS as projectsAgents } from './projects'
import { AGENTS as workspaceAgents } from './workspace'
import { AGENTS as schedulingAgents } from './scheduling'
import { AGENTS as databasesAgents } from './databases'
import { AGENTS as documentsAgents } from './documents'
import { AGENTS as taxAgents } from './tax'
import { AGENTS as inboxAgents } from './inbox'
import { AGENTS as developerAgents } from './developer'
import { AGENTS as communicationAgents } from './communication'
import { AGENTS as securityAgents } from './security'
import { AGENTS as analyticsAgents } from './analytics'
import { AGENTS as crossModuleAgents } from './crossModule'

const ALL_CATALOGS = [
  accountingAgents,
  projectsAgents,
  workspaceAgents,
  schedulingAgents,
  databasesAgents,
  documentsAgents,
  taxAgents,
  inboxAgents,
  developerAgents,
  communicationAgents,
  securityAgents,
  analyticsAgents,
  crossModuleAgents,
]

export function registerAllAgents(): void {
  for (const catalog of ALL_CATALOGS) {
    for (const agent of catalog) {
      registerAgent(agent)
    }
  }
}

export const TOTAL_AGENT_COUNT = ALL_CATALOGS.reduce((sum, c) => sum + c.length, 0)
