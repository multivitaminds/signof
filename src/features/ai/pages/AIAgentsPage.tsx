import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Plus, Zap, Search, Users,
} from 'lucide-react'
import useAIAgentStore, { getStepOutput } from '../stores/useAIAgentStore'
import usePipelineStore from '../stores/usePipelineStore'
import useCanvasStore from '../stores/useCanvasStore'
import { AGENT_DEFINITIONS } from '../lib/agentDefinitions'
import { MARKETPLACE_DOMAINS, TOTAL_MARKETPLACE_AGENTS } from '../data/marketplaceAgents'
import { WORKFLOW_TEMPLATES } from '../lib/workflowTemplates'
import { buildCategoryTabs, DOMAIN_AGENT_TYPE } from '../lib/agentIcons'
import { RunStatus, StepStatus, NodeStatus, AgentType } from '../types'
import type { AgentRun } from '../types'
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
import AgentStatsBar from '../components/AgentStatsBar/AgentStatsBar'
import AgentCategoryFilter from '../components/AgentCategoryFilter/AgentCategoryFilter'
import AgentCardGrid from '../components/AgentCardGrid/AgentCardGrid'
import MarketplaceSection from '../components/MarketplaceSection/MarketplaceSection'
import ActiveRunsPanel from '../components/ActiveRunsPanel/ActiveRunsPanel'
import RunHistoryTable from '../components/RunHistoryTable/RunHistoryTable'
import EmptyState from '../../../components/EmptyState/EmptyState'
import { isLLMAvailable } from '../lib/llmClient'
import { runWithLLM } from '../lib/simulationEngine'
import type { LLMExecutionController } from '../lib/simulationEngine'
import type { WorkflowTemplate } from '../lib/workflowTemplates'
import './AIAgentsPage.css'

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
  const streamingOutputs = useAIAgentStore((s) => s.streamingOutputs)
  const updateStreamingOutput = useAIAgentStore((s) => s.updateStreamingOutput)
  const clearStreamingOutput = useAIAgentStore((s) => s.clearStreamingOutput)

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
  const llmControllers = useRef<Map<string, LLMExecutionController>>(new Map())

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

  // Clean up timers and LLM controllers on unmount
  useEffect(() => {
    const timers = simulationTimers.current
    const controllers = llmControllers.current
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
      for (const ctrl of controllers.values()) {
        ctrl.cancel()
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
    // ─── Live LLM mode ─────────────────────────────────────────
    if (isLLMAvailable()) {
      const def = AGENT_DEFINITIONS.find(d => d.type === run.agentType)
      const simSteps = (def?.defaultSteps ?? []).map(s => ({
        id: '',
        label: s.label,
        status: 'pending' as const,
        durationMs: s.durationMs,
      }))
      const ctrl = runWithLLM(run.agentType, run.task, simSteps, {
        onStepStart: (idx) => {
          updateRunStep(run.id, idx, StepStatus.Running as typeof StepStatus.Running)
        },
        onStepComplete: (idx, output) => {
          updateRunStep(run.id, idx, StepStatus.Completed as typeof StepStatus.Completed, output)
        },
        onStepStreaming: (idx, partialText) => {
          updateStreamingOutput(run.id, idx, partialText)
        },
        onAllComplete: () => {
          clearStreamingOutput(run.id)
          llmControllers.current.delete(run.id)
        },
        onError: (idx, error) => {
          // Fallback: fill remaining steps with simulation outputs
          updateRunStep(run.id, idx, StepStatus.Completed as typeof StepStatus.Completed, `[Fallback] ${error}`)
          llmControllers.current.delete(run.id)
        },
      })
      llmControllers.current.set(run.id, ctrl)
      return
    }

    // ─── Demo simulation mode (original behavior) ──────────────
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
  }, [updateRunStep, updateStreamingOutput, clearStreamingOutput])

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
    // Cancel LLM controller on pause (LLM calls can't be paused)
    const llmCtrl = llmControllers.current.get(runId)
    if (llmCtrl) {
      llmCtrl.cancel()
      llmControllers.current.delete(runId)
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
    // Cancel LLM controller if running
    const llmCtrl = llmControllers.current.get(runId)
    if (llmCtrl) {
      llmCtrl.cancel()
      llmControllers.current.delete(runId)
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

      const incomingConn = canvasConnections.find(c => c.targetNodeId === node.id)
      if (incomingConn) updateConnectionStatus(incomingConn.id, NodeStatus.Running)

      const timerId = setTimeout(() => {
        updateNodeStatus(node.id, NodeStatus.Completed, `Output from ${node.agentType}`)
        if (incomingConn) updateConnectionStatus(incomingConn.id, NodeStatus.Completed)

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

      <OrchestratorInput
        onRunSingle={handleOrchestratorSingle}
        onRunPipeline={handleOrchestratorPipeline}
      />

      <AgentStatsBar
        totalAgents={stats.totalAgents}
        totalRuns={stats.totalRuns}
        activePipelines={stats.activePipelines}
        successRate={stats.successRate}
      />

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

      {/* Canvas Tab */}
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

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <>
          <AgentCategoryFilter
            categories={categoryTabs}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="copilot-agents__featured-header">
            <h3 className="copilot-agents__featured-title">Featured Agents</h3>
            <span className="copilot-agents__featured-badge">Runnable</span>
          </div>

          <AgentCardGrid
            agents={filteredAgents}
            favorites={favorites as AgentType[]}
            lastRunByAgent={lastRunByAgent}
            runTaskInputs={runTaskInputs}
            onTaskInputChange={handleTaskInputChange}
            onRun={handleRun}
            onToggleFavorite={toggleFavorite}
          />

          {filteredAgents.length === 0 && !searchQuery.trim() && (
            <EmptyState
              icon={<Users size={32} />}
              title="No agents match your filters"
              description="Try selecting a different category or check back later."
            />
          )}

          <MarketplaceSection
            domains={filteredMarketplace}
            expandedDomains={expandedDomains}
            onToggleDomain={toggleDomain}
            onMarketplaceRun={handleMarketplaceRun}
          />

          {filteredAgents.length === 0 && filteredMarketplace.length === 0 && searchQuery.trim() && (
            <EmptyState
              icon={<Search size={32} />}
              title="No agents found"
              description="Try a different search term or browse all categories."
            />
          )}
        </>
      )}

      {/* Pipelines Tab */}
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
            <EmptyState
              icon={<Zap size={32} />}
              title="No pipelines yet"
              description="Create a pipeline or use a template to get started."
              action={{ label: 'Create Pipeline', onClick: handleOpenPipelineBuilder }}
            />
          )}
        </div>
      )}

      {/* Templates Tab */}
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
      <ActiveRunsPanel
        runs={activeRuns}
        chatRunId={chatRunId}
        streamingOutputs={streamingOutputs}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        onChat={handleChat}
      />

      {/* Run History */}
      <RunHistoryTable
        runs={completedRuns}
        showHistory={showHistory}
        onToggleHistory={toggleHistory}
        onViewResult={handleViewResults}
      />

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
