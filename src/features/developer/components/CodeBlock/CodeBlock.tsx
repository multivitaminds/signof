import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import './CodeBlock.css'

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

function CodeBlock({ code, language, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  const lines = code.split('\n')

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__language">{language}</span>
        <button
          className="code-block__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          type="button"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block__body">
        <pre className="code-block__pre">
          <code className="code-block__code">
            {showLineNumbers ? (
              lines.map((line, i) => (
                <div className="code-block__line" key={i}>
                  <span className="code-block__line-number">{i + 1}</span>
                  <span className="code-block__line-content">{line}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default CodeBlock
