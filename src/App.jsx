import { useState, useEffect } from 'react'
import { useLocation }     from './hooks/useLocation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useAnimals }      from './hooks/useAnimals'
import { useMilk }         from './hooks/useMilk'

import StatusBar  from './components/StatusBar'
import Header     from './components/Header'
import NavBar     from './components/NavBar'
import AlertBanner from './components/AlertBanner'

import CameraPage   from './components/CameraPage'
import FeedPage     from './components/FeedPage'
import DiaryPage    from './components/DiaryPage'
import ProgressPage from './components/ProgressPage'

export default function App() {
  const [page, setPage] = useState('camera')
  const loc    = useLocation()
  const online = useOnlineStatus()
  const { animals, loading, error, addAnimal, updateAnimal, removeAnimal } = useAnimals()
  const { records, pending, loadForAnimal, saveRecord, syncPending } = useMilk()

  // Auto-sync when coming back online
  useEffect(() => {
    if (online && pending > 0) syncPending()
  }, [online, pending])

  // Find any cow with a significant milk drop
  const dropAlert = animals.filter(a => a.type === 'cow').find(cow => {
    const recs = records[cow._id] || []
    if (recs.length < 2) return false
    const l = recs[recs.length - 1]
    const p = recs[recs.length - 2]
    return (l.am + l.pm) < (p.am + p.pm) * 0.72
  })

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100svh', maxWidth: '430px',
      margin: '0 auto', background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <StatusBar loc={loc} online={online} pending={pending} />
      <Header animalCount={animals.length} />
      {dropAlert && <AlertBanner animal={dropAlert} />}

      <div className="scroll-y" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'camera'   && (
          <CameraPage animals={animals} loc={loc} />
        )}
        {page === 'feed' && (
          <FeedPage />
        )}
        {page === 'diary' && (
          <DiaryPage
            animals={animals}
            records={records}
            loadForAnimal={loadForAnimal}
            saveRecord={saveRecord}
            online={online}
          />
        )}
        {page === 'progress' && (
          <ProgressPage animals={animals} records={records} loadForAnimal={loadForAnimal} />
        )}
      </div>

      <NavBar active={page} setPage={setPage} />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ height:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:'16px' }}>
      <span style={{ fontSize:'48px' }}>🐄</span>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'24px', color:'var(--green)' }}>FarmWise</div>
      <div style={{ width:'40px', height:'40px', border:'4px solid var(--green-pale)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'13px', color:'var(--text-muted)' }}>Loading your herd…</div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div style={{ height:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:'12px', padding:'24px' }}>
      <span style={{ fontSize:'40px' }}>⚠️</span>
      <div style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, color:'var(--red)', fontSize:'16px', textAlign:'center' }}>Could not connect to server</div>
      <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'13px', color:'var(--text-muted)', textAlign:'center' }}>{message}</div>
      <button onClick={() => window.location.reload()}
        style={{ marginTop:'8px', padding:'11px 28px', background:'var(--green)', color:'white', border:'none', borderRadius:'14px', fontFamily:'Nunito, sans-serif', fontWeight:800, fontSize:'14px' }}>
        Retry
      </button>
    </div>
  )
}
