'use client'

import React from 'react'
import { Search, Settings, CheckCircle2, ClipboardList, X } from 'lucide-react'
import { Course } from './types'
import { TASK_TYPES, PRIORITIES, PARTICIPATION_TYPES } from './constants'

export interface TaskFilterHeaderProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  showFilters: boolean
  setShowFilters: (val: boolean | ((prev: boolean) => boolean)) => void
  showCompleted: boolean
  setShowCompleted: (val: boolean | ((prev: boolean) => boolean)) => void
  filterCourses: string[]
  setFilterCourses: (val: string[]) => void
  filterTypes: string[]
  setFilterTypes: (val: string[]) => void
  filterPriority: string
  setFilterPriority: (val: string) => void
  filterParticipation: string
  setFilterParticipation: (val: string) => void
  courses: Course[]
}

export function TaskFilterHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  showCompleted,
  setShowCompleted,
  filterCourses,
  setFilterCourses,
  filterTypes,
  setFilterTypes,
  filterPriority,
  setFilterPriority,
  filterParticipation,
  setFilterParticipation,
  courses
}: TaskFilterHeaderProps) {
  const handleCourseFilterToggle = (code: string) => {
    if (filterCourses.includes(code)) {
      setFilterCourses(filterCourses.filter(c => c !== code))
    } else {
      setFilterCourses([...filterCourses, code])
    }
  }

  const handleTypeFilterToggle = (type: string) => {
    if (filterTypes.includes(type)) {
      setFilterTypes(filterTypes.filter(t => t !== type))
    } else {
      setFilterTypes([...filterTypes, type])
    }
  }

  const hasActiveFilters = filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All' || searchQuery.trim() !== ''

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 min-h-[44px] text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold border border-border rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer press-spring ${
              showFilters || filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All'
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-3.5 w-3.5" /> Filters
            {(filterCourses.length > 0 || filterTypes.length > 0 || filterPriority !== 'All' || filterParticipation !== 'All') && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
          <button
            onClick={() => setShowCompleted(v => !v)}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold border border-border rounded-full transition-colors cursor-pointer press-spring flex items-center justify-center gap-1.5 ${
              showCompleted 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {showCompleted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Showing Completed</span>
              </>
            ) : (
              <>
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Show Completed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Filters Panel */}
      {showFilters && (
        <div className="border-t border-border/40 pt-3 mt-1 flex flex-col gap-4 anim-stagger-in">
          {/* Courses Filters */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Academic Course</span>
            <div className="flex flex-wrap gap-1.5">
              {courses.map(course => {
                const isSelected = filterCourses.includes(course.code)
                return (
                  <button
                    key={course.id}
                    onClick={() => handleCourseFilterToggle(course.code)}
                    className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold border rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isSelected 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {course.code}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Task Type Filters */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Filter by Task Type</span>
            <div className="flex flex-wrap gap-1.5">
              {TASK_TYPES.map(type => {
                const isSelected = filterTypes.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeFilterToggle(type)}
                    className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold border rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isSelected 
                        ? 'bg-foreground border-foreground text-background' 
                        : 'border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Select Criteria row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Participation</span>
              <select
                value={filterParticipation}
                onChange={(e) => setFilterParticipation(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2.5 min-h-[44px] text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                {PARTICIPATION_TYPES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Removable Active Tags & Clear Button */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 mt-1">
          <span className="text-[10px] font-bold text-muted-foreground mr-1">Active:</span>
          
          {searchQuery.trim() !== '' && (
            <span className="flex items-center gap-1 pl-2.5 pr-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-rose-500 cursor-pointer"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filterCourses.map(code => (
            <span key={code} className="flex items-center gap-1 pl-2.5 pr-0.5 text-[9px] font-semibold bg-primary/10 border border-primary/20 rounded-full text-primary">
              {code}
              <button
                onClick={() => handleCourseFilterToggle(code)}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-rose-500 cursor-pointer"
                aria-label={`Remove ${code} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filterTypes.map(type => (
            <span key={type} className="flex items-center gap-1 pl-2.5 pr-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
              {type}
              <button
                onClick={() => handleTypeFilterToggle(type)}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-rose-500 cursor-pointer"
                aria-label={`Remove ${type} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {filterPriority !== 'All' && (
            <span className="flex items-center gap-1 pl-2.5 pr-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
              Priority: {filterPriority}
              <button
                onClick={() => setFilterPriority('All')}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-rose-500 cursor-pointer"
                aria-label="Remove priority filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filterParticipation !== 'All' && (
            <span className="flex items-center gap-1 pl-2.5 pr-0.5 text-[9px] font-semibold bg-muted border border-border rounded-full text-foreground">
              {filterParticipation}
              <button
                onClick={() => setFilterParticipation('All')}
                className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-rose-500 cursor-pointer"
                aria-label="Remove participation filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              setFilterCourses([])
              setFilterTypes([])
              setFilterPriority('All')
              setFilterParticipation('All')
              setSearchQuery('')
            }}
            className="min-h-[44px] min-w-[44px] px-3 py-2 text-[10px] font-bold text-rose-500 hover:underline cursor-pointer flex items-center justify-center ml-auto"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  )
}
