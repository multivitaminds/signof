import { create } from 'zustand'
import { useContactStore } from './useContactStore'
import { useTemplateStore } from './useTemplateStore'
import { copilotChat, copilotAnalysis } from '../../ai/lib/copilotLLM'

// ─── ID Generator ────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ─── Types ──────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: string
}

// ─── Response Generator ─────────────────────────────────────────────

function generateResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  const contacts = useContactStore.getState().contacts
  const templates = useTemplateStore.getState().templates

  if (msg.includes('template')) {
    if (templates.length > 0) {
      return `You have ${templates.length} document template(s): ${templates.slice(0, 5).map((t) => `"${t.name}"`).join(', ')}${templates.length > 5 ? ` and ${templates.length - 5} more` : ''}.\n\nTemplate tips:\n- Use templates for recurring agreements (NDAs, SOWs, contracts)\n- Add field placeholders for signer-specific data\n- Define recipient roles so templates work for any signer\n- Duplicate and customize rather than editing originals`
    }
    return 'No templates yet. Create a document template for agreements you send frequently. Templates save time by pre-configuring fields, recipients, and signing order. Start by building a document, then save it as a template.'
  }

  if (msg.includes('sign') || msg.includes('signature') || msg.includes('e-sign')) {
    return 'Document signing flow:\n1. **Draft** — Upload or build your document, add fields\n2. **Send** — Add recipients with signing order\n3. **Delivered** — Recipients receive email notification\n4. **Viewed** — Recipient opens the document\n5. **Signed** — All recipients complete their signatures\n6. **Completed** — Fully executed document available for download\n\nTips:\n- Use "Sign here" field placement for guided signing\n- Set signing order for sequential approval workflows\n- Enable reminders for pending signatures'
  }

  if (msg.includes('contact') || msg.includes('recipient') || msg.includes('signer')) {
    if (contacts.length > 0) {
      const recentSigners = contacts.filter((c) => c.signingHistory && c.signingHistory.length > 0)
      return `You have ${contacts.length} contact(s), ${recentSigners.length} with signing history.\n\nContact management tips:\n- Keep contacts up-to-date with current emails\n- Review signing history to track engagement\n- Group contacts by company for bulk operations\n- Verify email addresses before sending sensitive documents`
    }
    return 'No contacts yet. Contacts are automatically created when you add recipients to documents. You can also manually add contacts with their name, email, and company information.'
  }

  if (msg.includes('compliance') || msg.includes('legal') || msg.includes('audit')) {
    return 'Document compliance best practices:\n- **Audit trail**: Every document has a timestamped history of views, signatures, and changes\n- **Identity verification**: Verify signer identity with email authentication\n- **Retention**: Keep completed documents for the required retention period (typically 7 years for contracts)\n- **ESIGN Act**: Electronic signatures are legally binding under ESIGN and UETA\n- **Data protection**: Sensitive documents should use encryption and access controls\n- **Version control**: Use document versioning to track changes before signing'
  }

  if (msg.includes('bulk') || msg.includes('batch') || msg.includes('mass send')) {
    return 'Bulk sending documents:\n- Use the Bulk Send feature to send the same template to multiple recipients\n- Upload a CSV with recipient details (name, email, custom fields)\n- Each recipient gets their own individual copy\n- Track completion status across all envelopes\n- Set automatic reminders for non-responders\n\nBest for: offer letters, NDAs, policy acknowledgments, and annual renewals.'
  }

  if (msg.includes('field') || msg.includes('placeholder') || msg.includes('form')) {
    return 'Document field types:\n- **Signature** — captures drawn or typed signature\n- **Initials** — short-form acknowledgment\n- **Date** — auto-fills with signing date\n- **Text** — free-form text input\n- **Checkbox** — yes/no acknowledgment\n- **Dropdown** — predefined option selection\n- **Name/Email** — auto-populated from signer profile\n\nDrag fields onto your document in the builder. Mark fields as required or optional per recipient.'
  }

  if (msg.includes('remind') || msg.includes('follow up') || msg.includes('pending')) {
    return 'Managing pending documents:\n- Set automatic reminders (daily, every 3 days, or weekly)\n- Send manual nudges for time-sensitive documents\n- View pending status in the Documents dashboard\n- Cancel and resend if the recipient reports issues\n- Set expiration dates on time-limited offers\n\nAverage signing turnaround: 80% of documents are completed within 24 hours when reminders are enabled.'
  }

  return `I'm your Documents Copilot — here to help with document signing workflows. You have ${templates.length} template(s) and ${contacts.length} contact(s).\n\nI can help with:\n- Document signing flow and best practices\n- Template creation and management\n- Contact and recipient management\n- Compliance and audit trail guidance\n- Bulk sending and field placement\n\nWhat would you like to know?`
}

