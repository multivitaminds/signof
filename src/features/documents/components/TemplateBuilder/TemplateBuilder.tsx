import { useState, useCallback } from 'react'
import type { Template, DocumentField, RecipientRole, FieldType } from '../../../../types'
import { FIELD_COLORS } from '../../lib/fieldTypes'
import DocumentCanvas from '../DocumentCanvas/DocumentCanvas'
import FieldPalette from '../FieldPalette/FieldPalette'
import FieldProperties from '../FieldProperties/FieldProperties'
import { useFieldPlacement } from '../../hooks/useFieldPlacement'
import './TemplateBuilder.css'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

interface TemplateBuilderProps {
  template?: Template
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function TemplateBuilder({ template, onSave, onCancel }: TemplateBuilderProps) {
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [documentName, setDocumentName] = useState(template?.documentName || '')
  const [roles, setRoles] = useState<RecipientRole[]>(
    template?.recipientRoles || [{ id: generateId(), label: 'Signer 1', order: 1 }]
  )

  const {
    fields,
    selectedFieldId,
    addField,
    removeField,
    updateFieldPosition,
    updateFieldProperties,
    selectField,
    hoverField,
  } = useFieldPlacement('template-builder', template?.fields)

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null

  const recipientColors = roles.reduce<Record<string, string>>((acc, role, index) => {
    acc[role.id] = FIELD_COLORS[index % FIELD_COLORS.length] ?? '#4F46E5'
    return acc
  }, {})

  const handleAddRole = useCallback(() => {
    const order = roles.length + 1
    setRoles((prev) => [
      ...prev,
      { id: generateId(), label: `Signer ${order}`, order },
    ])
  }, [roles.length])

  const handleRemoveRole = useCallback(
    (roleId: string) => {
      setRoles((prev) => prev.filter((r) => r.id !== roleId))
    },
    []
  )

  const handleRoleLabelChange = useCallback((roleId: string, label: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, label } : r))
    )
  }, [])

  const handleFieldDrop = useCallback(
    (type: FieldType, _recipientId: string, x: number, y: number) => {
      const assignedRecipient = roles[0]?.id || 'default'
      addField(type, assignedRecipient, 1, x, y)
    },
    [addField, roles]
  )

  const handleFieldUpdate = useCallback(
    (updates: Partial<DocumentField>) => {
      if (!selectedFieldId) return
      updateFieldProperties(selectedFieldId, updates)
    },
    [selectedFieldId, updateFieldProperties]
  )

  const handleFieldDelete = useCallback(() => {
    if (!selectedFieldId) return
    removeField(selectedFieldId)
  }, [selectedFieldId, removeField])

  const handleSave = useCallback(() => {
    onSave({
      name: name.trim() || 'Untitled Template',
      description: description.trim(),
      documentName: documentName.trim() || name.trim() || 'Untitled',
      fields,
      recipientRoles: roles,
    })
  }, [onSave, name, description, documentName, fields, roles])

  return (
    <div className="template-builder">
      <div className="template-builder__form">
        <div className="template-builder__field">
          <label htmlFor="template-name">Template Name</label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Employment Agreement"
          />
        </div>

        <div className="template-builder__field">
          <label htmlFor="template-description">Description</label>
          <textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this template..."
            rows={2}
          />
        </div>

        <div className="template-builder__field">
          <label htmlFor="template-doc-name">Document Name</label>
          <input
            id="template-doc-name"
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="e.g., Employment Agreement"
          />
        </div>
      </div>

      <div className="template-builder__roles">
        <h4>Recipient Roles</h4>
        {roles.map((role, index) => (
          <div key={role.id} className="template-builder__role-item">
            <span
              className="template-builder__role-color"
              style={{ backgroundColor: FIELD_COLORS[index % FIELD_COLORS.length] }}
            />
            <input
              type="text"
              value={role.label}
              onChange={(e) => handleRoleLabelChange(role.id, e.target.value)}
              aria-label={`Role ${index + 1} label`}
            />
            {roles.length > 1 && (
              <button
                className="btn-ghost"
                onClick={() => handleRemoveRole(role.id)}
                aria-label={`Remove role ${role.label}`}
              >
                x
              </button>
            )}
          </div>
        ))}
        <button className="btn-secondary" onClick={handleAddRole}>
          Add Role
        </button>
      </div>

      <div className="template-builder__canvas-area">
        <FieldPalette onFieldDragStart={() => {}} />
        <DocumentCanvas
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldSelect={selectField}
          onFieldMove={updateFieldPosition}
          onFieldDrop={handleFieldDrop}
          onFieldHover={hoverField}
          recipientColors={recipientColors}
        />
        <FieldProperties
          field={selectedField}
          onUpdate={handleFieldUpdate}
          onDelete={handleFieldDelete}
        />
      </div>

      <div className="template-builder__actions">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Save Template
        </button>
      </div>
    </div>
  )
}
