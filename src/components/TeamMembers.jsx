import { useState } from 'react'

function TeamMembers() {
  const [members, setMembers] = useState([])
  const [formData, setFormData] = useState({
    nama: '',
    noHp: '',
    email: '',
    posisi: 'Programmer',
    gaji: ''
  })
  const [editId, setEditId] = useState(null)

  const posisiOptions = ['PM', 'Analis', 'Programmer', 'Tester']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.nama || !formData.noHp || !formData.email || !formData.gaji) {
      alert('Semua field harus diisi!')
      return
    }

    const isEditMode = editId !== null && members.some(member => member.id === editId)

    if (isEditMode) {
      setMembers(members.map(member => 
        member.id === editId ? { ...formData, id: editId, gaji: Number(formData.gaji) } : member
      ))
      setEditId(null)
    } else {
      const newMember = {
        ...formData,
        id: Date.now(),
        gaji: Number(formData.gaji)
      }
      setMembers(prevMembers => [...prevMembers, newMember])
      setEditId(null)
    }

    setFormData({
      nama: '',
      noHp: '',
      email: '',
      posisi: 'Programmer',
      gaji: ''
    })
  }

  const handleEdit = (member) => {
    setFormData({
      nama: member.nama,
      noHp: member.noHp,
      email: member.email,
      posisi: member.posisi,
      gaji: member.gaji.toString()
    })
    setEditId(member.id)
  }

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data anggota ini?')) {
      setMembers(members.filter(member => member.id !== id))
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setFormData({
      nama: '',
      noHp: '',
      email: '',
      posisi: 'Programmer',
      gaji: ''
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div>
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            {editId !== null ? 'Edit Data Anggota Tim' : 'Tambah Anggota Tim Baru'}
          </h2>
          <p className="section-description">
            {editId !== null ? 'Perbarui informasi anggota tim' : 'Masukkan data anggota tim yang akan ditambahkan'}
          </p>
        </div>
        <div className="section-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="nama">Nama Lengkap</label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  className="form-input"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="noHp">No. HP</label>
                <input
                  type="text"
                  id="noHp"
                  name="noHp"
                  className="form-input"
                  value={formData.noHp}
                  onChange={handleInputChange}
                  placeholder="Contoh: 081234567890"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nama@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="posisi">Posisi</label>
                <select
                  id="posisi"
                  name="posisi"
                  className="form-select"
                  value={formData.posisi}
                  onChange={handleInputChange}
                >
                  {posisiOptions.map(posisi => (
                    <option key={posisi} value={posisi}>{posisi}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="gaji">Gaji (Rp)</label>
                <input
                  type="number"
                  id="gaji"
                  name="gaji"
                  className="form-input"
                  value={formData.gaji}
                  onChange={handleInputChange}
                  placeholder="Masukkan jumlah gaji"
                  min="0"
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
          <h2 className="section-title">Daftar Anggota Tim</h2>
          <p className="section-description">Tabel data anggota tim yang terdaftar</p>
        </div>
        <div className="section-body">
          {members.length === 0 ? (
            <div className="empty-state">
              Belum ada data anggota tim. Silakan tambahkan data terlebih dahulu.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>No. HP</th>
                    <th>Email</th>
                    <th>Posisi</th>
                    <th>Gaji</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id}>
                      <td>{index + 1}</td>
                      <td>{member.nama}</td>
                      <td>{member.noHp}</td>
                      <td>{member.email}</td>
                      <td>{member.posisi}</td>
                      <td>{formatCurrency(member.gaji)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                            onClick={() => handleEdit(member)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                            onClick={() => handleDelete(member.id)}
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

export default TeamMembers
