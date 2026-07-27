export function getEmbeddableUrl(url: string): { embedUrl: string | null; isEmbeddable: boolean; type: string } {
  if (!url) return { embedUrl: null, isEmbeddable: false, type: 'unknown' }

  try {
    const cleanUrl = url.trim()
    
    // Google Drive Sharing Links
    if (cleanUrl.includes('drive.google.com')) {
      const match = cleanUrl.match(/\/file\/d\/([^/]+)/)
      if (match && match[1]) {
        return {
          embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`,
          isEmbeddable: true,
          type: 'Google Drive'
        }
      }
      const matchId = cleanUrl.match(/[?&]id=([^&]+)/)
      if (matchId && matchId[1]) {
        return {
          embedUrl: `https://drive.google.com/file/d/${matchId[1]}/preview`,
          isEmbeddable: true,
          type: 'Google Drive'
        }
      }
    }

    // Google Docs/Slides/Sheets
    if (cleanUrl.includes('docs.google.com')) {
      if (cleanUrl.includes('/document/')) {
        const match = cleanUrl.match(/\/document\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/document/d/${match[1]}/preview`,
            isEmbeddable: true,
            type: 'Google Doc'
          }
        }
      }
      if (cleanUrl.includes('/presentation/')) {
        const match = cleanUrl.match(/\/presentation\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/presentation/d/${match[1]}/embed?start=false&loop=false&delayms=3000`,
            isEmbeddable: true,
            type: 'Google Slides'
          }
        }
      }
      if (cleanUrl.includes('/spreadsheets/')) {
        const match = cleanUrl.match(/\/spreadsheets\/d\/([^/]+)/)
        if (match && match[1]) {
          return {
            embedUrl: `https://docs.google.com/spreadsheets/d/${match[1]}/preview`,
            isEmbeddable: true,
            type: 'Google Sheets'
          }
        }
      }
    }

    // Direct PDFs or Data URL PDFs
    if (cleanUrl.startsWith('data:application/pdf') || cleanUrl.toLowerCase().endsWith('.pdf')) {
      return {
        embedUrl: cleanUrl,
        isEmbeddable: true,
        type: 'PDF Document'
      }
    }

    // General URL (non-embeddable due to same-origin security policies)
    return {
      embedUrl: cleanUrl,
      isEmbeddable: false,
      type: 'External Link'
    }
  } catch {
    return { embedUrl: url, isEmbeddable: false, type: 'unknown' }
  }
}

export function parseObsidianMarkdown(md: string): string {
  if (!md) return ''
  const lines = md.split('\n')
  const result: string[] = []
  let calloutBlock: { type: string; title: string; lines: string[] } | null = null

  const getCalloutStyles = (type: string) => {
    const t = type.toLowerCase()
    if (t === 'warning') return { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-400 dark:border-amber-900', text: 'text-amber-800 dark:text-amber-300', icon: '⚠️' }
    if (t === 'danger' || t === 'error' || t === 'critical' || t === 'caution') return { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-400 dark:border-rose-900', text: 'text-rose-800 dark:text-rose-300', icon: '🚨' }
    if (t === 'tip' || t === 'success' || t === 'check') return { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-400 dark:border-emerald-900', text: 'text-emerald-800 dark:text-emerald-300', icon: '💡' }
    return { bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-400 dark:border-sky-900', text: 'text-sky-800 dark:text-sky-300', icon: 'ℹ️' }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (calloutBlock) {
      if (line.startsWith('>') || line.trim() === '>') {
        const content = line.replace(/^>\s?/, '')
        calloutBlock.lines.push(content)
        continue
      } else {
        const styles = getCalloutStyles(calloutBlock.type)
        const calloutContent = parseObsidianMarkdown(calloutBlock.lines.join('\n'))
        result.push(`
          <div class="my-4 p-4 rounded-2xl border-l-4 ${styles.bg} ${styles.border} ${styles.text}">
            <div class="flex items-center gap-2 font-bold mb-1.5 text-xs uppercase tracking-wider">
              <span>${styles.icon}</span>
              <span>${calloutBlock.title || calloutBlock.type}</span>
            </div>
            <div class="text-sm leading-relaxed">${calloutContent}</div>
          </div>
        `)
        calloutBlock = null
      }
    }

    if (line.startsWith('&gt; [!') || line.startsWith('> [!')) {
      const match = line.match(/^&gt;\s?\[!([^\]]+)\]\s?(.*)$/) || line.match(/^>\s?\[!([^\]]+)\]\s?(.*)$/)
      if (match) {
        calloutBlock = {
          type: match[1],
          title: match[2],
          lines: []
        }
        continue
      }
    }

    if (line.startsWith('# ')) {
      result.push(`<h1 class="text-2xl font-extrabold text-foreground border-b border-border/40 pb-2 mt-6 mb-3">${line.substring(2)}</h1>`)
      continue
    }
    if (line.startsWith('## ')) {
      result.push(`<h2 class="text-xl font-bold text-foreground mt-5 mb-2.5">${line.substring(3)}</h2>`)
      continue
    }
    if (line.startsWith('### ')) {
      result.push(`<h3 class="text-lg font-bold text-foreground mt-4 mb-2">${line.substring(4)}</h3>`)
      continue
    }

    if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
      result.push(`<div class="flex items-center gap-2.5 my-1.5 text-muted-foreground/75 line-through decoration-muted-foreground/50"><input type="checkbox" checked disabled class="accent-primary size-4 rounded cursor-not-allowed" /> <span class="text-sm font-sans">${line.substring(6)}</span></div>`)
      continue
    }
    if (line.startsWith('- [ ] ')) {
      result.push(`<div class="flex items-center gap-2.5 my-1.5 text-foreground"><input type="checkbox" disabled class="size-4 rounded border-border cursor-not-allowed" /> <span class="text-sm font-sans">${line.substring(6)}</span></div>`)
      continue
    }

    if (line.startsWith('- ')) {
      result.push(`<li class="list-disc list-inside ml-4 my-1 text-muted-foreground text-sm font-sans">${line.substring(2)}</li>`)
      continue
    }

    if (line.trim() === '') {
      result.push('<div class="h-2"></div>')
      continue
    }

    const inlineLine = line
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200/80 dark:bg-yellow-800/80 text-slate-900 dark:text-zinc-100 rounded px-1.5 py-0.5 font-semibold">$1</mark>')
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-semibold">$2</span>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-semibold">$1</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')

    result.push(`<p class="text-sm font-sans leading-relaxed text-muted-foreground my-1">${inlineLine}</p>`)
  }

  if (calloutBlock) {
    const styles = getCalloutStyles(calloutBlock.type)
    const calloutContent = parseObsidianMarkdown(calloutBlock.lines.join('\n'))
    result.push(`
      <div class="my-4 p-4 rounded-2xl border-l-4 ${styles.bg} ${styles.border} ${styles.text}">
        <div class="flex items-center gap-2 font-bold mb-1.5 text-xs uppercase tracking-wider">
          <span>${styles.icon}</span>
          <span>${calloutBlock.title || calloutBlock.type}</span>
        </div>
        <div class="text-sm leading-relaxed">${calloutContent}</div>
      </div>
    `)
  }

  return result.join('\n')
}
