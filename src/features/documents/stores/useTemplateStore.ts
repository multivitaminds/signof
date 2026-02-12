import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Template } from '../../../types'
import { SAMPLE_TEMPLATES } from '../lib/sampleTemplates'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

interface TemplateState {
  templates: Template[]
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => Template
  updateTemplate: (id: string, updates: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => Template | undefined
  duplicateTemplate: (id: string) => Template | undefined

  // Clear data
  clearData: () => void
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: SAMPLE_TEMPLATES,

      addTemplate: (template) => {
        const timestamp = now()
        const newTemplate: Template = {
          ...template,
          id: generateId(),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set((state) => ({ templates: [newTemplate, ...state.templates] }))
        return newTemplate
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: now() } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id)
      },

      duplicateTemplate: (id) => {
        const original = get().templates.find((t) => t.id === id)
        if (!original) return undefined
        const timestamp = now()
        const duplicate: Template = {
          ...original,
          id: generateId(),
          name: `${original.name} (Copy)`,
          fields: original.fields.map((f) => ({ ...f, id: generateId() })),
          recipientRoles: original.recipientRoles.map((r) => ({ ...r, id: generateId() })),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        set((state) => ({ templates: [duplicate, ...state.templates] }))
        return duplicate
      },

      clearData: () => {
        set({ templates: [] })
      },
    }),
    { name: 'signof-templates' }
  )
)
