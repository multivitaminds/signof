import type { InlineMark } from '../types'

interface ExportBlock {
  type: string
  content: string
  properties?: Record<string, unknown>
  marks?: InlineMark[]
}

// ─── Inline Mark Rendering ─────────────────────────────────────────

function applyMarksToMarkdown(content: string, marks?: InlineMark[]): string {
  if (!marks || marks.length === 0) return content
  if (!content) return content

  // Sort marks by start position (descending) so replacements don't shift indices
  const sorted = [...marks].sort((a, b) => b.from - a.from)

  let result = content
  for (const mark of sorted) {
    const from = Math.max(0, mark.from)
    const to = Math.min(content.length, mark.to)
    const text = result.slice(from, to)
    if (!text) continue

    let wrapped = text
    switch (mark.type) {
      case 'bold':
        wrapped = `**${text}**`
        break
      case 'italic':
        wrapped = `*${text}*`
        break
      case 'strikethrough':
        wrapped = `~~${text}~~`
        break
      case 'code':
        wrapped = `\`${text}\``
        break
      case 'link': {
        const href = mark.attrs?.href ?? '#'
        wrapped = `[${text}](${href})`
        break
      }
      // highlight and textColor have no standard markdown representation
      default:
        break
    }

    result = result.slice(0, from) + wrapped + result.slice(to)
  }

  return result
}

function applyMarksToHTML(content: string, marks?: InlineMark[]): string {
  if (!marks || marks.length === 0) return escapeHtml(content)
  if (!content) return ''

  // Build per-character mark sets
  const charMarks: Array<Set<string>> = []
  const charAttrs: Array<Record<string, Record<string, string>>> = []
  for (let i = 0; i < content.length; i++) {
    charMarks.push(new Set())
    charAttrs.push({})
  }

  for (const mark of marks) {
    const from = Math.max(0, mark.from)
    const to = Math.min(content.length, mark.to)
    for (let i = from; i < to; i++) {
      charMarks[i]?.add(mark.type)
      const ca = charAttrs[i]
      if (mark.attrs && ca) {
        ca[mark.type] = mark.attrs
      }
    }
  }

  // Group consecutive characters with identical mark sets
  interface Segment {
    text: string
    marks: Set<string>
    attrs: Record<string, Record<string, string>>
  }

  const segments: Segment[] = []
  let current: Segment | null = null

  for (let i = 0; i < content.length; i++) {
    const ms = charMarks[i]
    const as = charAttrs[i]
    if (!ms || !as) continue
    const ch = content[i] ?? ''
    if (current && setsEqual(current.marks, ms)) {
      current.text += ch
    } else {
      current = { text: ch, marks: ms, attrs: as }
      segments.push(current)
    }
  }

  return segments.map((seg) => wrapHTML(escapeHtml(seg.text), seg.marks, seg.attrs)).join('')
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  for (const m of a) {
    if (!b.has(m)) return false
  }
  return true
}

function wrapHTML(text: string, marks: Set<string>, attrs: Record<string, Record<string, string>>): string {
  if (marks.size === 0) return text

  let result = text
  if (marks.has('code')) result = `<code>${result}</code>`
  if (marks.has('strikethrough')) result = `<s>${result}</s>`
  if (marks.has('italic')) result = `<em>${result}</em>`
  if (marks.has('bold')) result = `<strong>${result}</strong>`
  if (marks.has('underline')) result = `<u>${result}</u>`
  if (marks.has('highlight')) {
    const color = attrs.highlight?.color ?? '#FEF08A'
    result = `<mark style="background-color:${color}">${result}</mark>`
  }
  if (marks.has('textColor')) {
    const color = attrs.textColor?.color ?? 'inherit'
    result = `<span style="color:${color}">${result}</span>`
  }
  if (marks.has('link')) {
    const href = attrs.link?.href ?? '#'
    result = `<a href="${escapeHtml(href)}">${result}</a>`
  }
  return result
}

// ─── Markdown Export ───────────────────────────────────────────────

