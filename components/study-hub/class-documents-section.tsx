'use client'

import React, { useState } from 'react'
import { PlusCircle, FileText, Download, Trash2, ChevronRight } from 'lucide-react'
import { UserType } from './types'

export interface ClassDocumentItem {
  id: string
  title: string
  type: string
  path: string
  content?: string
  isDefault?: boolean
  isDb?: boolean
  dbId?: string
  uploadedBy?: string
}

export interface ClassDocumentsSectionProps {
  docsList: ClassDocumentItem[]
  selectedLocalDoc: ClassDocumentItem
  setSelectedLocalDoc: (doc: ClassDocumentItem) => void
  user?: UserType | null
  onOpenAddDocModal: () => void
  onDeleteDoc: (e: React.MouseEvent, docId: string) => void
  children?: React.ReactNode
}

export function ClassDocumentsSection({
  docsList,
  selectedLocalDoc,
  setSelectedLocalDoc,
  user,
  onOpenAddDocModal,
  onDeleteDoc,
  children
}: ClassDocumentsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in">
      {/* Docs Selector Sidebar */}
      <div className="md:col-span-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Official Class Files</span>
          {user && (
            <button
              onClick={onOpenAddDocModal}
              className="min-h-[44px] text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/10 rounded-full px-3 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer press-spring"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Doc
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {docsList.map(doc => {
            const isSelected = selectedLocalDoc.id === doc.id
            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-card border-primary shadow-sm ring-2 ring-primary/10'
                    : 'bg-card/50 border-border/50 text-muted-foreground'
                }`}
              >
                <button
                  onClick={() => setSelectedLocalDoc(doc)}
                  className="flex items-center gap-3 text-left cursor-pointer flex-1 min-w-0 min-h-[44px]"
                >
                  <div className={`p-2 rounded-xl border ${isSelected ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/40 border-border text-muted-foreground'}`}>
                    {doc.type === 'pdf' ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{doc.title}</p>
                    <p className="text-[9px] uppercase tracking-wider opacity-60 font-semibold mt-0.5">{doc.type === 'pdf' ? 'PDF Document' : 'Obsidian Note'}</p>
                  </div>
                </button>
                
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {!doc.isDefault && user && (
                    <button
                      onClick={(e) => onDeleteDoc(e, doc.id)}
                      className="size-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <ChevronRight className={`h-4 w-4 opacity-40 transition-transform ${isSelected ? 'translate-x-0.5 opacity-80 text-primary' : ''}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Children: Markdown Viewer */}
      {children}
    </div>
  )
}
