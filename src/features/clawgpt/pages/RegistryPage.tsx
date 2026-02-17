import { useState, useCallback } from 'react'
import RegistryBrowser from '../components/RegistryBrowser/RegistryBrowser'
import AgentSpawner from '../components/AgentSpawner/AgentSpawner'
import { spawnAgent } from '../lib/agentKernel'
import './RegistryPage.css'

export default function RegistryPage() {
  const [spawnerOpen, setSpawnerOpen] = useState(false)
  const [preselectedRegistryId, setPreselectedRegistryId] = useState<string>('')

  const handleSpawnFromBrowser = useCallback((registryId: string) => {
    setPreselectedRegistryId(registryId)
    setSpawnerOpen(true)
  }, [])

  const handleSpawn = useCallback((registryId: string, task: string) => {
    spawnAgent(registryId, task)
    setSpawnerOpen(false)
    setPreselectedRegistryId('')
  }, [])

  const handleClose = useCallback(() => {
    setSpawnerOpen(false)
    setPreselectedRegistryId('')
  }, [])

  return (
    <div className="registry-page">
      <div className="registry-page__header">
        <h3 className="registry-page__title">Agent Registry</h3>
        <p className="registry-page__subtitle">
          Browse and deploy from 540+ autonomous agent specializations across 13 domains
        </p>
      </div>

      <RegistryBrowser onSpawn={handleSpawnFromBrowser} />

      <AgentSpawner
        isOpen={spawnerOpen}
        onClose={handleClose}
        onSpawn={handleSpawn}
        preselectedRegistryId={preselectedRegistryId}
      />
    </div>
  )
}
