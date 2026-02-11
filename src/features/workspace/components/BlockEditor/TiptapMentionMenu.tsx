import { useState, useEffect, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { useTeamStore } from '../../../settings/stores/useTeamStore'
import { MemberStatus } from '../../../settings/types/team'
import type { TeamMember } from '../../../settings/types/team'
import './TiptapMentionMenu.css'

interface TiptapMentionMenuProps {
  editor: Editor
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function TiptapMentionMenu({ editor }: TiptapMentionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerPosRef = useRef<number | null>(null)

  const members = useTeamStore((s) => s.team.members)
  const activeMembers = members.filter((m) => m.status === MemberStatus.Active)

  const filtered = query
    ? activeMembers.filter((m) => {
        const q = query.toLowerCase()
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        )
      })
    : activeMembers

  // Listen for "@" input
  useEffect(() => {
    if (!editor) return

    let dom: HTMLElement | null = null
    try {
      dom = editor.view.dom
    } catch {
      return
    }

    const handleInput = () => {
      if (isOpen) return

      const { state } = editor
      const { from } = state.selection
      const $from = state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )

      // Check if "@" was just typed (at start of word boundary)
      if (textBefore.endsWith('@')) {
        const charBeforeAt = textBefore.length > 1 ? textBefore[textBefore.length - 2] : undefined
        if (!charBeforeAt || charBeforeAt === ' ' || charBeforeAt === '\n') {
          try {
            const coords = editor.view.coordsAtPos(from)
            setPosition({ top: coords.bottom + 4, left: coords.left })
            setIsOpen(true)
            setQuery('')
            setSelectedIndex(0)
            triggerPosRef.current = from - 1 // Position of "@"
          } catch {
            // View not available
          }
        }
      }
    }

    const handleTransaction = () => {
      if (!isOpen || triggerPosRef.current === null) return

      const { from } = editor.state.selection
      const $from = editor.state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )

      // Find the last "@" that triggered the menu
      const atIdx = textBefore.lastIndexOf('@')
      if (atIdx === -1) {
        setIsOpen(false)
        triggerPosRef.current = null
        return
      }

      const queryText = textBefore.slice(atIdx + 1)
      // Close if there's a space in the query (user moved on)
      if (queryText.includes(' ')) {
        setIsOpen(false)
        triggerPosRef.current = null
        return
      }

      setQuery(queryText)
    }

    dom.addEventListener('input', handleInput)
    editor.on('transaction', handleTransaction)

    return () => {
      dom?.removeEventListener('input', handleInput)
      editor.off('transaction', handleTransaction)
    }
  }, [editor, isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            (prev - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1),
          )
          break
        case 'Enter': {
          e.preventDefault()
          const item = filtered[selectedIndex]
          if (item) {
            handleSelect(item)
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          triggerPosRef.current = null
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filtered, selectedIndex])

  const handleSelect = useCallback(
    (member: TeamMember) => {
      if (triggerPosRef.current === null) return

      const { state } = editor
      const { from } = state.selection
      const $from = state.doc.resolve(from)
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        '\ufffc',
      )
      const atIdx = textBefore.lastIndexOf('@')
      if (atIdx === -1) return

      // Calculate absolute positions
      const nodeStart = $from.start()
      const deleteFrom = nodeStart + atIdx
      const deleteTo = from

      // Delete "@" + query, then insert mention node
      editor
        .chain()
        .focus()
        .deleteRange({ from: deleteFrom, to: deleteTo })
        .insertContentAt(deleteFrom, {
          type: 'mention',
          attrs: {
            id: member.id,
            label: member.name,
          },
        })
        .run()

      setIsOpen(false)
      triggerPosRef.current = null
    },
    [editor],
  )

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        triggerPosRef.current = null
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      className="tiptap-mention-menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="listbox"
      aria-label="Mention a team member"
    >
      <div className="tiptap-mention-menu__header">Team members</div>
      <div className="tiptap-mention-menu__list">
        {filtered.length === 0 ? (
          <div className="tiptap-mention-menu__empty">No members found</div>
        ) : (
          filtered.map((member, i) => (
            <button
              key={member.id}
              className={`tiptap-mention-menu__item ${i === selectedIndex ? 'tiptap-mention-menu__item--selected' : ''}`}
              onClick={() => handleSelect(member)}
              onMouseEnter={() => setSelectedIndex(i)}
              role="option"
              aria-selected={i === selectedIndex}
            >
              <div className="tiptap-mention-menu__item-avatar">
                {getInitials(member.name)}
              </div>
              <div className="tiptap-mention-menu__item-text">
                <span className="tiptap-mention-menu__item-name">{member.name}</span>
                <span className="tiptap-mention-menu__item-email">{member.email}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
