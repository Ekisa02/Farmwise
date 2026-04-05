import { useState, useEffect } from 'react'
import { useAuth }         from './context/AuthContext'
import { useLocation }     from './hooks/useLocation'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useAnimals }      from './hooks/useAnimals'
import { useMilk }         from './hooks/useMilk'
import { useIsMobile }     from './hooks/useIsMobile'

import AuthPage       from './components/AuthPage'
import StatusBar      from './components/StatusBar'
import Header         from './components/Header'
import NavBar         from './components/NavBar'
import AlertBanner    from './components/AlertBanner'
import AddAnimalModal from './components/AddAnimalModal'
import WebSidebar     from './components/WebSidebar'
import WebTopBar      from './components/WebTopBar'

import CameraPage   from './components/CameraPage'
import FeedPage     from './components/FeedPage'
import DiaryPage    from './components/DiaryPage'
import ProgressPage from './components/ProgressPage'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [page, setPage]             = useState('camera')
  const [showAddAnimal, setAdd]     = useState(false)
  const loc      = useLocation()
  const online   = useOnlineStatus()
  const isMobile = useIsMobile()
  const { animals, loading: animalsLoading, addAnimal, reload } = useAnimals(!!user)
  const { records, pending, loadForAnimal, saveRecord, syncPending } = useMilk()

  useEffect(() => { if (online && pending > 0) syncPending() }, [online, pending])

  const dropAlert = animals.filter(a => a.type === 'cow').find(cow => {
    const recs = records[cow._id] || []
    if (recs.length < 2) return false
    const l = recs[recs.length - 1], p = recs[recs.length - 2]
    return (l.am + l.pm) < (p.am + p.pm) * 0.72
  })

  if (authLoading)    return <Spinner text="Starting FarmWise…" />
  if (!user)          return <AuthPage />
  if (animalsLoading) return <Spinner text="Loading your herd…" />

  const pageContent = (
    <>
      {page === 'camera'   && <CameraPage   animals={animals} loc={loc} />}
      {page === 'feed'     && <FeedPage />}
      {page === 'diary'    && <DiaryPage    animals={animals} records={records} loadForAnimal={loadForAnimal} saveRecord={saveRecord} online={online} />}
      {page === 'progress' && <ProgressPage animals={animals} records={records} loadForAnimal={loadForAnimal} />}
    </>
  )

  const addAnimalProps = {
    onSave:  async (data) => { await addAnimal(data); reload() },
    onClose: () => setAdd(false),
  }

  // ── MOBILE layout ──────────────────────────────────────────
  if (isMobile) return (
    <div style={{ display:'flex', flexDirection:'column', height:'100svh', maxWidth:'430px', margin:'0 auto', background:'var(--bg)', overflow:'hidden' }}>
      <StatusBar loc={loc} online={online} pending={pending} />
      <Header user={user} animalCount={animals.length} onLogout={logout} onAddAnimal={() => setAdd(true)} />
      {dropAlert && <AlertBanner animal={dropAlert} />}
      <div className="scroll-y" style={{ flex:1, display:'flex', flexDirection:'column' }}>
        {pageContent}
      </div>
      <NavBar active={page} setPage={setPage} />
      {showAddAnimal && <AddAnimalModal {...addAnimalProps} />}
    </div>
  )

  // ── DESKTOP layout ─────────────────────────────────────────
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#F5F6F8' }}>
      <WebSidebar
        active={page} setPage={setPage}
        user={user} animalCount={animals.length}
        onLogout={logout} onAddAnimal={() => setAdd(true)}
        loc={loc} online={online} pending={pending}
      />

      {/* Main content area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <WebTopBar page={page} user={user} onAddAnimal={() => setAdd(true)} loc={loc} online={online} pending={pending} />

        {dropAlert && (
          <div style={{ margin:'12px 24px 0', padding:'10px 16px', background:'#FFF3ED', border:'2px solid var(--red-light)', borderRadius:'12px', display:'flex', gap:'10px', alignItems:'center' }}>
            <span>⚠️</span>
            <div>
              <div style={{ fontFamily:'Nunito, sans-serif', fontWeight:800, color:'var(--red)', fontSize:'13px' }}>Milk Drop Alert — {dropAlert.name}</div>
              <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'12px', color:'var(--brown)' }}>Significant drop detected. Check for fever or mastitis.</div>
            </div>
          </div>
        )}

        {/* Page content — wider on desktop */}
        <div className="scroll-y" style={{ flex:1, padding:'20px 24px' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'0' }}>
            {pageContent}
          </div>
        </div>
      </div>

      {showAddAnimal && <AddAnimalModal {...addAnimalProps} />}
    </div>
  )
}

function Spinner({ text }) {
  return (
    <div style={{ height:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', gap:'14px' }}>
      <span style={{ fontSize:'48px' }}>🐄</span>
      <div style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:'22px', color:'var(--green)' }}>FarmWise</div>
      <div style={{ width:'32px', height:'32px', border:'3px solid var(--green-pale)', borderTopColor:'var(--green)', borderRadius:'50%', animation:'spin 0.85s linear infinite' }} />
      <div style={{ fontFamily:'Nunito, sans-serif', fontSize:'13px', color:'var(--text-muted)' }}>{text}</div>
    </div>
  )
}