export function pageToMarkdown(title: string, blocks: ExportBlock[]): string {
  const lines: string[] = []

  lines.push(`# ${title}`)
  lines.push('')

  let numberedIndex = 1

  for (const block of blocks) {
    const content = applyMarksToMarkdown(block.content, block.marks)

    switch (block.type) {
      case 'heading1':
        lines.push(`# ${content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'heading2':
        lines.push(`## ${content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'heading3':
        lines.push(`### ${content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'bullet_list':
        lines.push(`- ${content}`)
        numberedIndex = 1
        break
      case 'numbered_list':
        lines.push(`${numberedIndex}. ${content}`)
        numberedIndex++
        break
      case 'todo_list': {
        const checked = block.properties?.checked ? 'x' : ' '
        lines.push(`- [${checked}] ${content}`)
        numberedIndex = 1
        break
      }
      case 'code': {
        const lang = (block.properties?.language as string) ?? ''
        lines.push(`\`\`\`${lang}`)
        lines.push(block.content)
        lines.push('```')
        lines.push('')
        numberedIndex = 1
        break
      }
      case 'quote':
        lines.push(`> ${content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'divider':
        lines.push('---')
        lines.push('')
        numberedIndex = 1
        break
      case 'callout': {
        const icon = (block.properties?.calloutIcon as string) ?? '💡'
        lines.push(`> ${icon} ${content}`)
        lines.push('')
        numberedIndex = 1
        break
      }
      case 'image': {
        const url = (block.properties?.imageUrl as string) ?? ''
        const caption = (block.properties?.caption as string) ?? ''
        lines.push(`![${caption}](${url})`)
        lines.push('')
        numberedIndex = 1
        break
      }
      case 'bookmark': {
        const url = (block.properties?.url as string) ?? ''
        lines.push(`[${content || url}](${url})`)
        lines.push('')
        numberedIndex = 1
        break
      }
      case 'simple_table': {
        const rows = block.properties?.rows as string[][] | undefined
        if (rows && rows.length > 0) {
          const headerRow = rows[0]
          if (headerRow) {
            lines.push(`| ${headerRow.join(' | ')} |`)
            lines.push(`| ${headerRow.map(() => '---').join(' | ')} |`)
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i]
              if (row) {
                lines.push(`| ${row.join(' | ')} |`)
              }
            }
          }
          lines.push('')
        }
        numberedIndex = 1
        break
      }
      case 'paragraph':
        lines.push(content)
        lines.push('')
        numberedIndex = 1
        break
      default:
        if (content) {
          lines.push(content)
          lines.push('')
        }
        numberedIndex = 1
        break
    }
  }

  return lines.join('\n')
}

// ─── HTML Export ───────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function pageToHTML(title: string, blocks: ExportBlock[]): string {
  const bodyParts: string[] = []

  bodyParts.push(`    <h1>${escapeHtml(title)}</h1>`)

  for (const block of blocks) {
    const content = applyMarksToHTML(block.content, block.marks)

    switch (block.type) {
      case 'heading1':
        bodyParts.push(`    <h1>${content}</h1>`)
        break
      case 'heading2':
        bodyParts.push(`    <h2>${content}</h2>`)
        break
      case 'heading3':
        bodyParts.push(`    <h3>${content}</h3>`)
        break
      case 'bullet_list':
        bodyParts.push(`    <ul><li>${content}</li></ul>`)
        break
      case 'numbered_list':
        bodyParts.push(`    <ol><li>${content}</li></ol>`)
        break
      case 'todo_list': {
        const checked = block.properties?.checked ? ' checked' : ''
        bodyParts.push(`    <div><label><input type="checkbox"${checked} disabled /> ${content}</label></div>`)
        break
      }
      case 'code': {
        const lang = (block.properties?.language as string) ?? ''
        const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : ''
        bodyParts.push(`    <pre><code${langAttr}>${escapeHtml(block.content)}</code></pre>`)
        break
      }
      case 'quote':
        bodyParts.push(`    <blockquote>${content}</blockquote>`)
        break
      case 'divider':
        bodyParts.push('    <hr />')
        break
      case 'callout': {
        const icon = (block.properties?.calloutIcon as string) ?? '💡'
        bodyParts.push(`    <aside style="padding:12px 16px;background:#FEF3C7;border-radius:8px;border-left:4px solid #F59E0B">${icon} ${content}</aside>`)
        break
      }
      case 'image': {
        const url = (block.properties?.imageUrl as string) ?? ''
        const caption = (block.properties?.caption as string) ?? ''
        bodyParts.push(`    <figure><img src="${escapeHtml(url)}" alt="${escapeHtml(caption)}" style="max-width:100%" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`)
        break
      }
      case 'bookmark': {
        const url = (block.properties?.url as string) ?? ''
        bodyParts.push(`    <p><a href="${escapeHtml(url)}">${content || escapeHtml(url)}</a></p>`)
        break
      }
      case 'simple_table': {
        const rows = block.properties?.rows as string[][] | undefined
        if (rows && rows.length > 0) {
          const tableRows = rows.map((row, i) => {
            const tag = i === 0 ? 'th' : 'td'
            return `      <tr>${row.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join('')}</tr>`
          })
          bodyParts.push(`    <table border="1" cellpadding="8" cellspacing="0">`)
          bodyParts.push(tableRows.join('\n'))
          bodyParts.push(`    </table>`)
        }
        break
      }
      case 'paragraph':
        bodyParts.push(`    <p>${content}</p>`)
        break
      default:
        if (content) {
          bodyParts.push(`    <p>${content}</p>`)
        }
        break
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; padding: 2rem; color: #111827; line-height: 1.6; }
    h1 { font-size: 2rem; margin-top: 2rem; }
    h2 { font-size: 1.5rem; margin-top: 1.5rem; }
    h3 { font-size: 1.25rem; margin-top: 1.25rem; }
    blockquote { border-left: 3px solid #D1D5DB; padding-left: 1rem; margin-left: 0; color: #6B7280; }
    code { background: #F3F4F6; padding: 2px 4px; border-radius: 4px; font-size: 0.875em; }
    pre code { display: block; padding: 1rem; background: #1F2937; color: #F9FAFB; border-radius: 8px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th { background: #F3F4F6; text-align: left; }
    hr { border: none; border-top: 1px solid #E5E7EB; margin: 1.5rem 0; }
    img { max-width: 100%; border-radius: 8px; }
    figcaption { text-align: center; color: #6B7280; font-size: 0.875rem; margin-top: 0.5rem; }
    mark { padding: 0 2px; border-radius: 2px; }
  </style>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`
}
