// Helper utilitas proyek: tanggal, format, dan export/import JSON

export function parseDate(iso) {
  if (!iso || typeof iso !== 'string') return null
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null
  const [y, m, d] = parts
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO() {
  return toISODate(new Date())
}

// selisih hari dari dateA ke dateB (dateB - dateA)
export function diffDays(dateA, dateB) {
  if (!dateA || !dateB) return 0
  const ms = dateB.getTime() - dateA.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function formatDateID(iso) {
  const date = parseDate(iso)
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function computeEndDateISO(tanggalMulai, durasi) {
  const start = parseDate(tanggalMulai)
  if (!start) return null
  const end = new Date(start)
  end.setDate(end.getDate() + (Math.max(1, Number(durasi) || 1) - 1))
  return toISODate(end)
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(Number(amount) || 0)
}

export function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// ---------- Export / Import JSON ----------

export function buildExportPayload(members, tasks) {
  return {
    aplikasi: 'Sistem Informasi Penjadwalan Proyek',
    versi: 1,
    tanggalExport: new Date().toISOString(),
    anggotaTim: members,
    tugas: tasks
  }
}

export function downloadJSON(payload, filename) {
  const text = JSON.stringify(payload, null, 2)
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Validasi & normalisasi data hasil import agar aman digunakan state
export function sanitizeImportedData(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Format file tidak valid.')
  }

  const rawMembers = Array.isArray(raw.anggotaTim) ? raw.anggotaTim : []
  const rawTasks = Array.isArray(raw.tugas) ? raw.tugas : []
  const posisiValid = ['PM', 'Analis', 'Programmer', 'Tester']
  const prioritasValid = ['Rendah', 'Sedang', 'Tinggi']

  const members = rawMembers.map((m) => ({
    id: nextId(),
    nama: String(m?.nama ?? ''),
    noHp: String(m?.noHp ?? ''),
    email: String(m?.email ?? ''),
    posisi: posisiValid.includes(m?.posisi) ? m.posisi : 'Programmer',
    gaji: Number(m?.gaji) || 0
  }))

  // task memakai id sementara agar referensi parentId tetap konsisten
  const idMap = new Map()
  rawTasks.forEach((t, i) => {
    idMap.set(t?.id, `imported-${i}`)
  })

  const tasks = rawTasks.map((t, i) => ({
    id: idMap.get(t?.id) || `imported-${i}`,
    namaKegiatan: String(t?.namaKegiatan ?? ''),
    tanggalMulai: /^\d{4}-\d{2}-\d{2}$/.test(t?.tanggalMulai || '') ? t.tanggalMulai : '',
    durasi: Math.max(1, Number(t?.durasi) || 1),
    prioritas: prioritasValid.includes(t?.prioritas) ? t.prioritas : 'Sedang',
    parentId: t?.parentId != null && idMap.has(t.parentId) ? idMap.get(t.parentId) : null,
    resources: Array.isArray(t?.resources)
      ? t.resources.map((r) => String(r)).filter(Boolean)
      : []
  }))

  return { members, tasks }
}
