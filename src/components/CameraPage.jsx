import { useState, useRef, useEffect, useCallback } from 'react'
import { healthApi } from '../services/api'
import { saveScanLocal, getRecentScans } from '../services/db'

const SCAN_TYPES = [
  { id: 'eye',   label: 'Eye',   emoji: '👁️', hint: 'Discharge or cloudiness' },
  { id: 'skin',  label: 'Skin',  emoji: '🫧',  hint: 'Spots, wounds or mange' },
  { id: 'udder', label: 'Udder', emoji: '🍼',  hint: 'Mastitis or swelling' },
  { id: 'dung',  label: 'Dung',  emoji: '💩',  hint: 'Colour & consistency' },
  { id: 'nose',  label: 'Nose',  emoji: '👃',  hint: 'Discharge or dryness' },
  { id: 'hoof',  label: 'Hoof',  emoji: '🦶',  hint: 'Lameness or rot' },
  { id: 'body',  label: 'Body',  emoji: '🐄',  hint: 'Body condition score' },
]

const LOAD_MSGS = [
  '📡 Connecting to AI vet…',
  '🔬 Examining the photo…',
  '🧬 Checking for conditions…',
  '📋 Writing your report…',
]

// ── Image compression ────────────────────────────────────────
// Resizes + compresses image on a canvas before upload.
// Keeps memory low — max 1024px wide, 75% JPEG quality.
// Returns a Promise<Blob>
function compressImage(file, maxSize = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)   // free object URL immediately

      // Calculate target dimensions
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize)
          width  = maxSize
        } else {
          width  = Math.round((width / height) * maxSize)
          height = maxSize
        }
      }

      // Draw onto offscreen canvas
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Free the img element
      img.src = ''

      canvas.toBlob(
        blob => {
          // Wipe canvas to free GPU memory
          canvas.width = 0
          canvas.height = 0
          if (blob) resolve(blob)
          else reject(new Error('Canvas compression failed'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }

    img.src = url
  })
}

// ── Small preview (separate lower-quality for display only) ──
function makePreviewURL(blob) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxPrev = 400
      let w = img.width, h = img.height
      if (w > maxPrev) { h = Math.round(h * maxPrev / w); w = maxPrev }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      img.src = ''
      canvas.toBlob(b => {
        canvas.width = 0; canvas.height = 0
        resolve(b ? URL.createObjectURL(b) : url)
      }, 'image/jpeg', 0.6)
    }
    img.onerror = () => resolve(url)
    img.src = url
  })
}

