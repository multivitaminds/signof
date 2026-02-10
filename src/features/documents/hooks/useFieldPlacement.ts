import { useState, useCallback } from 'react'
import { type DocumentField, type FieldType } from '../../../types'
import { createDefaultField } from '../lib/fieldTypes'

interface FieldPlacementState {
  fields: DocumentField[]
  selectedFieldId: string | null
  hoveredFieldId: string | null
  isDragging: boolean
}

interface FieldPlacementActions {
  addField: (type: FieldType, recipientId: string, page: number, x: number, y: number) => DocumentField
  removeField: (fieldId: string) => void
  updateFieldPosition: (fieldId: string, x: number, y: number) => void
  updateFieldSize: (fieldId: string, width: number, height: number) => void
  updateFieldProperties: (fieldId: string, updates: Partial<DocumentField>) => void
  selectField: (fieldId: string | null) => void
  hoverField: (fieldId: string | null) => void
  setDragging: (isDragging: boolean) => void
  setFields: (fields: DocumentField[]) => void
}

export function useFieldPlacement(
  _documentId: string,
  initialFields: DocumentField[] = []
): FieldPlacementState & FieldPlacementActions {
  const [fields, setFields] = useState<DocumentField[]>(initialFields)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null)
  const [isDragging, setDragging] = useState(false)

  const addField = useCallback(
    (type: FieldType, recipientId: string, page: number, x: number, y: number) => {
      const field = createDefaultField(type, recipientId, page, x, y)
      setFields((prev) => [...prev, field])
      return field
    },
    []
  )

  const removeField = useCallback((fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId))
    setSelectedFieldId((prev) => (prev === fieldId ? null : prev))
  }, [])

  const updateFieldPosition = useCallback((fieldId: string, x: number, y: number) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, x, y } : f))
    )
  }, [])

  const updateFieldSize = useCallback((fieldId: string, width: number, height: number) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, width, height } : f))
    )
  }, [])

  const updateFieldProperties = useCallback(
    (fieldId: string, updates: Partial<DocumentField>) => {
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
      )
    },
    []
  )

  const selectField = useCallback((fieldId: string | null) => {
    setSelectedFieldId(fieldId)
  }, [])

  const hoverField = useCallback((fieldId: string | null) => {
    setHoveredFieldId(fieldId)
  }, [])

  return {
    fields,
    selectedFieldId,
    hoveredFieldId,
    isDragging,
    addField,
    removeField,
    updateFieldPosition,
    updateFieldSize,
    updateFieldProperties,
    selectField,
    hoverField,
    setDragging,
    setFields,
  }
}