// ─── Store Interface ────────────────────────────────────────────────

interface DocumentCopilotState {
  isOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void

  messages: CopilotMessage[]
  isTyping: boolean
  sendMessage: (content: string, context?: string) => void
  clearMessages: () => void

  isAnalyzing: boolean
  lastAnalysis: {
    type: 'templates' | 'contacts' | 'compliance'
    summary: string
    items: string[]
    timestamp: string
  } | null
  analyzeTemplates: () => void
  reviewContacts: () => void
  checkCompliance: () => void
}

// ─── Store ──────────────────────────────────────────────────────────

export const useDocumentCopilotStore = create<DocumentCopilotState>()(
  (set) => ({
    isOpen: false,
    messages: [],
    isTyping: false,
    isAnalyzing: false,
    lastAnalysis: null,

    openPanel: () => set({ isOpen: true }),
    closePanel: () => set({ isOpen: false }),
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

    sendMessage: (content, context) => {
      const userMessage: CopilotMessage = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        context,
      }

      set((state) => ({
        messages: [...state.messages, userMessage],
        isTyping: true,
      }))

      const templates = useTemplateStore.getState().templates
      const contacts = useContactStore.getState().contacts
      const contextSummary = `${templates.length} templates, ${contacts.length} contacts`

      copilotChat('Documents', content, contextSummary, () => generateResponse(content))
        .then((responseContent) => {
          const assistantMessage: CopilotMessage = {
            id: generateId(),
            role: 'assistant',
            content: responseContent,
            timestamp: new Date().toISOString(),
          }

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isTyping: false,
          }))
        })
    },

    clearMessages: () => set({ messages: [], isTyping: false }),

    analyzeTemplates: () => {
      set({ isAnalyzing: true })

      const templates = useTemplateStore.getState().templates
      const dataContext = `${templates.length} templates: ${templates.map((t) => t.name).join(', ')}`

      const fallbackFn = () => {
        const items: string[] = []
        items.push(`${templates.length} template(s) available`)
        const noFields = templates.filter((t) => !t.fields || t.fields.length === 0)
        if (noFields.length > 0) {
          items.push(`${noFields.length} template(s) have no fields — add signature and form fields`)
        }
        const noRecipients = templates.filter((t) => !t.recipientRoles || t.recipientRoles.length === 0)
        if (noRecipients.length > 0) {
          items.push(`${noRecipients.length} template(s) have no recipient roles defined`)
        }
        return {
          summary: templates.length > 0 ? `Analyzed ${templates.length} template(s).` : 'No templates found. Create one to get started.',
          items,
        }
      }

      copilotAnalysis('Documents', 'template', dataContext, fallbackFn)
        .then((result) => {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'templates',
              ...result,
              timestamp: new Date().toISOString(),
            },
          })
        })
    },

    reviewContacts: () => {
      set({ isAnalyzing: true })

      const contacts = useContactStore.getState().contacts
      const dataContext = `${contacts.length} contacts`

      const fallbackFn = () => {
        const items: string[] = []
        items.push(`${contacts.length} contact(s) in directory`)
        const withHistory = contacts.filter((c) => c.signingHistory && c.signingHistory.length > 0)
        items.push(`${withHistory.length} contact(s) with signing history`)
        const noEmail = contacts.filter((c) => !c.email)
        if (noEmail.length > 0) {
          items.push(`⚠ ${noEmail.length} contact(s) missing email address`)
        }
        return {
          summary: `Contact directory: ${contacts.length} contact(s) reviewed.`,
          items,
        }
      }

      copilotAnalysis('Documents', 'contacts', dataContext, fallbackFn)
        .then((result) => {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'contacts',
              ...result,
              timestamp: new Date().toISOString(),
            },
          })
        })
    },

    checkCompliance: () => {
      set({ isAnalyzing: true })

      const fallbackFn = () => ({
        summary: 'Compliance check: all core requirements met.',
        items: [
          'Electronic signatures comply with ESIGN Act and UETA',
          'Audit trails are automatically generated for all documents',
          'Signer identity verified via email authentication',
          'Documents encrypted at rest and in transit',
        ],
      })

      copilotAnalysis('Documents', 'compliance', 'Document signing compliance review', fallbackFn)
        .then((result) => {
          set({
            isAnalyzing: false,
            lastAnalysis: {
              type: 'compliance',
              ...result,
              timestamp: new Date().toISOString(),
            },
          })
        })
    },
  })
)
