import { useState } from 'react'

function TaskScheduling() {
  const [tasks, setTasks] = useState([])
  const [formData, setFormData] = useState({
    namaKegiatan: '',
    durasi: '',
    tugasPendahulu: ''
  })
  const [editId, setEditId] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.namaKegiatan || !formData.durasi) {
      alert('Nama Kegiatan dan Durasi harus diisi!')
      return
    }

    const isEditMode = editId !== null && tasks.some(task => task.id === editId)

    if (isEditMode) {
      setTasks(tasks.map(task => 
        task.id === editId ? { ...formData, id: editId, durasi: Number(formData.durasi), tugasPendahulu: formData.tugasPendahulu || 'Tidak ada' } : task
      ))
      setEditId(null)
    } else {
      const newTask = {
        ...formData,
        id: Date.now(),
        durasi: Number(formData.durasi),
        tugasPendahulu: formData.tugasPendahulu || 'Tidak ada'
      }
      setTasks(prevTasks => [...prevTasks, newTask])
      setEditId(null)
    }

    setFormData({
      namaKegiatan: '',
      durasi: '',
      tugasPendahulu: ''
    })
  }

  const handleEdit = (task) => {
    setFormData({
      namaKegiatan: task.namaKegiatan,
      durasi: task.durasi.toString(),
      tugasPendahulu: task.tugasPendahulu === 'Tidak ada' ? '' : task.tugasPendahulu
    })
    setEditId(task.id)
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data tugas ini?')) {
      setTasks(tasks.filter(task => task.id !== id))
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setFormData({
      namaKegiatan: '',
      durasi: '',
      tugasPendahulu: ''
    })
  }

  return (
    <div>
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            {editId !== null ? 'Edit Data Penjadwalan Tugas' : 'Tambah Tugas Baru'}
          </h2>
          <p className="section-description">
            {editId !== null ? 'Perbarui informasi penjadwalan tugas' : 'Masukkan data tugas yang akan dijadwalkan'}
          </p>
        </div>
        <div className="section-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="namaKegiatan">Nama Kegiatan</label>
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
                <label className="form-label" htmlFor="tugasPendahulu">Tugas Pendahulu</label>
                <input
                  type="text"
                  id="tugasPendahulu"
                  name="tugasPendahulu"
                  className="form-input"
                  value={formData.tugasPendahulu}
                  onChange={handleInputChange}
                  placeholder="Nama tugas pendahulu (kosongkan jika tidak ada)"
                />
              </div>
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
                    <th>Nama Kegiatan</th>
                    <th>Durasi (hari)</th>
                    <th>Tugas Pendahulu</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id}>
                      <td>{index + 1}</td>
                      <td>{task.namaKegiatan}</td>
                      <td>{task.durasi}</td>
                      <td>{task.tugasPendahulu || 'Tidak ada'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                            onClick={() => handleEdit(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                            onClick={() => handleDelete(task.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
