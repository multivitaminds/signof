import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from './useTemplateStore'
import { FieldType } from '../../../types'

function resetStore() {
  useTemplateStore.setState({ templates: [] })
}

describe('useTemplateStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('addTemplate', () => {
    it('adds a template and returns it with generated id and timestamps', () => {
      const result = useTemplateStore.getState().addTemplate({
        name: 'Test Template',
        description: 'A test template',
        documentName: 'Test Doc',
        fields: [],
        recipientRoles: [{ id: 'r1', label: 'Signer', order: 1 }],
      })

      expect(result.id).toBeTruthy()
      expect(result.name).toBe('Test Template')
      expect(result.createdAt).toBeTruthy()
      expect(result.updatedAt).toBeTruthy()
      expect(useTemplateStore.getState().templates).toHaveLength(1)
    })
  })

  describe('updateTemplate', () => {
    it('updates a template by id', () => {
      const tmpl = useTemplateStore.getState().addTemplate({
        name: 'Original',
        description: 'Desc',
        documentName: 'Doc',
        fields: [],
        recipientRoles: [],
      })

      useTemplateStore.getState().updateTemplate(tmpl.id, { name: 'Updated' })
      const updated = useTemplateStore.getState().templates.find((t) => t.id === tmpl.id)
      expect(updated?.name).toBe('Updated')
      expect(updated?.updatedAt).not.toBe(tmpl.updatedAt)
    })
  })

  describe('deleteTemplate', () => {
    it('removes a template by id', () => {
      const tmpl = useTemplateStore.getState().addTemplate({
        name: 'To Delete',
        description: '',
        documentName: '',
        fields: [],
        recipientRoles: [],
      })

      expect(useTemplateStore.getState().templates).toHaveLength(1)
      useTemplateStore.getState().deleteTemplate(tmpl.id)
      expect(useTemplateStore.getState().templates).toHaveLength(0)
    })
  })

  describe('getTemplate', () => {
    it('returns a template by id', () => {
      const tmpl = useTemplateStore.getState().addTemplate({
        name: 'Find Me',
        description: '',
        documentName: '',
        fields: [],
        recipientRoles: [],
      })

      expect(useTemplateStore.getState().getTemplate(tmpl.id)?.name).toBe('Find Me')
    })

    it('returns undefined for unknown id', () => {
      expect(useTemplateStore.getState().getTemplate('nonexistent')).toBeUndefined()
    })
  })

  describe('duplicateTemplate', () => {
    it('creates a copy with new id and "(Copy)" suffix', () => {
      const tmpl = useTemplateStore.getState().addTemplate({
        name: 'Original',
        description: 'Desc',
        documentName: 'Doc',
        fields: [
          {
            id: 'f1',
            type: FieldType.Signature,
            recipientId: 'r1',
            page: 1,
            x: 100,
            y: 100,
            width: 200,
            height: 60,
            required: true,
          },
        ],
        recipientRoles: [{ id: 'r1', label: 'Signer', order: 1 }],
      })

      const dup = useTemplateStore.getState().duplicateTemplate(tmpl.id)
      expect(dup).toBeDefined()
      expect(dup!.id).not.toBe(tmpl.id)
      expect(dup!.name).toBe('Original (Copy)')
      expect(dup!.fields[0]!.id).not.toBe('f1')
      expect(useTemplateStore.getState().templates).toHaveLength(2)
    })

    it('returns undefined for unknown id', () => {
      expect(useTemplateStore.getState().duplicateTemplate('nonexistent')).toBeUndefined()
    })
  })
})
