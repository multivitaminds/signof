interface ExportBlock {
  type: string
  content: string
  properties?: Record<string, unknown>
}

export function pageToMarkdown(title: string, blocks: ExportBlock[]): string {
  const lines: string[] = []

  lines.push(`# ${title}`)
  lines.push('')

  let numberedIndex = 1

  for (const block of blocks) {
    switch (block.type) {
      case 'heading1':
        lines.push(`# ${block.content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'heading2':
        lines.push(`## ${block.content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'heading3':
        lines.push(`### ${block.content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'bullet_list':
        lines.push(`- ${block.content}`)
        numberedIndex = 1
        break
      case 'numbered_list':
        lines.push(`${numberedIndex}. ${block.content}`)
        numberedIndex++
        break
      case 'todo_list': {
        const checked = block.properties?.checked ? 'x' : ' '
        lines.push(`- [${checked}] ${block.content}`)
        numberedIndex = 1
        break
      }
      case 'code':
        lines.push('```')
        lines.push(block.content)
        lines.push('```')
        lines.push('')
        numberedIndex = 1
        break
      case 'quote':
        lines.push(`> ${block.content}`)
        lines.push('')
        numberedIndex = 1
        break
      case 'divider':
        lines.push('---')
        lines.push('')
        numberedIndex = 1
        break
      case 'paragraph':
        lines.push(block.content)
        lines.push('')
        numberedIndex = 1
        break
      default:
        lines.push(block.content)
        lines.push('')
        numberedIndex = 1
        break
    }
  }

  return lines.join('\n')
}

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
    const content = escapeHtml(block.content)

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
      case 'code':
        bodyParts.push(`    <pre><code>${content}</code></pre>`)
        break
      case 'quote':
        bodyParts.push(`    <blockquote>${content}</blockquote>`)
        break
      case 'divider':
        bodyParts.push('    <hr />')
        break
      case 'paragraph':
        bodyParts.push(`    <p>${content}</p>`)
        break
      default:
        bodyParts.push(`    <p>${content}</p>`)
        break
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`
}
