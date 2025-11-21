import type { Note } from '../types/Note'

export const getDateSummary = (note: Note): string => {
  if (note.dateType === 'exact' && note.dateStart) {
    return `Exact: ${note.dateStart}`
  }

  if (
    note.dateType === 'approx_range' &&
    note.dateStart &&
    note.rangeMarginDays !== undefined
  ) {
    return `Around: ${note.dateStart} (±${note.rangeMarginDays} days)`
  }

  if (note.dateType === 'broad_period' && note.dateStart && note.dateEnd) {
    return `Period: ${note.dateStart} – ${note.dateEnd}`
  }

  if (note.dateStart) {
    return `Date: ${note.dateStart}`
  }

  return 'No date'
}

export const sortNotesByDate = (notes: Note[]): Note[] =>
  [...notes].sort((a, b) => {
    if (a.dateStart && b.dateStart) {
      return a.dateStart.localeCompare(b.dateStart)
    }
    if (a.dateStart) return -1
    if (b.dateStart) return 1
    return 0
  })

const toDoc = (html: string) => {
  const parser = new DOMParser()
  return parser.parseFromString(html, 'text/html')
}

export const htmlToPlainText = (html: string): string => {
  if (!html) return ''
  try {
    const doc = toDoc(html)
    return doc.body.textContent?.trim() ?? ''
  } catch {
    return html
  }
}

export const getBodyPreview = (body: string, maxLength = 160): string => {
  const text = htmlToPlainText(body)
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export const htmlToMarkdown = (html: string): string => {
  if (!html) return ''
  try {
    const doc = toDoc(html)
    const lines: string[] = []

    const serialize = (node: Node, prefix = ''): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? ''
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return ''
      const element = node as HTMLElement
      const children = Array.from(element.childNodes)

      switch (element.tagName) {
        case 'P': {
          const content = children.map((child) => serialize(child, prefix)).join('')
          if (content.trim().length) lines.push(content.trim())
          return ''
        }
        case 'BR':
          lines.push('')
          return ''
        case 'UL': {
          children.forEach((child) => serialize(child, '- '))
          return ''
        }
        case 'OL': {
          children.forEach((child, index) =>
            serialize(child, `${index + 1}. `),
          )
          return ''
        }
        case 'LI': {
          const content = children.map((child) => serialize(child, prefix)).join('')
          if (content.trim().length) {
            lines.push(`${prefix}${content.trim()}`)
          }
          return ''
        }
        case 'STRONG':
        case 'B':
          return `**${children.map((child) => serialize(child, prefix)).join('')}**`
        case 'EM':
        case 'I':
          return `_${children.map((child) => serialize(child, prefix)).join('')}_`
        case 'DIV':
        case 'SECTION':
        case 'ARTICLE': {
          children.forEach((child) => serialize(child, prefix))
          lines.push('')
          return ''
        }
        default:
          return children.map((child) => serialize(child, prefix)).join('')
      }
    }

    Array.from(doc.body.childNodes).forEach((node) => {
      const content = serialize(node)
      if (content.trim().length) {
        lines.push(content.trim())
      }
    })

    return lines.join('\n\n').trim()
  } catch {
    return html
  }
}
