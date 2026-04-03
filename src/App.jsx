import { useState, useEffect } from 'react'
import { useAuth }         from './context/AuthContext'
import { useLocation }     from './hooks/useLocation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useAnimals }      from './hooks/useAnimals'
import { useMilk }         from './hooks/useMilk'

import AuthPage      from './components/AuthPage'
import StatusBar     from './components/StatusBar'
import Header        from './components/Header'
import NavBar        from './components/NavBar'
import AlertBanner   from './components/AlertBanner'
import AddAnimalModal from './components/AddAnimalModal'

import CameraPage   from './components/CameraPage'
import FeedPage     from './components/FeedPage'
import DiaryPage    from './components/DiaryPage'
import ProgressPage from './components/ProgressPage'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [page, setPage]           = useState('camera')
  const [showAddAnimal, setShowAddAnimal] = useState(false)
  const loc    = useLocation()
  const online = useOnlineStatus()
  const { animals, loading: animalsLoading, addAnimal, reload } = useAnimals(!!user)
  const { records, pending, loadForAnimal, saveRecord, syncPending } = useMilk()

  useEffect(() => { if (online && pending > 0) syncPending() }, [online, pending])

  const dropAlert = animals.filter(a => a.type === 'cow').find(cow => {
    const recs = records[cow._id] || []
    if (recs.length < 2) return false
    const l = recs[recs.length - 1], p = recs[recs.length - 2]
    return (l.am + l.pm) < (p.am + p.pm) * 0.72
  })

  // Auth loading
  if (authLoading) return <Spinner text="Loading…" />

  // Not logged in → show auth page
  if (!user) return <AuthPage />

  // Animals loading
  if (animalsLoading) return <Spinner text="Loading your herd…" />

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100svh', maxWidth:'430px', margin:'0 auto', background:'var(--bg)', overflow:'hidden' }}>
      <StatusBar loc={loc} online={online} pending={pending} />
      <Header
        user={user}
        animalCount={animals.length}
        onLogout={logout}
        onAddAnimal={() => setShowAddAnimal(true)}
      />
      {dropAlert && <AlertBanner animal={dropAlert} />}

      <div className="scroll-y" style={{ flex:1, display:'flex', flexDirection:'column' }}>
        {page === 'camera'   && <CameraPage animals={animals} loc={loc} />}
        {page === 'feed'     && <FeedPage />}
        {page === 'diary'    && <DiaryPage animals={animals} records={records} loadForAnimal={loadForAnimal} saveRecord={saveRecord} online={online} />}
        {page === 'progress' && <ProgressPage animals={animals} records={records} loadForAnimal={loadForAnimal} />}
      </div>

      <NavBar active={page} setPage={setPage} />

      {showAddAnimal && (
        <AddAnimalModal
          onSave={async (data) => { await addAnimal(data); reload() }}
          onClose={() => setShowAddAnimal(false)}
        />
      )}
    </div>
  )
}

function Spinner({ text }) {
  return (
    <div style={{ height:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:'16px' }}>
      <span style={{ fontSize:'48px' }}>🐄</span>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'24px', color:'var(--green)' }}>FarmWise</div>
      <div style={{ width:'36px', height:'36px', border:'4px solid var(--green-pale)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'13px', color:'var(--text-muted)' }}>{text}</div>
    </div>
  )
}
