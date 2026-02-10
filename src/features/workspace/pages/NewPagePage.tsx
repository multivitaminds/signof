import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useWorkspaceStore } from '../stores/useWorkspaceStore'
import TemplatePicker from '../components/TemplatePicker/TemplatePicker'
import type { PageTemplate } from '../types'
import './NewPagePage.css'

export default function NewPagePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get('parent')
  const addPage = useWorkspaceStore((s) => s.addPage)
  const addPageWithBlocks = useWorkspaceStore((s) => s.addPageWithBlocks)

  const handleBlank = useCallback(() => {
    const id = addPage('', parentId)
    navigate(`/pages/${id}`, { replace: true })
  }, [addPage, parentId, navigate])

  const handleTemplate = useCallback(
    (template: PageTemplate) => {
      const id = addPageWithBlocks(
        template.title,
        template.icon,
        template.blocks,
        parentId
      )
      navigate(`/pages/${id}`, { replace: true })
    },
    [addPageWithBlocks, parentId, navigate]
  )

  return (
    <div className="new-page">
      <h1 className="new-page__title">Create a new page</h1>
      <p className="new-page__subtitle">
        Start from scratch or choose a template
      </p>
      <TemplatePicker onSelect={handleTemplate} onBlank={handleBlank} />
    </div>
  )
}
