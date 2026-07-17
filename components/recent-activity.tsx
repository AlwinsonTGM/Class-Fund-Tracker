'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { deleteAuditLogAction, updateAuditLogAction } from '@/app/officer-dashboard/moderator-actions'
import { fetchAuditLogsAction } from '@/app/officer-dashboard/actions'
import { User, AlertTriangle } from 'lucide-react'

export interface AuditLogItem {
  id: number
  officer_email: string
  action_description: string
  created_at: string
}

interface RecentActivityProps {
  activities: AuditLogItem[]
  isModerator?: boolean
}

export function RecentActivity({ activities = [], isModerator = false }: RecentActivityProps) {
  const [localActivities, setLocalActivities] = useState<AuditLogItem[]>(activities)
  const [editingLogId, setEditingLogId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Pagination states
  const [hasMore, setHasMore] = useState(activities.length >= 10)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [logToDelete, setLogToDelete] = useState<number | null>(null)

  // Sync state when props change
  useEffect(() => {
    setLocalActivities(activities)
    setHasMore(activities.length >= 10)
  }, [activities])

  const handleDelete = (logId: number) => {
    setError(null)
    setLogToDelete(logId)
  }

  const confirmDeleteLog = () => {
    if (logToDelete === null) return
    const logId = logToDelete
    setLogToDelete(null)

    setError(null)
    // Trigger slide-out animation
    setDeletingIds((prev) => new Set(prev).add(logId))

    // Wait for animation, then remove and call server
    setTimeout(() => {
      setLocalActivities((prev) => prev.filter((act) => act.id !== logId))
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(logId)
        return next
      })

      startTransition(async () => {
        const result = await deleteAuditLogAction(logId)
        if (!result.success) {
          setError(result.error || 'Failed to delete activity.')
          setLocalActivities(activities)
        }
      })
    }, 450)
  }

  const handleStartEdit = (item: AuditLogItem) => {
    setError(null)
    setEditingLogId(item.id)
    setEditingText(item.action_description)
  }

  const handleCancelEdit = () => {
    setEditingLogId(null)
  }

  const handleSaveEdit = (logId: number) => {
    if (!editingText.trim()) {
      setError('Description cannot be empty.')
      return
    }

    setError(null)
    // Optimistic update
    setLocalActivities((prev) =>
      prev.map((act) => (act.id === logId ? { ...act, action_description: editingText.trim() } : act))
    )

    startTransition(async () => {
      const result = await updateAuditLogAction(logId, editingText.trim())
      if (result.success) {
        setEditingLogId(null)
      } else {
        setError(result.error || 'Failed to update activity.')
        // Rollback
        setLocalActivities(activities)
      }
    })
  }

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    setError(null)
    try {
      const moreLogs = await fetchAuditLogsAction(localActivities.length, 20)
      if (moreLogs.length < 20) {
        setHasMore(false)
      }
      setLocalActivities((prev) => [...prev, ...moreLogs])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to load more activity logs.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section aria-labelledby="activity-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="activity-heading" className="text-base font-semibold text-card-foreground">Recent Activity</h2>
            {localActivities.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground mt-1">No activities have been recorded yet.</p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">The latest actions logged by class officers.</p>
            )}
          </div>
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-primary" />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {localActivities.length > 0 && (
          <div className="max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            <ul className="divide-y divide-border" aria-label="Recent activity log">
              {localActivities.map((activity) => {
                const isEditing = editingLogId === activity.id

                return (
                  <li key={activity.id} className={`flex flex-col py-3 first:pt-0 last:pb-0 text-sm text-foreground gpu-accelerate ${deletingIds.has(activity.id) ? 'anim-slide-out-left overflow-hidden' : ''}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold text-xs bg-muted px-2.5 py-0.5 rounded-full text-foreground/80 truncate max-w-[200px] sm:max-w-none flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" /> {activity.officer_email}
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Moderator Action Buttons */}
                      {isModerator && !isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            onClick={() => handleStartEdit(activity)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-foreground/80 hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg px-2 py-1 cursor-pointer press-spring min-h-[36px] min-w-[44px] flex items-center justify-center"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            disabled={isPending}
                            className="text-[11px] font-semibold text-destructive hover:bg-destructive/10 rounded-lg px-2 py-1 cursor-pointer press-spring min-h-[36px] min-w-[44px] flex items-center justify-center"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      // Inline Editing Input View
                      <div className="flex flex-col gap-2 mt-2">
                        <textarea
                          rows={2}
                          disabled={isPending}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(activity.id)}
                            disabled={isPending}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isPending}
                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/70 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Description Output View
                      <p className="text-sm leading-6 text-muted-foreground mt-1.5 pl-1">
                        {activity.action_description}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-3 border-t border-border">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="text-xs font-semibold text-foreground/80 hover:text-foreground bg-muted hover:bg-muted/80 rounded-full py-2 px-4 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 press-spring"
            >
              {isLoadingMore ? (
                <span className="h-3 w-3 animate-spin rounded-full border border-foreground border-t-transparent" />
              ) : null}
              Show More Activity
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Log Confirmation Modal */}
      {logToDelete !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes modalFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes modalScaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .animate-fade-in {
              animation: modalFadeIn 0.2s forwards ease-out;
            }
            .animate-scale-up {
              animation: modalScaleUp 0.2s forwards ease-out;
            }
          ` }} />
          <div className="bg-card border border-border rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Activity Log?</h3>
                <p className="text-[10px] text-muted-foreground">This action is permanent.</p>
              </div>
            </div>
            
            <p className="text-xs text-foreground/80 leading-relaxed">
              Are you sure you want to delete this activity log item? This will permanently remove the record from transparency history logs.
            </p>

            <div className="flex gap-2.5 mt-2 justify-end">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="px-4 py-1.5 text-xs font-semibold border border-border bg-background rounded-full hover:bg-muted text-foreground cursor-pointer press-spring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLog}
                className="px-4 py-1.5 text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer press-spring"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
