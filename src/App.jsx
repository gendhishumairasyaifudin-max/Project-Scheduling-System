import { useRef, useState } from 'react'
import './App.css'
import TeamMembers from './components/TeamMembers'
import TaskScheduling from './components/TaskScheduling'
import GanttChart from './components/GanttChart'
import CriticalPathPanel from './components/CriticalPathPanel'
import {
  buildExportPayload,
  downloadJSON,
  sanitizeImportedData
} from './utils/projectUtils'

const TABS = [
  { key: 'anggota', label: 'Data Anggota Tim' },
  { key: 'tugas', label: 'Penjadwalan Tugas' },
  { key: 'gantt', label: 'Bagan Gantt' },
  { key: 'critical', label: 'Analisis Jalur Kritis' }
]

function App() {
  const [activeTab, setActiveTab] = useState('anggota')
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const fileInputRef = useRef(null)

  const handleExport = () => {
    if (members.length === 0 && tasks.length === 0) {
      alert('Belum ada data untuk di-export.')
      return
    }
    const payload = buildExportPayload(members, tasks)
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJSON(payload, `data-proyek-${stamp}.json`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset agar file sama bisa dipilih ulang
    if (!file) return
    try {
      const text = await file.text()
      const raw = JSON.parse(text)
      const { members: importedMembers, tasks: importedTasks } = sanitizeImportedData(raw)
      if (importedMembers.length === 0 && importedTasks.length === 0) {
        alert('File JSON tidak berisi data anggota tim maupun tugas.')
        return
      }
      setMembers(importedMembers)
      setTasks(importedTasks)
      alert(
        `Import berhasil: ${importedMembers.length} anggota tim dan ${importedTasks.length} tugas dimuat.`
      )
    } catch (err) {
      alert(`Gagal mengimpor file: ${err.message}`)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="app-title">Sistem Informasi Penjadwalan Proyek</h1>
            <p className="app-subtitle">Manajemen Anggota Tim dan Penjadwalan Tugas Proyek</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-header" onClick={handleExport}>
              Export JSON
            </button>
            <button className="btn btn-header" onClick={handleImportClick}>
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>
        </div>
      </header>

      <nav className="nav-tabs">
        <div className="nav-tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'anggota' && <TeamMembers members={members} setMembers={setMembers} />}
        {activeTab === 'tugas' && (
          <TaskScheduling tasks={tasks} setTasks={setTasks} members={members} />
        )}
        {activeTab === 'gantt' && <GanttChart tasks={tasks} />}
        {activeTab === 'critical' && <CriticalPathPanel tasks={tasks} />}
      </main>
    </div>
  )
}

export default App
