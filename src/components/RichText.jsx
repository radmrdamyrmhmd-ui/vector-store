/**
 * Minimal long-form renderer for operator-entered content.
 * Supports blank-line paragraphs, "## heading" lines and "- item" lists.
 * Everything is rendered as text, never as HTML, so stored content cannot inject markup.
 */
export default function RichText({ text, className = '' }) {
  const blocks = String(text || '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (blocks.length === 0) return null

  return (
    <div className={`space-y-5 text-[14.5px] leading-9 text-ink/75 ${className}`}>
      {blocks.map((block, index) => {
        const key = `${index}-${block.slice(0, 16)}`
        if (block.startsWith('## ')) {
          return (
            <h2 key={key} className="pt-3 text-[19px] leading-8 text-ink sm:text-[21px]">
              {block.slice(3).trim()}
            </h2>
          )
        }
        if (block.startsWith('### ')) {
          return (
            <h3 key={key} className="pt-2 text-[16px] text-ink">
              {block.slice(4).trim()}
            </h3>
          )
        }
        const lines = block.split('\n').map((line) => line.trim())
        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={key} className="space-y-2 pr-1">
              {lines.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="mt-[15px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span>{line.slice(2).trim()}</span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={key}>{lines.join(' ')}</p>
      })}
    </div>
  )
}
