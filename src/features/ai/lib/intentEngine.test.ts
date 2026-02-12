import { parseIntent } from './intentEngine'

describe('intentEngine — parseIntent', () => {
  // ─── Workspace ──────────────────────────────────────────
  describe('workspace intents', () => {
    it('parses "create a new page called Meeting Notes"', () => {
      const result = parseIntent('create a new page called Meeting Notes', 'workspace')
      expect(result.action).toBe('create_page')
      expect(result.params.title).toBe('Meeting Notes')
      expect(result.confidence).toBe('high')
    })

    it('parses "new page My Notes"', () => {
      const result = parseIntent('new page My Notes', 'workspace')
      expect(result.action).toBe('create_page')
      expect(result.params.title).toBe('My Notes')
    })

    it('parses "write meeting notes for standup"', () => {
      const result = parseIntent('write meeting notes for standup', 'workspace')
      expect(result.action).toBe('add_block')
      expect(result.params.content).toBe('meeting notes for standup')
    })
  })

  // ─── Projects ───────────────────────────────────────────
  describe('projects intents', () => {
    it('parses "create a task called Fix login bug"', () => {
      const result = parseIntent('create a task called Fix login bug', 'projects')
      expect(result.action).toBe('create_issue')
      expect(result.params.title).toBe('Fix login bug')
      expect(result.confidence).toBe('high')
    })

    it('parses "add issue Refactor auth module"', () => {
      const result = parseIntent('add issue Refactor auth module', 'projects')
      expect(result.action).toBe('create_issue')
      expect(result.params.title).toBe('Refactor auth module')
    })

    it('parses "set priority to high"', () => {
      const result = parseIntent('set priority to high', 'projects')
      expect(result.action).toBe('set_priority')
      expect(result.params.level).toBe('high')
    })

    it('parses "assign Bug fix to Alice"', () => {
      const result = parseIntent('assign Bug fix to Alice', 'projects')
      expect(result.action).toBe('assign_issue')
      expect(result.params.issue).toBe('Bug fix')
      expect(result.params.person).toBe('Alice')
    })
  })

  // ─── Scheduling ─────────────────────────────────────────
  describe('scheduling intents', () => {
    it('parses "schedule a meeting for tomorrow"', () => {
      const result = parseIntent('schedule a meeting for tomorrow', 'scheduling')
      expect(result.action).toBe('create_booking')
      expect(result.params.event).toBe('meeting')
      expect(result.params.date).toBe('tomorrow')
    })

    it('parses "book standup on Monday"', () => {
      const result = parseIntent('book standup on Monday', 'scheduling')
      expect(result.action).toBe('create_booking')
      expect(result.params.event).toBe('standup')
    })

    it('parses "cancel booking abc123"', () => {
      const result = parseIntent('cancel booking abc123', 'scheduling')
      expect(result.action).toBe('cancel_booking')
      expect(result.params.id).toBe('abc123')
    })
  })

  // ─── Documents ──────────────────────────────────────────
  describe('documents intents', () => {
    it('parses "create template Invoice"', () => {
      const result = parseIntent('create template Invoice', 'documents')
      expect(result.action).toBe('create_template')
      expect(result.params.name).toBe('Invoice')
      expect(result.confidence).toBe('high')
    })

    it('parses "add contact John john@example.com"', () => {
      const result = parseIntent('add contact John john@example.com', 'documents')
      expect(result.action).toBe('add_contact')
      expect(result.params.name).toBe('John')
      expect(result.params.email).toBe('john@example.com')
    })
  })

  // ─── Databases ──────────────────────────────────────────
  describe('databases intents', () => {
    it('parses "create database Contacts"', () => {
      const result = parseIntent('create database Contacts', 'databases')
      expect(result.action).toBe('create_database')
      expect(result.params.name).toBe('Contacts')
      expect(result.confidence).toBe('high')
    })

    it('parses "add a record"', () => {
      const result = parseIntent('add a record', 'databases')
      expect(result.action).toBe('add_row')
    })

    it('parses "add row"', () => {
      const result = parseIntent('add row', 'databases')
      expect(result.action).toBe('add_row')
    })
  })

  // ─── Inbox ──────────────────────────────────────────────
  describe('inbox intents', () => {
    it('parses "mark all read"', () => {
      const result = parseIntent('mark all read', 'inbox')
      expect(result.action).toBe('mark_all_read')
      expect(result.confidence).toBe('high')
    })

    it('parses "mark all as read"', () => {
      const result = parseIntent('mark all as read', 'inbox')
      expect(result.action).toBe('mark_all_read')
    })

    it('parses "clear notifications"', () => {
      const result = parseIntent('clear notifications', 'inbox')
      expect(result.action).toBe('clear_inbox')
    })

    it('parses "clear all"', () => {
      const result = parseIntent('clear all notifications', 'inbox')
      expect(result.action).toBe('clear_inbox')
    })
  })

  // ─── Home ───────────────────────────────────────────────
  describe('home intents', () => {
    it('parses "show my stats"', () => {
      const result = parseIntent('show my stats', 'home')
      expect(result.action).toBe('show_stats')
      expect(result.confidence).toBe('high')
    })

    it('parses "show stats"', () => {
      const result = parseIntent('show stats', 'home')
      expect(result.action).toBe('show_stats')
    })

    it('parses "start agent researcher"', () => {
      const result = parseIntent('start agent researcher', 'home')
      expect(result.action).toBe('start_agent')
      expect(result.params.type).toBe('researcher')
    })
  })

  // ─── Fallback ───────────────────────────────────────────
  describe('fallback', () => {
    it('returns low confidence for unrecognized text', () => {
      const result = parseIntent('hello world', 'home')
      expect(result.action).toBe('unknown')
      expect(result.confidence).toBe('low')
      expect(result.response).toBeTruthy()
    })

    it('returns feature-specific fallback message', () => {
      const result = parseIntent('xyz', 'workspace')
      expect(result.confidence).toBe('low')
      expect(result.response).toContain('workspace')
    })
  })

  // ─── Case insensitivity ─────────────────────────────────
  describe('case insensitivity', () => {
    it('handles uppercase input', () => {
      const result = parseIntent('CREATE A TASK CALLED Fix Bug', 'projects')
      expect(result.action).toBe('create_issue')
    })

    it('handles mixed case', () => {
      const result = parseIntent('Mark All Read', 'inbox')
      expect(result.action).toBe('mark_all_read')
    })
  })

  // ─── Cross-feature ─────────────────────────────────────
  describe('cross-feature matching', () => {
    it('matches workspace intent from home context with medium confidence', () => {
      const result = parseIntent('create a new page called Notes', 'home')
      expect(result.action).toBe('create_page')
      expect(result.confidence).toBe('medium')
    })
  })
})
