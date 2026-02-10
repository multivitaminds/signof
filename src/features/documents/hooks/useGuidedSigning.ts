import { useState, useCallback, useMemo } from 'react'
import type { DocumentField } from '../../../types'

export function useGuidedSigning(fields: DocumentField[], signerId: string) {
  const signerFields = useMemo(
    () => fields.filter((f) => f.recipientId === signerId),
    [fields, signerId]
  )

  const [currentFieldIndex, setCurrentFieldIndex] = useState(0)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const field of signerFields) {
      if (field.value) {
        initial[field.id] = field.value
      }
    }
    return initial
  })

  const completedFieldIds = useMemo(() => {
    const ids = new Set<string>()
    for (const field of signerFields) {
      if (fieldValues[field.id]) {
        ids.add(field.id)
      }
    }
    return ids
  }, [signerFields, fieldValues])

  const currentField = signerFields[currentFieldIndex] ?? null
  const isFirstField = currentFieldIndex === 0
  const isLastField = currentFieldIndex === signerFields.length - 1
  const progress = {
    completed: completedFieldIds.size,
    total: signerFields.length,
  }

  const canComplete = useMemo(() => {
    return signerFields
      .filter((f) => f.required)
      .every((f) => fieldValues[f.id])
  }, [signerFields, fieldValues])

  const goToField = useCallback(
    (index: number) => {
      if (index >= 0 && index < signerFields.length) {
        setCurrentFieldIndex(index)
      }
    },
    [signerFields.length]
  )

  const goToNext = useCallback(() => {
    if (currentFieldIndex < signerFields.length - 1) {
      setCurrentFieldIndex((i) => i + 1)
    }
  }, [currentFieldIndex, signerFields.length])

  const goToPrev = useCallback(() => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex((i) => i - 1)
    }
  }, [currentFieldIndex])

  const setFieldValue = useCallback((fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  return {
    currentFieldIndex,
    currentField,
    fieldValues,
    goToNext,
    goToPrev,
    goToField,
    setFieldValue,
    isFirstField,
    isLastField,
    progress,
    canComplete,
    signerFields,
  }
}

export default useGuidedSigning
