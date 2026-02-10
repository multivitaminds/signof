import { pageToMarkdown, pageToHTML } from '../exportPage'

describe('pageToMarkdown', () => {
  it('exports page title as h1', () => {
    const result = pageToMarkdown('Test Page', [])
    expect(result).toContain('# Test Page')
  })

  it('exports headings correctly', () => {
    const result = pageToMarkdown('Page', [
      { type: 'heading1', content: 'H1' },
      { type: 'heading2', content: 'H2' },
      { type: 'heading3', content: 'H3' },
    ])
    expect(result).toContain('# H1')
    expect(result).toContain('## H2')
    expect(result).toContain('### H3')
  })

  it('exports bullet lists', () => {
    const result = pageToMarkdown('Page', [
      { type: 'bullet_list', content: 'Item 1' },
      { type: 'bullet_list', content: 'Item 2' },
    ])
    expect(result).toContain('- Item 1')
    expect(result).toContain('- Item 2')
  })

  it('exports numbered lists with incrementing numbers', () => {
    const result = pageToMarkdown('Page', [
      { type: 'numbered_list', content: 'First' },
      { type: 'numbered_list', content: 'Second' },
      { type: 'numbered_list', content: 'Third' },
    ])
    expect(result).toContain('1. First')
    expect(result).toContain('2. Second')
    expect(result).toContain('3. Third')
  })

  it('exports todo lists', () => {
    const result = pageToMarkdown('Page', [
      { type: 'todo_list', content: 'Done', properties: { checked: true } },
      { type: 'todo_list', content: 'Pending', properties: { checked: false } },
    ])
    expect(result).toContain('- [x] Done')
    expect(result).toContain('- [ ] Pending')
  })

  it('exports code blocks', () => {
    const result = pageToMarkdown('Page', [
      { type: 'code', content: 'const x = 1', properties: { language: 'ts' } },
    ])
    expect(result).toContain('```ts')
    expect(result).toContain('const x = 1')
    expect(result).toContain('```')
  })

  it('exports quotes', () => {
    const result = pageToMarkdown('Page', [
      { type: 'quote', content: 'A wise saying' },
    ])
    expect(result).toContain('> A wise saying')
  })

  it('exports dividers', () => {
    const result = pageToMarkdown('Page', [
      { type: 'divider', content: '' },
    ])
    expect(result).toContain('---')
  })

  it('exports callouts', () => {
    const result = pageToMarkdown('Page', [
      { type: 'callout', content: 'Important note', properties: { calloutIcon: '⚠️' } },
    ])
    expect(result).toContain('> ⚠️ Important note')
  })

  it('exports images', () => {
    const result = pageToMarkdown('Page', [
      { type: 'image', content: '', properties: { imageUrl: 'https://example.com/img.png', caption: 'My image' } },
    ])
    expect(result).toContain('![My image](https://example.com/img.png)')
  })

  it('exports bookmarks', () => {
    const result = pageToMarkdown('Page', [
      { type: 'bookmark', content: 'Example', properties: { url: 'https://example.com' } },
    ])
    expect(result).toContain('[Example](https://example.com)')
  })

  it('exports tables', () => {
    const result = pageToMarkdown('Page', [
      { type: 'simple_table', content: '', properties: { rows: [['Name', 'Age'], ['Alice', '30']] } },
    ])
    expect(result).toContain('| Name | Age |')
    expect(result).toContain('| --- | --- |')
    expect(result).toContain('| Alice | 30 |')
  })

  it('exports paragraphs', () => {
    const result = pageToMarkdown('Page', [
      { type: 'paragraph', content: 'Hello world' },
    ])
    expect(result).toContain('Hello world')
  })

  it('applies inline marks to markdown', () => {
    const result = pageToMarkdown('Page', [
      {
        type: 'paragraph',
        content: 'Hello world',
        marks: [{ type: 'bold', from: 0, to: 5 }],
      },
    ])
    expect(result).toContain('**Hello**')
  })

  it('applies italic marks', () => {
    const result = pageToMarkdown('Page', [
      {
        type: 'paragraph',
        content: 'Hello world',
        marks: [{ type: 'italic', from: 6, to: 11 }],
      },
    ])
    expect(result).toContain('*world*')
  })

  it('applies link marks', () => {
    const result = pageToMarkdown('Page', [
      {
        type: 'paragraph',
        content: 'Click here',
        marks: [{ type: 'link', from: 0, to: 10, attrs: { href: 'https://example.com' } }],
      },
    ])
    expect(result).toContain('[Click here](https://example.com)')
  })
})

describe('pageToHTML', () => {
  it('exports valid HTML document', () => {
    const result = pageToHTML('Test', [])
    expect(result).toContain('<!DOCTYPE html>')
    expect(result).toContain('<title>Test</title>')
    expect(result).toContain('<h1>Test</h1>')
  })

  it('exports headings as HTML tags', () => {
    const result = pageToHTML('Page', [
      { type: 'heading1', content: 'H1' },
      { type: 'heading2', content: 'H2' },
      { type: 'heading3', content: 'H3' },
    ])
    expect(result).toContain('<h1>H1</h1>')
    expect(result).toContain('<h2>H2</h2>')
    expect(result).toContain('<h3>H3</h3>')
  })

  it('exports code blocks with language class', () => {
    const result = pageToHTML('Page', [
      { type: 'code', content: 'const x = 1', properties: { language: 'ts' } },
    ])
    expect(result).toContain('class="language-ts"')
    expect(result).toContain('const x = 1')
  })

  it('exports callouts as aside', () => {
    const result = pageToHTML('Page', [
      { type: 'callout', content: 'Note', properties: { calloutIcon: '💡' } },
    ])
    expect(result).toContain('<aside')
    expect(result).toContain('Note')
  })

  it('exports images with alt text', () => {
    const result = pageToHTML('Page', [
      { type: 'image', content: '', properties: { imageUrl: 'https://img.com/pic.png', caption: 'A picture' } },
    ])
    expect(result).toContain('<img')
    expect(result).toContain('alt="A picture"')
  })

  it('exports todo items with checkboxes', () => {
    const result = pageToHTML('Page', [
      { type: 'todo_list', content: 'Done task', properties: { checked: true } },
    ])
    expect(result).toContain('checked')
    expect(result).toContain('Done task')
  })

  it('exports dividers as hr', () => {
    const result = pageToHTML('Page', [
      { type: 'divider', content: '' },
    ])
    expect(result).toContain('<hr />')
  })

  it('escapes HTML in content', () => {
    const result = pageToHTML('Page', [
      { type: 'paragraph', content: '<script>alert("xss")</script>' },
    ])
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('applies inline marks to HTML', () => {
    const result = pageToHTML('Page', [
      {
        type: 'paragraph',
        content: 'Hello world',
        marks: [{ type: 'bold', from: 0, to: 5 }],
      },
    ])
    expect(result).toContain('<strong>Hello</strong>')
  })

  it('includes styling in HTML output', () => {
    const result = pageToHTML('Page', [])
    expect(result).toContain('<style>')
    expect(result).toContain('font-family')
  })
})
