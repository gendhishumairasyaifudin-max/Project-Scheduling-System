// Perhitungan Critical Path Method (CPM) dan penjadwalan Gantt
import { parseDate, diffDays, todayISO } from './projectUtils'

// Hitung tanggal mulai & selesai efektif dengan memperhitungkan dependensi parent
export function computeEffectiveDates(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const computed = new Map()
  const visiting = new Set()
  let hasCycle = false

  function compute(task) {
    if (computed.has(task.id)) return computed.get(task.id)
    if (visiting.has(task.id)) {
      hasCycle = true
      return null
    }
    visiting.add(task.id)

    let earliestStart = null
    if (task.parentId != null && byId.has(task.parentId)) {
      const parent = byId.get(task.parentId)
      const parentDates = compute(parent)
      if (parentDates && parentDates.endISO) {
        const parentEnd = parseDate(parentDates.endISO)
        const next = new Date(parentEnd)
        next.setDate(next.getDate() + 1)
        earliestStart = next
      }
    }

    const durasi = Math.max(1, Number(task.durasi) || 1)
    const manualStart = task.tanggalMulai ? parseDate(task.tanggalMulai) : null
    let start = manualStart
    if (!start) start = earliestStart || parseDate(todayISO())
    if (earliestStart && start < earliestStart) start = earliestStart

    const end = new Date(start)
    end.setDate(end.getDate() + durasi - 1)

    const toISO = (d) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${dd}`
    }

    const result = { startISO: toISO(start), endISO: toISO(end) }
    visiting.delete(task.id)
    computed.set(task.id, result)
    return result
  }

  const output = []
  for (const task of tasks) {
    const dates = compute(task)
    output.push({ ...task, ...dates })
  }
  return { tasks: output, hasCycle }
}

// Forward pass: Earliest Start (ES) & Earliest Finish (EF)
// Backward pass: Latest Start (LS) & Latest Finish (LF), kemudian Slack & Critical
export function computeCriticalPath(tasks) {
  const { tasks: scheduled, hasCycle } = computeEffectiveDates(tasks)
  if (hasCycle) {
    return { tasks: [], hasCycle: true, projectDuration: 0, criticalPath: [] }
  }

  // urutan topological sederhana: sort by startISO lalu proses parent dulu
  const byId = new Map(scheduled.map((t) => [t.id, t]))
  const es = new Map()
  const ef = new Map()
  const ls = new Map()
  const lf = new Map()
  const slack = new Map()

  const projectStart = scheduled.reduce((min, t) => {
    const d = parseDate(t.startISO)
    return !min || d < min ? d : min
  }, null)

  // Forward pass
  function forwardPass(task) {
    if (ef.has(task.id)) return ef.get(task.id)
    let startOffset = 0
    if (task.parentId != null && byId.has(task.parentId)) {
      const parentEf = forwardPass(byId.get(task.parentId))
      startOffset = parentEf
    } else {
      startOffset = projectStart ? diffDays(projectStart, parseDate(task.startISO)) : 0
      if (startOffset < 0) startOffset = 0
    }
    const durasi = Math.max(1, Number(task.durasi) || 1)
    es.set(task.id, startOffset)
    const finish = startOffset + durasi
    ef.set(task.id, finish)
    return finish
  }

  scheduled.forEach((t) => forwardPass(t))

  // Backward pass
  const projectDuration = Math.max(...scheduled.map((t) => ef.get(t.id)), 0)

  function backwardPass(task) {
    if (lf.has(task.id)) return lf.get(task.id)
    const children = scheduled.filter((t) => t.parentId === task.id)
    let latestFinish
    if (children.length === 0) {
      latestFinish = projectDuration
    } else {
      latestFinish = Math.min(...children.map((c) => backwardPass(c)))
    }
    const durasi = Math.max(1, Number(task.durasi) || 1)
    lf.set(task.id, latestFinish)
    ls.set(task.id, latestFinish - durasi)
    return latestFinish
  }

  scheduled.forEach((t) => backwardPass(t))

  scheduled.forEach((t) => {
    const s = ls.get(t.id) - es.get(t.id)
    slack.set(t.id, s)
  })

  const enriched = scheduled.map((t) => ({
    ...t,
    es: es.get(t.id),
    ef: ef.get(t.id),
    ls: ls.get(t.id),
    lf: lf.get(t.id),
    slack: slack.get(t.id),
    isCritical: slack.get(t.id) === 0
  }))

  const criticalPath = enriched.filter((t) => t.isCritical).map((t) => t.namaKegiatan)

  return { tasks: enriched, hasCycle: false, projectDuration, criticalPath }
}
