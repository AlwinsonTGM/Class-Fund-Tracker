'use client'

import React from 'react'
import { Download } from 'lucide-react'
import { getEmbeddableUrl } from './utils'

export interface ObsidianMarkdownViewerProps {
  selectedLocalDoc: {
    id: string
    title: string
    type: string
    path: string
    content?: string
    isDefault?: boolean
    isDb?: boolean
  }
  mdContent: string
  mdLoading: boolean
}

export function ObsidianMarkdownViewer({
  selectedLocalDoc,
  mdContent,
  mdLoading
}: ObsidianMarkdownViewerProps) {
  return (
    <div className="md:col-span-9 bg-card border border-border rounded-3xl p-5 shadow-sm relative min-h-[500px] md:min-h-[680px] flex flex-col">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">{selectedLocalDoc.title}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Format: {selectedLocalDoc.type === 'pdf' ? 'Embedded PDF' : 'Parsed Markdown with Obsidian Style'}
          </p>
        </div>
        <a
          href={selectedLocalDoc.path || '#'}
          download
          onClick={selectedLocalDoc.content !== undefined ? (e) => {
            e.preventDefault()
            const blob = new Blob([selectedLocalDoc.content || ''], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${selectedLocalDoc.title.toLowerCase().replace(/\s+/g, '_')}.md`
            a.click()
            URL.revokeObjectURL(url)
          } : undefined}
          className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/10 rounded-full px-3 py-1.5 flex items-center gap-1 transition-all"
        >
          <Download className="h-3.5 w-3.5" /> Download File
        </a>
      </div>

      <div className="flex-1 flex flex-col justify-stretch">
        {selectedLocalDoc.type === 'pdf' ? (
          <div className="relative w-full h-[450px] sm:h-[550px] md:h-[720px] lg:h-[800px] rounded-2xl overflow-hidden border border-border/40 bg-muted/20">
            <iframe
              src={getEmbeddableUrl(selectedLocalDoc.path).embedUrl || selectedLocalDoc.path}
              className="w-full h-full border-0 absolute inset-0 z-10"
              title={selectedLocalDoc.title}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-0 bg-muted/5 gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-[10px] text-slate-400">Loading document projection frame...</span>
            </div>
          </div>
        ) : mdLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs font-semibold text-muted-foreground">Parsing note styling...</p>
          </div>
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none text-foreground text-sm selection:bg-primary/20 font-normal leading-relaxed pb-4 custom-scrollbar overflow-y-auto max-h-[500px] md:max-h-[680px] pr-2"
            dangerouslySetInnerHTML={{ __html: mdContent }}
          />
        )}
      </div>
    </div>
  )
}
