import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  Play, Pause, Square, MessageSquare,
  ChevronDown, ChevronUp, ChevronRight, Plus,
  CheckCircle2, Loader2, Circle, XCircle, Clock,
  Eye, Star, Zap,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
  BookOpen, Home, Heart,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../../../components/ui'
import useAIAgentStore, { getStepOutput } from '../stores/useAIAgentStore'
import usePipelineStore from '../stores/usePipelineStore'
import useCanvasStore from '../stores/useCanvasStore'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'
import { MARKETPLACE_DOMAINS, TOTAL_MARKETPLACE_AGENTS } from '../data/marketplaceAgents'
import { WORKFLOW_TEMPLATES } from '../lib/workflowTemplates'
import { RunStatus, StepStatus, AgentCategory, NodeStatus, AgentType } from '../types'
import type { AgentRun, RunStep } from '../types'
import OrchestratorInput from '../components/OrchestratorInput/OrchestratorInput'
import PipelineBuilder from '../components/PipelineBuilder/PipelineBuilder'
import PipelineView from '../components/PipelineView/PipelineView'
import TemplateCard from '../components/TemplateCard/TemplateCard'
import RunResultsModal from '../components/RunResultsModal/RunResultsModal'
import WorkflowCanvas from '../components/WorkflowCanvas/WorkflowCanvas'
import CanvasControls from '../components/CanvasControls/CanvasControls'
import CanvasTopBar from '../components/CanvasTopBar/CanvasTopBar'
import NodePicker from '../components/NodePicker/NodePicker'
import NodeConfigPanel from '../components/NodeConfigPanel/NodeConfigPanel'
import ExecutionOverlay from '../components/ExecutionOverlay/ExecutionOverlay'
import type { WorkflowTemplate } from '../lib/workflowTemplates'
import './AIAgentsPage.css'

// ─── Icon Mapping ─────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Search, PenTool, Code2, Palette, BarChart3,
  ClipboardList, Users, CheckSquare,
  TrendingUp, Megaphone, DollarSign, Scale, ShieldCheck,
  UserPlus, HeartHandshake, Languages, Globe, Share2,
  Shield, Server,
}

