export const TASK_TYPES = ['Assignment', 'Project', 'Quiz', 'Exam', 'Presentation', 'Lab Activity', 'Report'] as const
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const
export const PARTICIPATION_TYPES = ['Solo', 'Group'] as const
export const GROUP_SIZES = ['Duo', 'Trio', 'Quad', '5+', 'Whole Section'] as const

export const PRESELECTED_BG_PHOTOS = [
  { id: 'neon-cyber', path: '/photo/096bbaab99e63b536c769426455f9b6d.jpg', label: 'Neon Cyber' },
  { id: 'digital-grid', path: '/photo/5febfb106d9bf21bf5b943d1c193d372.jpg', label: 'Digital Grid' },
  { id: 'synthwave-hills', path: '/photo/f492072849d8b61b681fd861dd820b20.jpg', label: 'Synthwave Hills' },
  { id: 'glitch-art', path: '/photo/fadfds.jpg', label: 'Glitch Art' },
  { id: 'cyberpunk-alley', path: '/photo/images.jpg', label: 'Cyberpunk Alley' },
  { id: 'hacker-matrix', path: '/photo/thumb-1920-1138740.png', label: 'Matrix' }
]

export const PRIORITY_THEMES = {
  Urgent: {
    border: 'border-l-4 border-l-rose-500 border-rose-500/20',
    badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
    dot: 'bg-rose-500 animate-pulse'
  },
  High: {
    border: 'border-l-4 border-l-amber-500 border-amber-500/20',
    badge: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  Medium: {
    border: 'border-l-4 border-l-emerald-500 border-emerald-500/20',
    badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  Low: {
    border: 'border-l-4 border-l-muted-foreground/30 border-border/80',
    badge: 'text-muted-foreground bg-muted/60 border-border/50',
    dot: 'bg-muted-foreground/50'
  }
}

export function getDueStatus(dueDateStr: string, status: string) {
  if (status === 'Completed') return { text: 'Completed', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400', isOverdue: false }
  
  const now = new Date()
  const due = new Date(dueDateStr)
  const diffMs = due.getTime() - now.getTime()
  const isOverdue = diffMs < 0
  const absDiff = Math.abs(diffMs)
  
  const diffMins = Math.floor(absDiff / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  let text = ''
  if (diffDays > 0) {
    text = `${diffDays}d ${diffHours % 24}h ${isOverdue ? 'overdue' : 'left'}`
  } else if (diffHours > 0) {
    text = `${diffHours}h ${diffMins % 60}m ${isOverdue ? 'overdue' : 'left'}`
  } else {
    text = `${diffMins}m ${isOverdue ? 'overdue' : 'left'}`
  }
  
  const color = isOverdue 
    ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse font-bold'
    : diffDays === 0 
      ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 font-semibold'
      : 'text-muted-foreground bg-muted/50 border-border'
      
  return { text, color, isOverdue }
}
