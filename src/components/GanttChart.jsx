import { computeEffectiveDates } from '../utils/cpm'
import { formatDateID } from '../utils/projectUtils'

const PRIORITY_CLASS = {
  Rendah: 'gantt-bar-low',
  Sedang: 'gantt-bar-mid',
  Tinggi: 'gantt-bar-high'
}

function GanttChart({ tasks }) {
  if (tasks.length === 0) {
    return (
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Bagan Gantt</h2>
          <p className="section-description">
            Visualisasi jadwal tugas secara kronologis berdasarkan durasi dan dependensi.
          </p>
        </div>
        <div className="section-body">
          <div className="empty-state">
            Belum ada data tugas untuk ditampilkan pada Bagan Gantt.
          </div>
        </div>
      </section>
    )
  }

  const { tasks: scheduled, hasCycle } = computeEffectiveDates(tasks)

  if (hasCycle) {
    return (
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Bagan Gantt</h2>
        </div>
        <div className="section-body">
          <div className="empty-state">
            Terdapat siklus dependensi antar tugas (Parent Task saling terkait melingkar).
            Perbaiki relasi Parent Task terlebih dahulu.
          </div>
        </div>
      </section>
    )
  }

  // Susun urutan tugas: tugas tanpa parent dulu, lalu anaknya (DFS)
  const childrenOf = (id) => scheduled.filter((t) => t.parentId === id)
  const ordered = []
  const visited = new Set()
  const pushTree = (task, depth) => {
    if (visited.has(task.id)) return
    visited.add(task.id)
    ordered.push({ ...task, depth })
    childrenOf(task.id).forEach((c) => pushTree(c, depth + 1))
  }
  scheduled.filter((t) => t.parentId == null).forEach((t) => pushTree(t, 0))
  scheduled.forEach((t) => pushTree(t, 0)) // pastikan tugas yatim (parent terhapus) tetap tampil

  const allStarts = ordered.map((t) => new Date(t.startISO + 'T00:00:00'))
  const allEnds = ordered.map((t) => new Date(t.endISO + 'T00:00:00'))
  const chartStart = new Date(Math.min(...allStarts))
  const chartEnd = new Date(Math.max(...allEnds))
  const totalDays = Math.max(
    1,
    Math.round((chartEnd - chartStart) / (1000 * 60 * 60 * 24)) + 1
  )

  const dayWidth = 36 // px per hari
  const timelineWidth = totalDays * dayWidth

  // header tanggal (maksimal 40 label agar tidak terlalu padat)
  const labelStep = Math.max(1, Math.ceil(totalDays / 40))
  const headers = []
  for (let i = 0; i < totalDays; i += labelStep) {
    const d = new Date(chartStart)
    d.setDate(d.getDate() + i)
    headers.push({
      offset: i,
      label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
    })
  }

  return (
    <section className="section-card">
      <div className="section-header">
        <h2 className="section-title">Bagan Gantt</h2>
        <p className="section-description">
          Visualisasi jadwal tugas. Tanggal otomatis menyesuaikan jika tugas memiliki Parent Task
          (tugas pendahulu harus selesai lebih dulu). Batang berwarna menunjukkan tingkat prioritas.
        </p>
      </div>
      <div className="section-body">
        <div className="gantt-legend">
          <span className="legend-item"><span className="legend-dot gantt-bar-high" /> Tinggi</span>
          <span className="legend-item"><span className="legend-dot gantt-bar-mid" /> Sedang</span>
          <span className="legend-item"><span className="legend-dot gantt-bar-low" /> Rendah</span>
        </div>

        <div className="gantt-scroll">
          <div className="gantt-inner" style={{ minWidth: `${timelineWidth + 220}px` }}>
            <div className="gantt-header">
              <div className="gantt-label-cell">Nama Tugas</div>
              <div className="gantt-timeline" style={{ width: `${timelineWidth}px` }}>
                {headers.map((h) => (
                  <div
                    key={h.offset}
                    className="gantt-header-tick"
                    style={{ left: `${h.offset * dayWidth}px`, width: `${labelStep * dayWidth}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
            </div>

            {ordered.map((task) => {
              const startOffset = Math.round(
                (new Date(task.startISO + 'T00:00:00') - chartStart) / (1000 * 60 * 60 * 24)
              )
              const durasi = Math.max(1, Number(task.durasi) || 1)
              const barClass = PRIORITY_CLASS[task.prioritas] || 'gantt-bar-mid'
              return (
                <div key={task.id} className="gantt-row">
                  <div className="gantt-label-cell" style={{ paddingLeft: `${12 + task.depth * 16}px` }}>
                    {task.depth > 0 && <span className="gantt-indent">└ </span>}
                    {task.namaKegiatan}
                  </div>
                  <div className="gantt-timeline" style={{ width: `${timelineWidth}px` }}>
                    <div
                      className={`gantt-bar ${barClass}`}
                      style={{
                        left: `${startOffset * dayWidth + 2}px`,
                        width: `${durasi * dayWidth - 4}px`
                      }}
                      title={`${task.namaKegiatan}\n${formatDateID(task.startISO)} - ${formatDateID(task.endISO)} (${durasi} hari)`}
                    >
                      <span className="gantt-bar-label">{durasi}h</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="hint-text" style={{ marginTop: '1rem' }}>
          Total durasi proyek: <strong>{totalDays} hari</strong> (
          {formatDateID(chartStart.toISOString().slice(0, 10))} s.d.{' '}
          {formatDateID(chartEnd.toISOString().slice(0, 10))})
        </p>
      </div>
    </section>
  )
}

export default GanttChart