const DOMAIN_ICON: Record<string, LucideIcon> = {
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

const DOMAIN_AGENT_TYPE: Record<string, AgentType> = {
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

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Circle
}

// ─── Category Config ──────────────────────────────────────────────

interface CategoryTab {
  key: string
  label: string
  count: number
}

function buildCategoryTabs(): CategoryTab[] {
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

const STEP_ICON: Record<StepStatus, LucideIcon> = {
  [StepStatus.Pending]: Circle,
  [StepStatus.Running]: Loader2,
  [StepStatus.Completed]: CheckCircle2,
  [StepStatus.Error]: XCircle,
}

const STEP_CLASS: Record<StepStatus, string> = {
  [StepStatus.Pending]: 'copilot-agents__step-icon--pending',
  [StepStatus.Running]: 'copilot-agents__step-icon--running',
  [StepStatus.Completed]: 'copilot-agents__step-icon--completed',
  [StepStatus.Error]: 'copilot-agents__step-icon--error',
}

const RUN_STATUS_VARIANT: Record<RunStatus, 'primary' | 'warning' | 'success' | 'danger' | 'default'> = {
  [RunStatus.Running]: 'primary',
  [RunStatus.Paused]: 'warning',
  [RunStatus.Completed]: 'success',
  [RunStatus.Cancelled]: 'default',
  [RunStatus.Failed]: 'danger',
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatDuration(startedAt: string, completedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diffMs = end - start
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

function formatRelativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

// ─── Component ─────────────────────────────────────────────────────

export default function AIAgentsPage() {
  const runs = useAIAgentStore((s) => s.runs)
  const lastRunByAgent = useAIAgentStore((s) => s.lastRunByAgent)
  const favorites = useAIAgentStore((s) => s.favorites)
  const startAgent = useAIAgentStore((s) => s.startAgent)
  const updateRunStep = useAIAgentStore((s) => s.updateRunStep)
  const cancelRun = useAIAgentStore((s) => s.cancelRun)
  const pauseRun = useAIAgentStore((s) => s.pauseRun)
  const resumeRun = useAIAgentStore((s) => s.resumeRun)
  const toggleFavorite = useAIAgentStore((s) => s.toggleFavorite)

  const pipelines = usePipelineStore((s) => s.pipelines)
  const pipelinePause = usePipelineStore((s) => s.pausePipeline)
  const pipelineResume = usePipelineStore((s) => s.resumePipeline)
  const pipelineCancel = usePipelineStore((s) => s.cancelPipeline)
  const pipelineCreate = usePipelineStore((s) => s.createPipeline)
  const pipelineRun = usePipelineStore((s) => s.runPipeline)

  // Canvas store
  const canvasNodes = useCanvasStore((s) => s.nodes)
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId)
  const addNode = useCanvasStore((s) => s.addNode)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const selectNode = useCanvasStore((s) => s.selectNode)
  const toPipelineStages = useCanvasStore((s) => s.toPipelineStages)
  const resetExecution = useCanvasStore((s) => s.resetExecution)
  const loadFromTemplate = useCanvasStore((s) => s.loadFromTemplate)
  const updateNodeStatus = useCanvasStore((s) => s.updateNodeStatus)
  const updateConnectionStatus = useCanvasStore((s) => s.updateConnectionStatus)
  const canvasConnections = useCanvasStore((s) => s.connections)

  const [runTaskInputs, setRunTaskInputs] = useState<Record<string, string>>({})
  const [showHistory, setShowHistory] = useState(false)
  const [chatRunId, setChatRunId] = useState<string | null>(null)
  const [viewResultRunId, setViewResultRunId] = useState<string | null>(null)
  const simulationTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // View state
  const [activeTab, setActiveTab] = useState<'canvas' | 'agents' | 'pipelines' | 'templates'>('canvas')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showPipelineBuilder, setShowPipelineBuilder] = useState(false)
  const [builderInitialStages, setBuilderInitialStages] = useState<Array<{ agentType: AgentType; task: string }> | undefined>()
  const [builderTemplateName, setBuilderTemplateName] = useState<string | undefined>()
  const [builderTemplateDesc, setBuilderTemplateDesc] = useState<string | undefined>()

  // Marketplace state
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set())

  // Canvas state
  const [showNodePicker, setShowNodePicker] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const selectedNode = useMemo(
    () => selectedNodeId ? canvasNodes.find(n => n.id === selectedNodeId) ?? null : null,
    [selectedNodeId, canvasNodes],
  )

  // Clean up timers on unmount
  useEffect(() => {
    const timers = simulationTimers.current
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
    }
  }, [])

  // Category tabs with dynamic favorite count
  const categoryTabs = useMemo(() => {
    const tabs = buildCategoryTabs()
    const favTab = tabs.find(t => t.key === 'favorites')
    if (favTab) favTab.count = favorites.length
    return tabs
  }, [favorites])

  // Filtered agents
  const filteredAgents = useMemo(() => {
    let agents = AGENT_DEFINITIONS
    if (activeCategory === 'favorites') {
      agents = agents.filter(a => favorites.includes(a.type))
    } else if (activeCategory !== 'all') {
      agents = agents.filter(a => a.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      agents = agents.filter(a =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.useCases.some(u => u.toLowerCase().includes(q))
      )
    }
    return agents
  }, [activeCategory, searchQuery, favorites])

  // Filtered marketplace domains (by search query)
  const filteredMarketplace = useMemo(() => {
    if (!searchQuery.trim()) return MARKETPLACE_DOMAINS
    const q = searchQuery.toLowerCase()
    return MARKETPLACE_DOMAINS.map(domain => {
      const matchingAgents = domain.agents.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.integrations.toLowerCase().includes(q)
      )
      if (matchingAgents.length === 0 && !domain.name.toLowerCase().includes(q)) return null
      return { ...domain, agents: matchingAgents.length > 0 ? matchingAgents : domain.agents, agentCount: matchingAgents.length > 0 ? matchingAgents.length : domain.agentCount }
    }).filter((d): d is NonNullable<typeof d> => d !== null)
  }, [searchQuery])

  const activeRuns = useMemo(
    () => runs.filter(r => r.status === RunStatus.Running || r.status === RunStatus.Paused),
    [runs],
  )

  const completedRuns = useMemo(
    () => runs.filter(r =>
      r.status === RunStatus.Completed ||
      r.status === RunStatus.Cancelled ||
      r.status === RunStatus.Failed
    ),
    [runs],
  )

  const viewingRun = useMemo(
    () => viewResultRunId ? runs.find(r => r.id === viewResultRunId) ?? null : null,
    [viewResultRunId, runs],
  )

  // Stats
  const stats = useMemo(() => {
    const totalRuns = runs.length
    const activePipelinesCount = pipelines.filter(p => p.status === 'running' || p.status === 'paused').length
    const completedRunsCount = runs.filter(r => r.status === RunStatus.Completed).length
    const successRate = totalRuns > 0 ? Math.round((completedRunsCount / totalRuns) * 100) : 100
    return { totalAgents: AGENT_DEFINITIONS.length + TOTAL_MARKETPLACE_AGENTS, totalRuns, activePipelines: activePipelinesCount, successRate }
  }, [runs, pipelines])

  // Active/completed pipelines
  const activePipelines = useMemo(
    () => pipelines.filter(p => p.status === 'running' || p.status === 'paused'),
    [pipelines],
  )

  const completedPipelines = useMemo(
    () => pipelines.filter(p => p.status === 'completed' || p.status === 'failed'),
    [pipelines],
  )

  const simulateSteps = useCallback((run: AgentRun) => {
    let stepIndex = 0

    function processNextStep() {
      if (stepIndex >= run.steps.length) return

      updateRunStep(run.id, stepIndex, StepStatus.Running as typeof StepStatus.Running)

      const delay = 1000 + Math.random() * 2000
      const currentIndex = stepIndex
      const timerId = setTimeout(() => {
        const output = getStepOutput(run.agentType, currentIndex)
        updateRunStep(run.id, currentIndex, StepStatus.Completed as typeof StepStatus.Completed, output)
        stepIndex++
        if (stepIndex < run.steps.length) {
          processNextStep()
        }
        simulationTimers.current.delete(`${run.id}-${currentIndex}`)
      }, delay)

      simulationTimers.current.set(`${run.id}-${stepIndex}`, timerId)
    }

    processNextStep()
  }, [updateRunStep])

  const handleRun = useCallback((agentType: AgentType) => {
    const task = runTaskInputs[agentType] || `Default task for ${agentType}`
    const run = startAgent(agentType, task)
    setRunTaskInputs(prev => ({ ...prev, [agentType]: '' }))
    simulateSteps(run)
  }, [runTaskInputs, startAgent, simulateSteps])

  const handleMarketplaceRun = useCallback((domainId: string, agentName: string) => {
    const agentType = DOMAIN_AGENT_TYPE[domainId] ?? AgentType.Planner
    const run = startAgent(agentType, `${agentName}: Running marketplace agent simulation`)
    simulateSteps(run)
  }, [startAgent, simulateSteps])

  const handleTaskInputChange = useCallback((agentType: AgentType, value: string) => {
    setRunTaskInputs(prev => ({ ...prev, [agentType]: value }))
  }, [])

  const handlePause = useCallback((runId: string) => {
    pauseRun(runId)
    for (const [key, timer] of simulationTimers.current.entries()) {
      if (key.startsWith(runId)) {
        clearTimeout(timer)
        simulationTimers.current.delete(key)
      }
    }
  }, [pauseRun])

  const handleResume = useCallback((runId: string) => {
    resumeRun(runId)
    const run = runs.find(r => r.id === runId)
    if (run) {
      const nextPending = run.steps.findIndex(s => s.status === StepStatus.Pending || s.status === StepStatus.Running)
      if (nextPending >= 0) {
        const resumeRun_: AgentRun = { ...run, status: RunStatus.Running as typeof RunStatus.Running }
        simulateSteps(resumeRun_)
      }
    }
  }, [resumeRun, runs, simulateSteps])

  const handleCancel = useCallback((runId: string) => {
    cancelRun(runId)
    for (const [key, timer] of simulationTimers.current.entries()) {
      if (key.startsWith(runId)) {
        clearTimeout(timer)
        simulationTimers.current.delete(key)
      }
    }
  }, [cancelRun])

  const handleChat = useCallback((runId: string) => {
    setChatRunId(chatRunId === runId ? null : runId)
  }, [chatRunId])

  const toggleDomain = useCallback((domainId: string) => {
    setExpandedDomains(prev => {
      const next = new Set(prev)
      if (next.has(domainId)) next.delete(domainId)
      else next.add(domainId)
      return next
    })
  }, [])

  const toggleHistory = useCallback(() => {
    setShowHistory(prev => !prev)
  }, [])

  const handleViewResults = useCallback((runId: string) => {
    setViewResultRunId(runId)
  }, [])

  const handleCloseResults = useCallback(() => {
    setViewResultRunId(null)
  }, [])

  // Orchestrator handlers
  const handleOrchestratorSingle = useCallback((agentType: AgentType, task: string) => {
    const run = startAgent(agentType, task)
    simulateSteps(run)
  }, [startAgent, simulateSteps])

  const handleOrchestratorPipeline = useCallback((stages: Array<{ agentType: AgentType; task: string }>) => {
    const pipeline = pipelineCreate('Auto Pipeline', 'Created from orchestrator', stages)
    pipelineRun(pipeline.id)
  }, [pipelineCreate, pipelineRun])

  // Template handler
  const handleUseTemplate = useCallback((template: WorkflowTemplate) => {
    if (activeTab === 'canvas') {
      loadFromTemplate(template)
    } else {
      setBuilderInitialStages(template.stages.map(s => ({ agentType: s.agentType, task: s.defaultTask })))
      setBuilderTemplateName(template.name)
      setBuilderTemplateDesc(template.description)
      setShowPipelineBuilder(true)
    }
  }, [activeTab, loadFromTemplate])

  const handleOpenPipelineBuilder = useCallback(() => {
    setBuilderInitialStages(undefined)
    setBuilderTemplateName(undefined)
    setBuilderTemplateDesc(undefined)
    setShowPipelineBuilder(true)
  }, [])

  const handleClosePipelineBuilder = useCallback(() => {
    setShowPipelineBuilder(false)
  }, [])

  // ─── Canvas Handlers ──────────────────────────────────────────────

  const handleAddNode = useCallback((agentType: AgentType) => {
    const offsetX = 100 + canvasNodes.length * 250
    addNode(agentType, offsetX, 200)
  }, [canvasNodes.length, addNode])

  const handleRemoveNode = useCallback((nodeId: string) => {
    removeNode(nodeId)
  }, [removeNode])

  const handleTestStep = useCallback((nodeId: string) => {
    const node = canvasNodes.find(n => n.id === nodeId)
    if (!node) return
    updateNodeStatus(nodeId, NodeStatus.Running)
    const timerId = setTimeout(() => {
      updateNodeStatus(nodeId, NodeStatus.Completed, `${node.agentType} completed successfully`)
      simulationTimers.current.delete(`test-${nodeId}`)
    }, 2000)
    simulationTimers.current.set(`test-${nodeId}`, timerId)
  }, [canvasNodes, updateNodeStatus])

  const handleCloseConfig = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  const handleExecuteWorkflow = useCallback(() => {
    const stages = toPipelineStages()
    if (stages.length === 0) return

    setIsExecuting(true)
    let stepIdx = 0

    function runNextNode() {
      if (stepIdx >= canvasNodes.length) {
        setIsExecuting(false)
        return
      }

      const node = canvasNodes[stepIdx]
      if (!node) {
        setIsExecuting(false)
        return
      }
      updateNodeStatus(node.id, NodeStatus.Running)

      // Update connection to this node as running
      const incomingConn = canvasConnections.find(c => c.targetNodeId === node.id)
      if (incomingConn) updateConnectionStatus(incomingConn.id, NodeStatus.Running)

      const timerId = setTimeout(() => {
        updateNodeStatus(node.id, NodeStatus.Completed, `Output from ${node.agentType}`)
        if (incomingConn) updateConnectionStatus(incomingConn.id, NodeStatus.Completed)

        // Update outgoing connection
        const outgoingConn = canvasConnections.find(c => c.sourceNodeId === node.id)
        if (outgoingConn) updateConnectionStatus(outgoingConn.id, NodeStatus.Running)

        stepIdx++
        simulationTimers.current.delete(`exec-${node.id}`)
        runNextNode()
      }, 1500 + Math.random() * 1000)

      simulationTimers.current.set(`exec-${node.id}`, timerId)
    }

    runNextNode()
  }, [canvasNodes, canvasConnections, toPipelineStages, updateNodeStatus, updateConnectionStatus])

  const handleSaveWorkflow = useCallback(() => {
    const stages = toPipelineStages()
    if (stages.length > 0) {
      pipelineCreate(
        useCanvasStore.getState().workflowName,
        'Created from canvas',
        stages
      )
    }
  }, [toPipelineStages, pipelineCreate])

  const handleClearExecution = useCallback(() => {
    resetExecution()
  }, [resetExecution])

  return (
    <div className="copilot-agents">
      <div className="copilot-agents__header">
        <h2 className="copilot-agents__title">Agent Marketplace</h2>
        <p className="copilot-agents__subtitle">
          {AGENT_DEFINITIONS.length + TOTAL_MARKETPLACE_AGENTS}+ specialized agents across {MARKETPLACE_DOMAINS.length} domains
        </p>
      </div>

      {/* Orchestrator Input */}
      <OrchestratorInput
        onRunSingle={handleOrchestratorSingle}
        onRunPipeline={handleOrchestratorPipeline}
      />

      {/* Stats Bar */}
      <div className="copilot-agents__stats-bar" aria-label="Agent statistics">
        <div className="copilot-agents__stat-card">
          <span className="copilot-agents__stat-value">{stats.totalAgents}</span>
          <span className="copilot-agents__stat-label">Total Agents</span>
        </div>
        <div className="copilot-agents__stat-card">
          <span className="copilot-agents__stat-value">{stats.totalRuns}</span>
          <span className="copilot-agents__stat-label">Total Runs</span>
        </div>
        <div className="copilot-agents__stat-card">
          <span className="copilot-agents__stat-value">{stats.activePipelines}</span>
          <span className="copilot-agents__stat-label">Active Pipelines</span>
        </div>
        <div className="copilot-agents__stat-card">
          <span className="copilot-agents__stat-value">{stats.successRate}%</span>
          <span className="copilot-agents__stat-label">Success Rate</span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="copilot-agents__view-tabs" role="tablist" aria-label="View tabs">
        <button
          className={`copilot-agents__view-tab${activeTab === 'canvas' ? ' copilot-agents__view-tab--active' : ''}`}
          onClick={() => setActiveTab('canvas')}
          role="tab"
          aria-selected={activeTab === 'canvas'}
        >
          Canvas
        </button>
        <button
          className={`copilot-agents__view-tab${activeTab === 'agents' ? ' copilot-agents__view-tab--active' : ''}`}
          onClick={() => setActiveTab('agents')}
          role="tab"
          aria-selected={activeTab === 'agents'}
        >
          Agents ({AGENT_DEFINITIONS.length + TOTAL_MARKETPLACE_AGENTS})
        </button>
        <button
          className={`copilot-agents__view-tab${activeTab === 'pipelines' ? ' copilot-agents__view-tab--active' : ''}`}
          onClick={() => setActiveTab('pipelines')}
          role="tab"
          aria-selected={activeTab === 'pipelines'}
        >
          Pipelines ({pipelines.length})
        </button>
        <button
          className={`copilot-agents__view-tab${activeTab === 'templates' ? ' copilot-agents__view-tab--active' : ''}`}
          onClick={() => setActiveTab('templates')}
          role="tab"
          aria-selected={activeTab === 'templates'}
        >
          Templates ({WORKFLOW_TEMPLATES.length})
        </button>
      </div>

      {/* ─── CANVAS TAB ──────────────────────────────────────────── */}
      {activeTab === 'canvas' && (
        <div className="copilot-agents__canvas-wrapper">
          <CanvasTopBar
            onExecute={handleExecuteWorkflow}
            onSave={handleSaveWorkflow}
            isExecuting={isExecuting}
          />
          <div className="copilot-agents__canvas-area">
            <WorkflowCanvas />
            <CanvasControls />

            {!showNodePicker && !selectedNode && (
              <button
                className="copilot-agents__add-node-btn"
                onClick={() => setShowNodePicker(true)}
                aria-label="Add node"
              >
                <Plus size={14} />
                Add Node
              </button>
            )}

            <NodePicker
              isOpen={showNodePicker}
              onClose={() => setShowNodePicker(false)}
              onAddNode={handleAddNode}
            />

            {selectedNode && (
              <NodeConfigPanel
                node={selectedNode}
                onClose={handleCloseConfig}
                onTestStep={handleTestStep}
                onRemove={handleRemoveNode}
              />
            )}

            <ExecutionOverlay
              nodes={canvasNodes}
              onClear={handleClearExecution}
            />
          </div>
        </div>
      )}

      {/* ─── AGENTS TAB ──────────────────────────────────────────── */}
      {activeTab === 'agents' && (
        <>
          {/* Category Pills + Search */}
          <div className="copilot-agents__filters">
            <div className="copilot-agents__category-pills" role="tablist" aria-label="Agent categories">
              {categoryTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`copilot-agents__category-pill${activeCategory === tab.key ? ' copilot-agents__category-pill--active' : ''}`}
                  onClick={() => setActiveCategory(tab.key)}
                  role="tab"
                  aria-selected={activeCategory === tab.key}
                >
                  {tab.key === 'favorites' && <Star size={12} />}
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            <div className="copilot-agents__search-bar">
              <Search size={16} className="copilot-agents__search-icon" />
              <input
                className="copilot-agents__search-input"
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search agents"
              />
            </div>
          </div>

          {/* Featured Agents Header */}
          <div className="copilot-agents__featured-header">
            <h3 className="copilot-agents__featured-title">Featured Agents</h3>
            <span className="copilot-agents__featured-badge">Runnable</span>
          </div>

          {/* Agent Cards Grid */}
          <div className="copilot-agents__grid">
            {filteredAgents.map((agent) => {
              const IconComp = getIcon(agent.icon)
              const lastRun = lastRunByAgent[agent.type]
              const isFavorite = favorites.includes(agent.type)
              return (
                <div key={agent.type} className="copilot-agents__card" style={{ borderTopColor: agent.color }}>
                  <div className="copilot-agents__card-header">
                    <div className="copilot-agents__card-icon" style={{ color: agent.color }}>
                      <IconComp size={24} />
                    </div>
                    <div className="copilot-agents__card-info">
                      <div className="copilot-agents__card-name-row">
                        <h3 className="copilot-agents__card-name">{agent.label} Agent</h3>
                        <button
                          className={`copilot-agents__card-favorite${isFavorite ? ' copilot-agents__card-favorite--active' : ''}`}
                          onClick={() => toggleFavorite(agent.type)}
                          aria-label={isFavorite ? `Unfavorite ${agent.label}` : `Favorite ${agent.label}`}
                        >
                          <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <p className="copilot-agents__card-desc">{agent.description}</p>
                    </div>
                  </div>
                  <span className="copilot-agents__card-category-badge" style={{ color: agent.color, borderColor: agent.color }}>
                    {agent.category}
                  </span>
                  <div className="copilot-agents__card-input-row">
                    <input
                      className="copilot-agents__card-task-input"
                      type="text"
                      placeholder="Describe the task..."
                      value={runTaskInputs[agent.type] ?? ''}
                      onChange={(e) => handleTaskInputChange(agent.type, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRun(agent.type)
                      }}
                      aria-label={`Task for ${agent.label} Agent`}
                    />
                    <button
                      className="copilot-agents__run-btn"
                      onClick={() => handleRun(agent.type)}
                      style={{ backgroundColor: agent.color }}
                      aria-label={`Run ${agent.label} Agent`}
                    >
                      <Play size={14} />
                      Run
                    </button>
                  </div>
                  {lastRun && (
                    <span className="copilot-agents__card-last-run">
                      <Clock size={12} />
                      Last run: {formatRelativeDate(lastRun)}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {filteredAgents.length === 0 && !searchQuery.trim() && (
            <p className="copilot-agents__empty">No agents match your filters.</p>
          )}

          {/* Marketplace Domain Sections */}
          {filteredMarketplace.length > 0 && (
            <section className="copilot-agents__marketplace" aria-label="Agent Marketplace">
              <div className="copilot-agents__marketplace-header">
                <h3 className="copilot-agents__marketplace-title">Agent Marketplace</h3>
                <span className="copilot-agents__marketplace-count">
                  {TOTAL_MARKETPLACE_AGENTS} browse-only agents
                </span>
              </div>

              {filteredMarketplace.map(domain => {
                const isExpanded = expandedDomains.has(domain.id)
                return (
                  <div key={domain.id} className="copilot-agents__domain">
                    <button
                      className="copilot-agents__domain-toggle"
                      onClick={() => toggleDomain(domain.id)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${domain.name}`}
                    >
                      <ChevronRight
                        size={16}
                        className={`copilot-agents__domain-chevron${isExpanded ? ' copilot-agents__domain-chevron--expanded' : ''}`}
                      />
                      <span className="copilot-agents__domain-emoji">{domain.emoji}</span>
                      <div className="copilot-agents__domain-info">
                        <p className="copilot-agents__domain-name">{domain.name}</p>
                        <p className="copilot-agents__domain-desc">{domain.description}</p>
                      </div>
                      <span className="copilot-agents__domain-count" style={{ color: domain.color, borderColor: domain.color }}>
                        {domain.agentCount}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="copilot-agents__domain-content">
                        <div className="copilot-agents__marketplace-grid">
                          {domain.agents.map(agent => (
                            <div
                              key={`${domain.id}-${agent.id}`}
                              className="copilot-agents__marketplace-card"
                              onClick={() => handleMarketplaceRun(domain.id, agent.name)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMarketplaceRun(domain.id, agent.name) } }}
                            >
                              <div className="copilot-agents__marketplace-card-header">
                                <span className="copilot-agents__marketplace-card-icon" style={{ backgroundColor: `${domain.color}18`, color: domain.color }}>
                                  {(() => { const DomainIcon = DOMAIN_ICON[domain.id] ?? Circle; return <DomainIcon size={14} /> })()}
                                </span>
                                <h4 className="copilot-agents__marketplace-card-name">{agent.name}</h4>
                              </div>
                              <p className="copilot-agents__marketplace-card-desc">{agent.description}</p>
                              <div className="copilot-agents__marketplace-card-meta">
                                <span className="copilot-agents__marketplace-card-tag">{agent.integrations}</span>
                                <span className="copilot-agents__marketplace-card-tag">{agent.autonomy}</span>
                                <span className="copilot-agents__marketplace-card-price">{agent.price}</span>
                              </div>
                              <button
                                className="copilot-agents__marketplace-card-run"
                                onClick={(e) => { e.stopPropagation(); handleMarketplaceRun(domain.id, agent.name) }}
                                aria-label={`Run ${agent.name}`}
                                style={{ backgroundColor: domain.color }}
                              >
                                <Play size={12} fill="currentColor" />
                                Run
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {filteredAgents.length === 0 && filteredMarketplace.length === 0 && searchQuery.trim() && (
            <p className="copilot-agents__empty">No agents match your search.</p>
          )}
        </>
      )}

      {/* ─── PIPELINES TAB ───────────────────────────────────────── */}
      {activeTab === 'pipelines' && (
        <div className="copilot-agents__pipelines-section">
          <div className="copilot-agents__pipelines-header">
            <h3 className="copilot-agents__section-title">Pipelines</h3>
            <button className="copilot-agents__create-pipeline-btn" onClick={handleOpenPipelineBuilder}>
              <Zap size={14} />
              Create Pipeline
            </button>
          </div>

          {activePipelines.length > 0 && (
            <div className="copilot-agents__pipeline-list">
              <h4 className="copilot-agents__pipeline-subhead">Active</h4>
              {activePipelines.map(p => (
                <PipelineView
                  key={p.id}
                  pipeline={p}
                  onPause={() => pipelinePause(p.id)}
                  onResume={() => pipelineResume(p.id)}
                  onCancel={() => pipelineCancel(p.id)}
                />
              ))}
            </div>
          )}

          {completedPipelines.length > 0 && (
            <div className="copilot-agents__pipeline-list">
              <h4 className="copilot-agents__pipeline-subhead">Completed</h4>
              {completedPipelines.map(p => (
                <PipelineView key={p.id} pipeline={p} />
              ))}
            </div>
          )}

          {pipelines.length === 0 && (
            <p className="copilot-agents__empty">No pipelines yet. Create one or use a template to get started.</p>
          )}
        </div>
      )}

      {/* ─── TEMPLATES TAB ───────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="copilot-agents__templates-section">
          <h3 className="copilot-agents__section-title">Workflow Templates</h3>
          <p className="copilot-agents__templates-desc">Pre-built multi-agent pipelines for common business workflows</p>
          <div className="copilot-agents__templates-grid">
            {WORKFLOW_TEMPLATES.map(t => (
              <TemplateCard key={t.id} template={t} onUseTemplate={handleUseTemplate} />
            ))}
          </div>
        </div>
      )}

      {/* Active Runs Panel */}
      {activeRuns.length > 0 && (
        <section className="copilot-agents__active-runs" aria-label="Active agent runs">
          <h3 className="copilot-agents__section-title">Active Runs</h3>
          <div className="copilot-agents__runs-list">
            {activeRuns.map((run) => {
              const agentDef = AGENT_DEFINITIONS.find(a => a.type === run.agentType)
              const completedSteps = run.steps.filter(s => s.status === StepStatus.Completed).length
              const progressPercent = run.steps.length > 0
                ? (completedSteps / run.steps.length) * 100
                : 0

              return (
                <div key={run.id} className="copilot-agents__run-card">
                  <div className="copilot-agents__run-header">
                    <div className="copilot-agents__run-info">
                      <span className="copilot-agents__run-agent">{agentDef?.label ?? run.agentType} Agent</span>
                      <span className="copilot-agents__run-task">{run.task}</span>
                    </div>
                    <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm" dot>
                      {run.status}
                    </Badge>
                  </div>

                  <div className="copilot-agents__progress-bar" role="progressbar" aria-valuenow={completedSteps} aria-valuemin={0} aria-valuemax={run.steps.length} aria-label="Run progress">
                    <div className="copilot-agents__progress-fill" style={{ width: `${progressPercent}%` }} />
                  </div>

                  <div className="copilot-agents__steps" role="list" aria-label="Run steps">
                    {run.steps.map((step: RunStep) => {
                      const StepIcon = STEP_ICON[step.status]
                      return (
                        <div key={step.id} className={`copilot-agents__step copilot-agents__step--${step.status}`} role="listitem">
                          <StepIcon size={16} className={`copilot-agents__step-icon ${STEP_CLASS[step.status]}`} />
                          <div className="copilot-agents__step-content">
                            <span className="copilot-agents__step-label">{step.label}</span>
                            {step.output && (
                              <span className="copilot-agents__step-output">{step.output}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="copilot-agents__run-controls">
                    {run.status === RunStatus.Running && (
                      <button className="copilot-agents__control-btn" onClick={() => handlePause(run.id)} aria-label="Pause run">
                        <Pause size={14} /> Pause
                      </button>
                    )}
                    {run.status === RunStatus.Paused && (
                      <button className="copilot-agents__control-btn copilot-agents__control-btn--primary" onClick={() => handleResume(run.id)} aria-label="Resume run">
                        <Play size={14} /> Resume
                      </button>
                    )}
                    <button className="copilot-agents__control-btn copilot-agents__control-btn--danger" onClick={() => handleCancel(run.id)} aria-label="Cancel run">
                      <Square size={14} /> Cancel
                    </button>
                    <button className="copilot-agents__control-btn" onClick={() => handleChat(run.id)} aria-label="Chat with agent">
                      <MessageSquare size={14} /> Chat
                    </button>
                  </div>

                  {chatRunId === run.id && (
                    <div className="copilot-agents__chat-placeholder">
                      <p className="copilot-agents__chat-note">Chat with this agent during its run. The agent is currently working on: {run.task}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Run History */}
      {completedRuns.length > 0 && (
        <section className="copilot-agents__history" aria-label="Agent run history">
          <button className="copilot-agents__history-toggle" onClick={toggleHistory} aria-expanded={showHistory}>
            <h3 className="copilot-agents__section-title">Run History ({completedRuns.length})</h3>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showHistory && (
            <div className="copilot-agents__history-table-wrap">
              <table className="copilot-agents__history-table" role="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRuns.map((run) => {
                    const agentDef = AGENT_DEFINITIONS.find(a => a.type === run.agentType)
                    return (
                      <tr key={run.id}>
                        <td>{agentDef?.label ?? run.agentType} Agent</td>
                        <td className="copilot-agents__history-task">{run.task}</td>
                        <td>
                          <Badge variant={RUN_STATUS_VARIANT[run.status]} size="sm">
                            {run.status}
                          </Badge>
                        </td>
                        <td>{formatDuration(run.startedAt, run.completedAt)}</td>
                        <td>{new Date(run.startedAt).toLocaleDateString()}</td>
                        <td>
                          {run.status === RunStatus.Completed && run.result && (
                            <button
                              className="copilot-agents__view-results-btn"
                              onClick={() => handleViewResults(run.id)}
                              aria-label={`View results for ${run.task}`}
                            >
                              <Eye size={14} />
                              View Results
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* View Results Modal */}
      {viewingRun && (
        <RunResultsModal run={viewingRun} onClose={handleCloseResults} />
      )}

      {/* Pipeline Builder Modal */}
      <PipelineBuilder
        isOpen={showPipelineBuilder}
        onClose={handleClosePipelineBuilder}
        initialStages={builderInitialStages}
        templateName={builderTemplateName}
        templateDescription={builderTemplateDesc}
      />
    </div>
  )
}
