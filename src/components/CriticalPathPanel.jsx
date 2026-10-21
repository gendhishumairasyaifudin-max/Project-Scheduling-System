import { computeCriticalPath } from '../utils/cpm'

function CriticalPathPanel({ tasks }) {
  if (tasks.length === 0) {
    return (
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Analisis Jalur Kritis</h2>
          <p className="section-description">
            Analisis Critical Path Method (CPM): ES, EF, LS, LF, dan Slack setiap tugas.
          </p>
        </div>
        <div className="section-body">
          <div className="empty-state">
            Belum ada data tugas untuk dianalisis. Tambahkan tugas terlebih dahulu.
          </div>
        </div>
      </section>
    )
  }

  const { tasks: analyzed, hasCycle, projectDuration, criticalPath } = computeCriticalPath(tasks)

  if (hasCycle) {
    return (
      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Analisis Jalur Kritis</h2>
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

  const criticalCount = analyzed.filter((t) => t.isCritical).length

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Durasi Proyek</div>
          <div className="summary-value">{projectDuration} hari</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Tugas</div>
          <div className="summary-value">{analyzed.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Tugas Kritis</div>
          <div className="summary-value">{criticalCount}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Tidak Kritis</div>
          <div className="summary-value">{analyzed.length - criticalCount}</div>
        </div>
      </div>

      <section className="section-card">
        <div className="section-header">
          <h2 className="section-title">Analisis Jalur Kritis</h2>
          <p className="section-description">
            Slack = 0 menandakan tugas berada pada jalur kritis: keterlambatannya akan
            menunda seluruh proyek.
          </p>
        </div>
        <div className="section-body">
          <div className="path-summary">
            <span className="path-label">Jalur Kritis:</span>
            {criticalPath.length > 0 ? (
              <span className="path-value">{criticalPath.join(' → ')}</span>
            ) : (
              <span className="muted-text">Tidak ada jalur kritis</span>
            )}
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Tugas</th>
                  <th>Durasi</th>
                  <th title="Earliest Start - hari paling awal tugas dapat dimulai">ES</th>
                  <th title="Earliest Finish - hari paling awal tugas selesai">EF</th>
                  <th title="Latest Start - hari paling akhir tugas boleh dimulai">LS</th>
                  <th title="Latest Finish - hari paling akhir tugas selesai">LF</th>
                  <th>Slack</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyzed.map((t, index) => (
                  <tr key={t.id} className={t.isCritical ? 'row-critical' : ''}>
                    <td>{index + 1}</td>
                    <td className="cell-strong">{t.namaKegiatan}</td>
                    <td>{t.durasi} hari</td>
                    <td>{t.es}</td>
                    <td>{t.ef}</td>
                    <td>{t.ls}</td>
                    <td>{t.lf}</td>
                    <td>{t.slack}</td>
                    <td>
                      <span className={`badge ${t.isCritical ? 'badge-kritis' : 'badge-nonkritis'}`}>
                        {t.isCritical ? 'Kritis' : 'Non-Kritis'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="hint-text" style={{ marginTop: '1rem' }}>
            Nilai ES/EF/LS/LF dinyatakan dalam satuan hari relatif terhadap awal proyek (hari ke-0).
          </p>
        </div>
      </section>
    </div>
  )
}

export default CriticalPathPanel
