export interface WeekItem {
  id?: number
  week_number: number
  date_range: string
  status?: string
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
}

export function findCurrentWeekNumber(weeks: WeekItem[]): number {
  if (!weeks || weeks.length === 0) return 1
  const sorted = [...weeks].sort((a, b) => a.week_number - b.week_number)
  const now = new Date()
  const currentYear = now.getFullYear()

  for (const week of sorted) {
    if (!week.date_range) continue
    try {
      // e.g. "Jul 20 – 26", "Jul 27 – Aug 2", "Jul 20 - Jul 26", "Aug 3 - Aug 9"
      const cleanStr = week.date_range.replace(/[–—]/g, '-').trim()
      const parts = cleanStr.split('-').map((s) => s.trim())

      if (parts.length === 2) {
        const startTokens = parts[0].split(/\s+/)
        const endTokens = parts[1].split(/\s+/)

        let startMonth = -1
        let startDay = -1
        let endMonth = -1
        let endDay = -1

        startTokens.forEach((t) => {
          const lower = t.toLowerCase().slice(0, 3)
          if (MONTH_MAP[lower] !== undefined) startMonth = MONTH_MAP[lower]
          else if (/^\d+$/.test(t)) startDay = parseInt(t, 10)
        })

        endTokens.forEach((t) => {
          const lower = t.toLowerCase().slice(0, 3)
          if (MONTH_MAP[lower] !== undefined) endMonth = MONTH_MAP[lower]
          else if (/^\d+$/.test(t)) endDay = parseInt(t, 10)
        })

        if (endMonth === -1) endMonth = startMonth

        if (startMonth !== -1 && startDay !== -1 && endDay !== -1) {
          let startYear = currentYear
          let endYear = currentYear

          if (startMonth > endMonth) {
            if (now.getMonth() === 0) startYear = currentYear - 1
            else endYear = currentYear + 1
          }

          const startDate = new Date(startYear, startMonth, startDay, 0, 0, 0)
          const endDate = new Date(endYear, endMonth, endDay, 23, 59, 59)

          if (now >= startDate && now <= endDate) {
            return week.week_number
          }
        }
      }
    } catch (err) {
      console.warn('Failed parsing week date range:', week.date_range, err)
    }
  }

  // Fallback: If current date is past or between weeks, pick active week or week matching closest range
  const activeWeek = sorted.find((w) => w.status === 'active')
  if (activeWeek) return activeWeek.week_number

  return sorted[0]?.week_number || 1
}