// ── Main component ────────────────────────────────────────────
export default function CameraPage({ animals, loc }) {
  const [step,       setStep]     = useState('home')
  const [animal,     setAnimal]   = useState(null)
  const [scanType,   setScanType] = useState(null)
  const [imgPreview, setPreview]  = useState(null)   // low-res preview URL
  const [result,     setResult]   = useState(null)
  const [scanLog,    setScanLog]  = useState([])
  const [filterType, setFilter]   = useState('all')
  const [loadMsgIdx, setLoadIdx]  = useState(0)
  const [imgSource,  setImgSrc]   = useState(null)   // 'camera' | 'gallery' | null

  // Two separate file inputs: one with capture, one without
  const cameraRef  = useRef()
  const galleryRef = useRef()
  const prevURLRef = useRef(null)   // track preview object URLs for cleanup

  useEffect(() => {
    getRecentScans(8).then(setScanLog)
    // Cleanup on unmount
    return () => {
      if (prevURLRef.current) URL.revokeObjectURL(prevURLRef.current)
    }
  }, [])

  const filtered = animals.filter(a => filterType === 'all' || a.type === filterType)

  // ── Core image handler ──────────────────────────────────
  const handleFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    // Reset input so same file can be re-selected
    e.target.value = ''
    if (!file) return

    setStep('scanning')
    setResult(null)
    setLoadIdx(0)

    const iv = setInterval(() => setLoadIdx(i => (i + 1) % LOAD_MSGS.length), 2200)

    try {
      // ── Step 1: compress (frees original from memory) ──
      const compressed = await compressImage(file, 1024, 0.75)

      // ── Step 2: make a tiny preview (separate canvas pass) ──
      if (prevURLRef.current) URL.revokeObjectURL(prevURLRef.current)
      const prevURL = await makePreviewURL(compressed)
      prevURLRef.current = prevURL
      setPreview(prevURL)

      // ── Step 3: upload compressed blob ────────────────
      const uploadFile = new File([compressed], 'scan.jpg', { type: 'image/jpeg' })
      const data = await healthApi.scan(uploadFile, animal._id, scanType, loc.label)

      clearInterval(iv)
      setResult(data)

      // Persist scan log (no full image stored — just thumbnail URL)
      const logEntry = {
        animalId:   animal._id,
        animalName: animal.name,
        type:       SCAN_TYPES.find(s => s.id === scanType)?.label || scanType,
        status:     data.status,
        condition:  data.condition,
        date:       new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
        imgPreview: null,   // don't store image in IndexedDB — saves memory
      }
      await saveScanLocal(logEntry)
      setScanLog(prev => [logEntry, ...prev.slice(0, 8)])
      setStep('result')
    } catch (err) {
      clearInterval(iv)
      setResult({
        status: 'warning', condition: 'Analysis incomplete',
        finding: 'Could not analyse the photo. Check your connection and try again. If symptoms are visible, contact a vet.',
        severity: 3,
        recommendations: [
          'Retake the photo in bright outdoor light',
          'Hold camera 30–50 cm from the affected area',
          'Consult a local vet if symptoms persist',
        ],
        food:       { remove: ['Excess wet grass'], add: ['Fresh clean water', 'Quality dry hay'] },
        urgency:    'monitor',
        prevention: 'Regular fortnightly health checks catch problems early.',
      })
      setStep('result')
    }
  }, [animal, scanType, loc])

  const goHome  = () => { setStep('home');   setResult(null); setPreview(null) }
  const goScan  = () => { setStep('select'); setResult(null); setPreview(null) }

  // ── Trigger camera or gallery ───────────────────────────
  const openCamera  = (type) => { setScanType(type); setTimeout(() => cameraRef.current?.click(),  60) }
  const openGallery = (type) => { setScanType(type); setTimeout(() => galleryRef.current?.click(), 60) }

  // ── SCANNING SCREEN ─────────────────────────────────────
  if (step === 'scanning') return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      {imgPreview && (
        <img src={imgPreview} alt="scan" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '18px', marginBottom: '20px' }} />
      )}
      <div style={{ width: '56px', height: '56px', border: '4px solid var(--green-pale)', borderTopColor: 'var(--green)', borderRadius: '50%', marginBottom: '16px', animation: 'spin 0.9s linear infinite' }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '19px', color: 'var(--green)', marginBottom: '6px', textAlign: 'center' }}>
        Analysing Photo
      </div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '22px', textAlign: 'center', minHeight: '18px' }}>
        {LOAD_MSGS[loadMsgIdx]}
      </div>
      <div style={{ width: '100%', background: 'var(--green-pale)', borderRadius: '999px', height: '7px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--green)', borderRadius: '999px', animation: 'loadbar 14s ease-out forwards' }} />
      </div>
      <div style={{ marginTop: '10px', fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>
        Usually ready in 10–20 seconds
      </div>
    </div>
  )

  // ── RESULT SCREEN ────────────────────────────────────────
  if (step === 'result' && result) {
    const sc    = result.status === 'healthy' ? 'var(--green-light)' : result.status === 'critical' ? 'var(--red)' : 'var(--gold)'
    const sb    = result.status === 'healthy' ? '#E8F5E9'            : result.status === 'critical' ? '#FFEBEE'    : '#FFF8E1'
    const badge = { healthy: '✅ Healthy', warning: '⚠️ Warning', critical: '🚨 Critical' }[result.status]

    return (
      <div className="scroll-y fade-in" style={{ flex: 1, padding: '14px 16px' }}>
        <BackBtn onClick={goHome} />
        {imgPreview && (
          <img src={imgPreview} alt="" style={{ width: '100%', height: '170px', objectFit: 'cover', borderRadius: '16px', marginBottom: '12px' }} />
        )}

        <Card style={{ background: sb, border: `2px solid ${sc}`, marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '17px', color: sc }}>{badge}</span>
            <Chip color={sc} bg={`${sc}22`}>Severity {result.severity}/10</Chip>
          </div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: 'var(--brown)', marginBottom: '4px' }}>{result.condition}</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text)', lineHeight: 1.55 }}>{result.finding}</div>
        </Card>

        <Card style={{ marginBottom: '10px' }}>
          <SectionLabel>💊 What To Do</SectionLabel>
          {(result.recommendations || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '7px' }}>
              <CheckCircle />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text)', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom: '10px' }}>
          <SectionLabel>🌿 Feeding Adjustment</SectionLabel>
          {(result.food?.remove || []).length > 0 && <>
            <MiniLabel color="var(--red)">🚫 REDUCE</MiniLabel>
            {result.food.remove.map((f, i) => <BulletItem key={i}>{f}</BulletItem>)}
          </>}
          {(result.food?.add || []).length > 0 && <>
            <MiniLabel color="var(--green-light)" style={{ marginTop: '7px' }}>✅ ADD</MiniLabel>
            {result.food.add.map((f, i) => <BulletItem key={i}>{f}</BulletItem>)}
          </>}
        </Card>

        <div style={{ background: 'rgba(212,160,23,0.1)', border: '2px solid var(--gold)', borderRadius: '16px', padding: '11px 13px', marginBottom: '10px' }}>
          <MiniLabel color="var(--gold)">💡 PREVENTION TIP</MiniLabel>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--brown)' }}>{result.prevention}</div>
        </div>

        {result.urgency === 'vet_now' && (
          <div style={{ background: 'var(--red)', borderRadius: '14px', padding: '13px', textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'white', fontSize: '14px' }}>🚨 Call a Vet Immediately!</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginTop: '3px' }}>This needs urgent professional treatment.</div>
          </div>
        )}

        <GreenBtn onClick={goScan}>📸 Scan Another Body Part</GreenBtn>
      </div>
    )
  }

  // ── SCAN TYPE SCREEN ─────────────────────────────────────
  // After selecting a scan type, show camera/gallery choice sheet
  if (step === 'scantype') return (
    <div className="scroll-y fade-in" style={{ flex: 1, padding: '14px 16px' }}>
      <BackBtn onClick={() => setStep('select')} />
      <PageTitle>What to Scan?</PageTitle>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Animal: <b>{animal?.emoji} {animal?.name}</b> ({animal?.breed})
      </div>

      {/* Source picker — shown when a scan type was tapped */}
      {imgSource && (
        <SourcePicker
          scanType={imgSource}
          onCamera={() => { openCamera(imgSource);  setImgSrc(null) }}
          onGallery={() => { openGallery(imgSource); setImgSrc(null) }}
          onClose={() => setImgSrc(null)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
        {SCAN_TYPES.map(s => (
          <button
            key={s.id}
            onClick={() => setImgSrc(s.id)}
            style={scanTypeBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.border = '2px solid var(--green)'; e.currentTarget.style.background = 'var(--green-pale)' }}
            onMouseLeave={e => { e.currentTarget.style.border = '2px solid #E5E5E5';      e.currentTarget.style.background = 'var(--card-bg)' }}
          >
            <span style={{ fontSize: '28px' }}>{s.emoji}</span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px', color: 'var(--text)' }}>{s.label}</span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>{s.hint}</span>
          </button>
        ))}
      </div>

      {/* Hidden inputs — camera (capture) and gallery (no capture) */}
      <input ref={cameraRef}  type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
      <input ref={galleryRef} type="file" accept="image/*"                        onChange={handleFile} style={{ display: 'none' }} />
    </div>
  )

  // ── ANIMAL SELECT SCREEN ─────────────────────────────────
  if (step === 'select') return (
    <div className="scroll-y fade-in" style={{ flex: 1, padding: '14px 16px' }}>
      <BackBtn onClick={goHome} />
      <PageTitle>Select Animal</PageTitle>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {['all', 'cow', 'bull', 'calf'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '4px 12px', borderRadius: '999px',
            border: `2px solid ${filterType === t ? 'var(--green)' : '#DDD'}`,
            background: filterType === t ? 'var(--green-pale)' : 'white',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px',
            color: filterType === t ? 'var(--green)' : 'var(--text-muted)',
          }}>
            {t === 'all' ? 'All' : `${t === 'cow' ? '🐄' : t === 'bull' ? '🐂' : '🐮'} ${t.charAt(0).toUpperCase() + t.slice(1)}s`}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {filtered.map(a => (
          <button
            key={a._id}
            onClick={() => { setAnimal(a); setStep('scantype') }}
            style={animalBtnStyle(a.status)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = a.status === 'warning' ? 'var(--gold)' : a.status === 'critical' ? 'var(--red)' : '#EEE'}
          >
            <span style={{ fontSize: '30px' }}>{a.emoji}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px', color: 'var(--text)' }}>{a.name}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>
                {a.breed} · {a.age} · {a.sex === 'M' ? '♂ Male' : '♀ Female'}
              </div>
            </div>
            {a.status !== 'healthy' && (
              <Chip
                color={a.status === 'warning' ? 'var(--gold)' : 'var(--red)'}
                bg={a.status === 'warning' ? 'rgba(212,160,23,0.15)' : '#FFEBEE'}
              >
                {a.status === 'warning' ? '⚠️ Check' : '🚨 Critical'}
              </Chip>
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // ── HOME SCREEN ──────────────────────────────────────────
  const healthy   = animals.filter(a => a.status === 'healthy').length
  const warnings  = animals.filter(a => a.status === 'warning').length
  const critical  = animals.filter(a => a.status === 'critical').length
  const needsAttn = animals.filter(a => a.status !== 'healthy')

  return (
    <div className="scroll-y fade-in" style={{ flex: 1, padding: '14px 16px' }}>
      <PageTitle>Magic Camera</PageTitle>
      <Subtitle>Point. Snap. AI vet report in seconds.</Subtitle>

      <button
        onClick={() => setStep('select')}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e =>   e.currentTarget.style.transform = 'scale(1)'}
        style={{ width: '100%', padding: '20px', borderRadius: '22px', border: 'none', background: 'linear-gradient(135deg, var(--green), var(--green-light))', color: 'white', marginBottom: '16px', boxShadow: '0 8px 22px rgba(45,106,79,0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'transform 0.15s' }}
      >
        <span style={{ fontSize: '38px' }}>📸</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '19px' }}>Scan an Animal</span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', opacity: 0.88 }}>
          {animals.length} animals · 7 body scan types
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {[
          { label: 'Cows',   emoji: '🐄', count: animals.filter(a => a.type === 'cow').length },
          { label: 'Bulls',  emoji: '🐂', count: animals.filter(a => a.type === 'bull').length },
          { label: 'Calves', emoji: '🐮', count: animals.filter(a => a.type === 'calf').length },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: 'center', padding: '12px 8px' }}>
            <div style={{ fontSize: '20px' }}>{s.emoji}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '17px', color: 'var(--green)' }}>{s.count}</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: '12px' }}>
        <SectionLabel>🏥 Herd Health Overview</SectionLabel>
        {[
          { label: 'Healthy',     color: 'var(--green-light)', bg: '#E8F5E9', count: healthy },
          { label: 'Needs Check', color: 'var(--gold)',        bg: '#FFF8E1', count: warnings },
          { label: 'Critical',    color: 'var(--red)',         bg: '#FFEBEE', count: critical },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text)' }}>{s.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '90px', background: '#EEE', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${animals.length ? (s.count / animals.length) * 100 : 0}%`, height: '100%', background: s.color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
              </div>
              <Chip color={s.color} bg={s.bg}>{s.count}</Chip>
            </div>
          </div>
        ))}
      </Card>

      {needsAttn.length > 0 && (
        <div style={{ background: '#FFF3ED', border: '2px solid var(--red-light)', borderRadius: '16px', padding: '13px', marginBottom: '12px' }}>
          <SectionLabel style={{ color: 'var(--red)' }}>⚠️ Needs Attention ({needsAttn.length})</SectionLabel>
          {needsAttn.map(a => (
            <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text)' }}>
                {a.emoji} {a.name} <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({a.breed})</span>
              </span>
              <button
                onClick={() => { setAnimal(a); setStep('scantype') }}
                style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: '999px', padding: '3px 11px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '10px' }}
              >
                Scan Now
              </button>
            </div>
          ))}
        </div>
      )}

      {scanLog.length > 0 && (
        <Card>
          <SectionLabel>🗂 Recent Scans</SectionLabel>
          {scanLog.slice(0, 5).map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '7px', padding: '7px', background: '#F9F9F9', borderRadius: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '7px', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {SCAN_TYPES.find(s => s.label === l.type)?.emoji || '📸'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '11px', color: 'var(--text)' }}>{l.animalName} · {l.type}</div>
                <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)' }}>{l.condition} · {l.date}</div>
              </div>
              <Chip
                color={l.status === 'healthy' ? 'var(--green-light)' : l.status === 'critical' ? 'var(--red)' : 'var(--gold)'}
                bg={l.status === 'healthy' ? '#E8F5E9' : l.status === 'critical' ? '#FFEBEE' : '#FFF8E1'}
              >
                {l.status}
              </Chip>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

// ── Camera / Gallery source picker bottom sheet ───────────────
function SourcePicker({ scanType, onCamera, onGallery, onClose }) {
  const label = SCAN_TYPES.find(s => s.id === scanType)?.label || scanType
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      />
      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        background: 'white', borderRadius: '22px 22px 0 0',
        padding: '16px 20px 32px', zIndex: 201,
        animation: 'slideUp 0.22s ease',
      }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', background: '#DDD', borderRadius: '999px', margin: '0 auto 16px' }} />

        <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '17px', color: 'var(--green)', marginBottom: '4px', textAlign: 'center' }}>
          {label} Scan
        </div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
          How would you like to add the photo?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Take photo */}
          <button
            onClick={onCamera}
            style={{
              padding: '20px 12px', borderRadius: '18px',
              border: '2px solid var(--green-pale)',
              background: 'linear-gradient(135deg, #f0fff4, #e8f5e9)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.border = '2px solid var(--green)'}
            onMouseLeave={e => e.currentTarget.style.border = '2px solid var(--green-pale)'}
          >
            <span style={{ fontSize: '36px' }}>📷</span>
            <div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px', color: 'var(--green)' }}>Take Photo</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Use camera now</div>
            </div>
          </button>

          {/* Upload from gallery */}
          <button
            onClick={onGallery}
            style={{
              padding: '20px 12px', borderRadius: '18px',
              border: '2px solid #E0E0E0',
              background: 'linear-gradient(135deg, #f8f9fa, #f0f0f0)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.border = '2px solid var(--green)'}
            onMouseLeave={e => e.currentTarget.style.border = '2px solid #E0E0E0'}
          >
            <span style={{ fontSize: '36px' }}>🖼️</span>
            <div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '14px', color: 'var(--text)' }}>Upload Photo</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>From gallery</div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: '14px', padding: '11px', border: 'none', background: 'transparent', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}

// ── Shared UI primitives ──────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...style }}>{children}</div>
}
function Chip({ children, color, bg }) {
  return <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '10px', color, background: bg, padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap' }}>{children}</span>
}
function SectionLabel({ children, style = {} }) {
  return <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'var(--brown)', fontSize: '12px', marginBottom: '9px', ...style }}>{children}</div>
}
function MiniLabel({ children, color }) {
  return <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color, fontSize: '10px', marginBottom: '4px' }}>{children}</div>
}
function BulletItem({ children }) {
  return <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--brown)', marginBottom: '3px', paddingLeft: '8px' }}>• {children}</div>
}
function CheckCircle() {
  return (
    <div style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
  )
}
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', color: 'var(--green)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', marginBottom: '10px', padding: 0, cursor: 'pointer' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
      Back
    </button>
  )
}
function PageTitle({ children }) {
  return <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '22px', color: 'var(--green)', marginBottom: '2px' }}>{children}</div>
}
function Subtitle({ children }) {
  return <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>{children}</div>
}
function GreenBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '13px', background: 'var(--green)', border: 'none', borderRadius: '14px', color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '13px', marginTop: '4px', cursor: 'pointer' }}>
      {children}
    </button>
  )
}

const scanTypeBtnStyle = {
  padding: '14px 10px', borderRadius: '14px',
  border: '2px solid #E5E5E5', background: 'var(--card-bg)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)', transition: 'all 0.15s', cursor: 'pointer',
}
const animalBtnStyle = (status) => ({
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '11px 13px', background: 'var(--card-bg)', borderRadius: '14px',
  border: `2px solid ${status === 'warning' ? 'var(--gold)' : status === 'critical' ? 'var(--red)' : '#EEE'}`,
  textAlign: 'left', transition: 'border-color 0.15s', cursor: 'pointer',
})