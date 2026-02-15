import { useState, useMemo } from 'react'
import useAgentRuntimeStore from '../stores/useAgentRuntimeStore'
import useMessageBusStore from '../stores/useMessageBusStore'
import useRepairStore from '../stores/useRepairStore'
import AgentMonitorDashboard from '../components/AgentMonitorDashboard/AgentMonitorDashboard'
import ApprovalQueue from '../components/ApprovalQueue/ApprovalQueue'
import MessageBusInspector from '../components/MessageBusInspector/MessageBusInspector'
import RepairHistoryPanel from '../components/RepairHistoryPanel/RepairHistoryPanel'
import './AgentOpsPage.css'

type OpsTab = 'monitor' | 'approvals' | 'messages' | 'repairs'

export default function AgentOpsPage() {
  const [activeTab, setActiveTab] = useState<OpsTab>('monitor')

  const deployedAgents = useAgentRuntimeStore((s) => s.deployedAgents)
  const approvalQueue = useAgentRuntimeStore((s) => s.approvalQueue)
  const approveAction = useAgentRuntimeStore((s) => s.approveAction)
  const rejectAction = useAgentRuntimeStore((s) => s.rejectAction)
  const messages = useMessageBusStore((s) => s.messages)
  const topics = useMessageBusStore((s) => s.getTopics)
  const repairs = useRepairStore((s) => s.repairs)
  const successRate = useRepairStore((s) => s.getSuccessRate)

  const agentsList = useMemo(() => Array.from(deployedAgents.values()), [deployedAgents])
  const topicsList = useMemo(() => topics(), [topics])

  const tabs: Array<{ key: OpsTab; label: string; count: number }> = [
    { key: 'monitor', label: 'Monitor', count: agentsList.length },
    { key: 'approvals', label: 'Approvals', count: approvalQueue.length },
    { key: 'messages', label: 'Messages', count: messages.length },
    { key: 'repairs', label: 'Repairs', count: repairs.length },
  ]

  return (
    <div className="agent-ops">
      <div className="agent-ops__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`agent-ops__tab${activeTab === tab.key ? ' agent-ops__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="agent-ops__tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="agent-ops__content">
        {activeTab === 'monitor' && (
          <AgentMonitorDashboard agents={agentsList} />
        )}
        {activeTab === 'approvals' && (
          <ApprovalQueue
            approvals={approvalQueue}
            onApprove={approveAction}
            onReject={rejectAction}
          />
        )}
        {activeTab === 'messages' && (
          <MessageBusInspector
            messages={messages}
            topics={topicsList}
          />
        )}
        {activeTab === 'repairs' && (
          <RepairHistoryPanel
            repairs={repairs}
            successRate={successRate()}
          />
        )}
      </div>
    </div>
  )
}
