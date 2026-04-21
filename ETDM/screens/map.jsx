// Map tab — shows user location + nearby landmarks
function MapScreen({ buildings, discovered, activeBuilding, setActiveBuilding, onOpenDetail }) {
  const t = window.tokens;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#0a0e14', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 16px',
        background: 'linear-gradient(180deg, rgba(10,14,20,0.98), rgba(10,14,20,0.85))',
        position: 'relative', zIndex: 5,
      }}>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.accent,
          letterSpacing: 2, marginBottom: 6,
        }}>◈ HARTA ORAȘULUI</div>
        <div style={{
          fontFamily: t.display, fontSize: 22, fontWeight: 700,
          color: '#fff', letterSpacing: -0.3,
        }}>Centrul Vechi</div>
        <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>
          {buildings.length} monumente în raza de 500 m · {discovered.length} descoperite
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapCanvas buildings={buildings} discovered={discovered}
          activeBuilding={activeBuilding}
          setActiveBuilding={setActiveBuilding}/>

        {/* Floating controls */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10,
        }}>
          {['+', '−', '⌖'].map((s, i) => (
            <button key={i} style={{
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: 'rgba(12,16,23,0.85)', backdropFilter: 'blur(14px)',
              color: '#fff', fontSize: s === '⌖' ? 16 : 20, fontWeight: 400,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Carousel of nearby */}
      <div style={{
        background: 'linear-gradient(0deg, rgba(7,7,10,0.98), rgba(7,7,10,0.6))',
        padding: '14px 0 94px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 20px', marginBottom: 10,
        }}>
          <div style={{
            fontFamily: t.mono, fontSize: 10, color: t.textMuted,
            letterSpacing: 1.5,
          }}>APROPIATE DE TINE</div>
          <div style={{ fontSize: 11, color: t.accent, fontWeight: 500 }}>Vezi toate</div>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '0 20px', scrollbarWidth: 'none',
        }}>
          {buildings.map((b, i) => {
            const isDiscovered = discovered.includes(i);
            const isActive = i === activeBuilding;
            return (
              <div key={b.id} onClick={() => { setActiveBuilding(i); onOpenDetail && onOpenDetail(); }}
                style={{
                  minWidth: 186, borderRadius: 14,
                  padding: '12px 14px', cursor: 'pointer', flexShrink: 0,
                  background: isActive ? `linear-gradient(135deg, ${b.accent}22, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? b.accent + '66' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{
                    padding: '3px 7px', borderRadius: 6,
                    background: `${b.accent}22`,
                    fontFamily: t.mono, fontSize: 8, letterSpacing: 1,
                    color: b.accent,
                  }}>{b.distance}</div>
                  {isDiscovered && (
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      background: b.accent, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon.check c="#042" size={11}/>
                    </div>
                  )}
                </div>
                <div style={{
                  fontFamily: t.display, fontSize: 13, fontWeight: 700,
                  color: '#fff', letterSpacing: 0.2,
                }}>{b.name}</div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>
                  {b.year} · {b.style}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <Icon.star c={b.accent} size={10}/>
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{b.rating}</span>
                  <span style={{ fontSize: 9, color: t.textMuted, marginLeft: 4 }}>· {b.tag}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MapCanvas({ buildings, discovered, activeBuilding, setActiveBuilding }) {
  const t = window.tokens;

  // street/block layout
  const blocks = [
    { x: 14, y: 12, w: 22, h: 18 }, { x: 42, y: 8, w: 26, h: 14 },
    { x: 74, y: 14, w: 20, h: 16 }, { x: 8, y: 38, w: 18, h: 22 },
    { x: 32, y: 32, w: 22, h: 18 }, { x: 60, y: 34, w: 24, h: 20 },
    { x: 14, y: 66, w: 24, h: 16 }, { x: 46, y: 60, w: 22, h: 22 },
    { x: 74, y: 62, w: 20, h: 18 },
  ];

  // building pin positions (percent)
  const pinPositions = [
    { x: 38, y: 24 }, { x: 64, y: 44 }, { x: 28, y: 56 }, { x: 72, y: 70 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Map base */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* base color */}
        <rect width="100" height="100" fill="#0d141e"/>

        {/* water body */}
        <path d="M0,82 Q20,78 35,82 Q55,86 75,80 Q90,76 100,78 L100,100 L0,100 Z" fill="#162535"/>

        {/* parks */}
        <rect x="50" y="8" width="14" height="12" rx="2" fill="#1a2a1f"/>
        <rect x="78" y="38" width="12" height="14" rx="2" fill="#1a2a1f"/>

        {/* streets */}
        {[30, 58, 84].map(y => (
          <rect key={'h'+y} x="0" y={y} width="100" height="2.2" fill="#1a2232"/>
        ))}
        {[26, 48, 72].map(x => (
          <rect key={'v'+x} x={x} y="0" width="1.8" height="100" fill="#1a2232"/>
        ))}

        {/* main road */}
        <rect x="0" y="30" width="100" height="2.6" fill="#253447"/>
        <rect x="48" y="0" width="2.2" height="100" fill="#253447"/>
        {/* lane markers */}
        {[5, 18, 32, 65, 80, 95].map(x => (
          <rect key={'m'+x} x={x} y="31" width="3" height="0.4" fill="#3a4a5e"/>
        ))}

        {/* blocks */}
        {blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="1"
            fill="#1a2030"
            stroke="#252b3a" strokeWidth="0.3"/>
        ))}
      </svg>

      {/* User location */}
      <div style={{
        position: 'absolute', left: '48%', top: '48%',
        transform: 'translate(-50%, -50%)', zIndex: 5,
      }}>
        <div style={{
          position: 'absolute', inset: -22, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.accent}44, transparent 60%)`,
          animation: 'pulse 2s ease-in-out infinite',
        }}/>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: t.accent,
          boxShadow: `0 0 0 3px rgba(255,255,255,0.85), 0 0 20px ${t.accent}`,
        }}/>
        {/* heading cone */}
        <svg style={{
          position: 'absolute', top: -34, left: -16, width: 48, height: 48,
          pointerEvents: 'none',
        }} viewBox="0 0 48 48">
          <path d="M24 8 L36 32 L24 28 L12 32 Z" fill={t.accent} opacity="0.35"/>
        </svg>
      </div>

      {/* Pins */}
      {buildings.map((b, i) => {
        const pos = pinPositions[i] || { x: 50, y: 50 };
        const isDiscovered = discovered.includes(i);
        const isActive = i === activeBuilding;
        return (
          <div key={b.id} onClick={() => setActiveBuilding(i)}
            style={{
              position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
              transform: `translate(-50%, -100%) scale(${isActive ? 1.1 : 1})`,
              zIndex: isActive ? 9 : 6,
              cursor: 'pointer', transition: 'transform 0.2s',
              filter: isDiscovered ? 'none' : 'grayscale(0.8)',
              opacity: isDiscovered ? 1 : 0.65,
            }}>
            {/* pin */}
            <div style={{
              position: 'relative',
              width: isActive ? 44 : 36, height: isActive ? 44 : 36,
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              background: isDiscovered ? b.accent : 'rgba(120,120,140,0.6)',
              border: '2px solid #fff',
              boxShadow: `0 6px 12px rgba(0,0,0,0.5), 0 0 ${isActive ? 20 : 12}px ${b.accent}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ transform: 'rotate(45deg)' }}>
                {isDiscovered ? (
                  <Icon.check c="#042" size={16}/>
                ) : (
                  <Icon.lock c="#fff" size={14}/>
                )}
              </div>
            </div>
            {isActive && (
              <div style={{
                position: 'absolute', top: -24, left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                color: '#fff', padding: '4px 10px', borderRadius: 8,
                fontSize: 10, fontFamily: t.body, fontWeight: 600,
                whiteSpace: 'nowrap',
                border: `1px solid ${b.accent}66`,
              }}>{b.shortName}</div>
            )}
          </div>
        );
      })}

      {/* Compass */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(12,16,23,0.85)', backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: t.mono, fontSize: 10, color: '#fff', fontWeight: 600,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <div style={{ color: t.accent, fontSize: 9 }}>N</div>
          <div style={{ width: 2, height: 14, background: t.accent, margin: '1px 0' }}/>
          <div style={{ color: t.textMuted, fontSize: 8 }}>S</div>
        </div>
      </div>
    </div>
  );
}

window.MapScreen = MapScreen;
