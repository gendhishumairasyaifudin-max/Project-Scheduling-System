import { useState } from 'react'
import './App.css'
import TeamMembers from './components/TeamMembers'
import TaskScheduling from './components/TaskScheduling'

function App() {
  const [activeTab, setActiveTab] = useState('anggota')

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Sistem Informasi Penjadwalan Proyek</h1>
          <p className="app-subtitle">Manajemen Anggota Tim dan Penjadwalan Tugas</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'anggota' ? 'active' : ''}`}
          onClick={() => setActiveTab('anggota')}
        >
          Data Anggota Tim
        </button>
        <button
          className={`nav-tab ${activeTab === 'tugas' ? 'active' : ''}`}
          onClick={() => setActiveTab('tugas')}
        >
          Penjadwalan Tugas
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'anggota' && <TeamMembers />}
        {activeTab === 'tugas' && <TaskScheduling />}
      </main>
    </div>
  )
}

export default App
