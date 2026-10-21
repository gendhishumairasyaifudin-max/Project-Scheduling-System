import { useState } from 'react'
import { computeEndDateISO, formatDateID, nextId } from '../utils/projectUtils'

const EMPTY_FORM = {
  namaKegiatan: '',
  tanggalMulai: '',
  durasi: '',
  prioritas: 'Sedang',
  parentId: '',
  resources: []
}

const PRIORITAS_OPTIONS = ['Rendah', 'Sedang', 'Tinggi']

function TaskScheduling({ tasks, setTasks, members }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggleResource = (nama) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.includes(nama)
        ? prev.resources.filter((r) => r !== nama)
        : [...prev.resources, nama]
    }))
  }

  const parentOptions = tasks.filter((t) => t.id !== editId)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.namaKegiatan || !formData.tanggalMulai || !formData.durasi) {
      alert('Nama Kegiatan, Tanggal Mulai, dan Durasi harus diisi!')
      return
    }

    const durasi = Number(formData.durasi)
    if (Number.isNaN(durasi) || durasi < 1) {
      alert('Durasi harus berupa angka minimal 1 hari!')
      return
    }

    if (formData.parentId && formData.parentId === editId) {
      alert('Sebuah tugas tidak boleh menjadi pendahulu dirinya sendiri!')
      return
    }

    const payload = {
      namaKegiatan: formData.namaKegiatan.trim(),
      tanggalMulai: formData.tanggalMulai,
      durasi,
      prioritas: formData.prioritas,
      parentId: formData.parentId || null,
      resources: formData.resources
    }

    const isEditMode = editId !== null && tasks.some((t) => t.id === editId)

    if (isEditMode) {
      setTasks((prev) => prev.map((t) => (t.id === editId ? { ...t, ...payload } : t)))
      setEditId(null)
    } else {
      setTasks((prev) => [...prev, { id: nextId(), ...payload }])
    }

    setFormData(EMPTY_FORM)
  }

  const handleEdit = (task) => {
    setFormData({
      namaKegiatan: task.namaKegiatan,
      tanggalMulai: task.tanggalMulai || '',
      durasi: String(task.durasi),
      prioritas: task.prioritas,
      parentId: task.parentId || '',
      resources: Array.isArray(task.resources) ? [...task.resources] : []
    })
    setEditId(task.id)
  }

  const handleDelete = (id) => {
    // cek apakah tugas ini masih menjadi parent tugas lain
    const dependents = tasks.filter((t) => t.parentId === id)
    const warning =
      dependents.length > 0
        ? `Tugas ini menjadi pendahulu bagi ${dependents.length} tugas lain (Parent Task tugas tersebut akan dikosongkan). Hapus?`
        : 'Apakah Anda yakin ingin menghapus data tugas ini?'

    if (window.confirm(warning)) {
      setTasks((prev) =>
        prev
          .filter((t) => t.id !== id)
          .map((t) => (t.parentId === id ? { ...t, parentId: null } : t))
      )
      if (editId === id) {
        setEditId(null)
        setFormData(EMPTY_FORM)
      }
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setFormData(EMPTY_FORM)
  }

  const getParentName = (parentId) => {
    if (!parentId) return null
    const parent = tasks.find((t) => t.id === parentId)
    return parent ? parent.namaKegiatan : null
  }

  return (
    <div>
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            {editId !== null ? 'Edit Data Penjadwalan Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <p className="section-description">
            {editId !== null
              ? 'Perbarui informasi penjadwalan tugas'
              : 'Masukkan data tugas yang akan dijadwalkan'}
          </p>
        </div>
        <div className="section-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="namaKegiatan">Nama Tugas</label>
                <input
                  type="text"
                  id="namaKegiatan"
                  name="namaKegiatan"
                  className="form-input"
                  value={formData.namaKegiatan}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama kegiatan"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="tanggalMulai">Tanggal Mulai</label>
                <input
                  type="date"
                  id="tanggalMulai"
                  name="tanggalMulai"
                  className="form-input"
                  value={formData.tanggalMulai}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="durasi">Durasi (hari)</label>
                <input
                  type="number"
                  id="durasi"
                  name="durasi"
                  className="form-input"
                  value={formData.durasi}
                  onChange={handleInputChange}
                  placeholder="Contoh: 3"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prioritas">Prioritas</label>
                <select
                  id="prioritas"
                  name="prioritas"
                  className="form-select"
                  value={formData.prioritas}
                  onChange={handleInputChange}
                >
                  {PRIORITAS_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="parentId">Parent Task</label>
                <select
                  id="parentId"
                  name="parentId"
                  className="form-select"
                  value={formData.parentId}
                  onChange={handleInputChange}
                >
                  <option value="">Tidak ada (tugas awal)</option>
                  {parentOptions.map((t) => (
                    <option key={t.id} value={t.id}>{t.namaKegiatan}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <span className="form-label">Alokasi Resource (Anggota Tim)</span>
              {members.length === 0 ? (
                <p className="hint-text">
                  Belum ada anggota tim. Tambahkan data anggota tim terlebih dahulu untuk mengalokasikan resource.
                </p>
              ) : (
                <div className="checkbox-group">
                  {members.map((m) => (
                    <label key={m.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.resources.includes(m.nama)}
                        onChange={() => handleToggleResource(m.nama)}
                      />
                      <span>{m.nama}</span>
                      <span className="muted-text">({m.posisi})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editId !== null ? 'Simpan Perubahan' : 'Tambah Data'}
              </button>
              {editId !== null && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Daftar Penjadwalan Tugas</h2>
          <p className="section-description">Tabel data penjadwalan tugas proyek</p>
        </div>
        <div className="section-body">
          {tasks.length === 0 ? (
            <div className="empty-state">
              Belum ada data penjadwalan tugas. Silakan tambahkan data terlebih dahulu.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Tugas</th>
                    <th>Tanggal Mulai</th>
                    <th>Tanggal Selesai</th>
                    <th>Durasi (hari)</th>
                    <th>Prioritas</th>
                    <th>Parent Task</th>
                    <th>Alokasi Resource</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => {
                    const parentName = getParentName(task.parentId)
                    return (
                      <tr key={task.id}>
                        <td>{index + 1}</td>
                        <td className="cell-strong">{task.namaKegiatan}</td>
                        <td>{formatDateID(task.tanggalMulai)}</td>
                        <td>{formatDateID(computeEndDateISO(task.tanggalMulai, task.durasi))}</td>
                        <td>{task.durasi}</td>
                        <td>
                          <span className={`badge badge-${task.prioritas.toLowerCase()}`}>
                            {task.prioritas}
                          </span>
                        </td>
                        <td>{parentName || <span className="muted-text">Tidak ada</span>}</td>
                        <td>
                          {Array.isArray(task.resources) && task.resources.length > 0 ? (
                            <div className="chip-list">
                              {task.resources.map((r) => (
                                <span key={r} className="chip">{r}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="muted-text">-</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(task.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default TaskScheduling
