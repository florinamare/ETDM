// AR View — the core experience

function CornerBrackets({ color, size = 22, thickness = 2, inset = 0, animated = false }) {
  const style = (v, h) => ({
    position: 'absolute', width: size, height: size,
    top: v === 't' ? inset : 'auto', bottom: v === 'b' ? inset : 'auto',
    left: h === 'l' ? inset : 'auto', right: h === 'r' ? inset : 'auto',
    borderTop: v === 't' ? `${thickness}px solid ${color}` : 'none',
    borderBottom: v === 'b' ? `${thickness}px solid ${color}` : 'none',
    borderLeft: h === 'l' ? `${thickness}px solid ${color}` : 'none',
    borderRight: h === 'r' ? `${thickness}px solid ${color}` : 'none',
    animation: animated ? 'pulse 1.4s ease-in-out infinite' : 'none',
  });
  return (
    <>
      <div style={style('t', 'l')}/>
      <div style={style('t', 'r')}/>
      <div style={style('b', 'l')}/>
      <div style={style('b', 'r')}/>
    </>
  );
}

// Simulated city skyline + environment
function CameraFeed({ time }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        linear-gradient(180deg,
          #1a2f42 0%,
          #2a4059 22%,
          #3b5672 42%,
          #4a6885 60%,
          #1f2a38 82%,
          #0d141d 100%)
      `,
    }}>
      {/* Sun glow */}
      <div style={{
        position: 'absolute', top: '18%', right: '18%', width: 120, height: 120,
        background: 'radial-gradient(circle, rgba(255,220,160,0.35), transparent 70%)',
        borderRadius: '50%', filter: 'blur(6px)',
      }}/>

      {/* Distant skyline layer */}
      <svg style={{ position: 'absolute', bottom: '28%', left: 0, right: 0, width: '100%', height: 120, opacity: 0.45 }} viewBox="0 0 400 120" preserveAspectRatio="none">
        <path d="M0,120 L0,90 L20,90 L25,70 L40,70 L45,85 L60,85 L65,60 L85,60 L90,75 L110,75 L115,50 L135,50 L140,70 L160,70 L165,55 L185,55 L190,40 L215,40 L220,60 L240,60 L245,45 L270,45 L275,65 L295,65 L300,50 L320,50 L325,70 L345,70 L350,55 L375,55 L380,80 L400,80 L400,120 Z" fill="#1a2938"/>
      </svg>

      {/* Mid ground buildings */}
      <svg style={{ position: 'absolute', bottom: '18%', left: 0, right: 0, width: '100%', height: 140 }} viewBox="0 0 400 140" preserveAspectRatio="none">
        {/* Monumental Parlamentul-style building */}
        <rect x="50" y="30" width="140" height="110" fill="#3a4555"/>
        <rect x="55" y="38" width="130" height="6" fill="#4a5568"/>
        <rect x="55" y="52" width="130" height="6" fill="#4a5568"/>
        <rect x="55" y="66" width="130" height="6" fill="#4a5568"/>
        <rect x="55" y="80" width="130" height="6" fill="#4a5568"/>
        <rect x="55" y="94" width="130" height="6" fill="#4a5568"/>
        <rect x="55" y="108" width="130" height="6" fill="#4a5568"/>
        <rect x="110" y="20" width="20" height="12" fill="#3a4555"/>
        <polygon points="105,20 135,20 120,10" fill="#4a5568"/>

        {/* Side buildings */}
        <rect x="0" y="50" width="50" height="90" fill="#2a3342"/>
        <rect x="190" y="45" width="60" height="95" fill="#323d4d"/>
        <rect x="250" y="35" width="50" height="105" fill="#2a3342"/>
        <rect x="300" y="55" width="45" height="85" fill="#323d4d"/>
        <rect x="345" y="25" width="55" height="115" fill="#2a3342"/>

        {/* windows as dots */}
        {[...Array(30)].map((_, i) => (
          <rect key={i}
            x={10 + (i % 8) * 6 + Math.floor(i/8) * 55}
            y={60 + (i % 5) * 14}
            width="2" height="3" fill="rgba(255,230,180,0.4)"/>
        ))}
      </svg>

      {/* Ground / plaza */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '18%',
        background: 'linear-gradient(180deg, #0f1620 0%, #060a10 100%)',
      }}>
        {/* tile lines */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: i * 12 + 4, left: 0, right: 0,
            height: 1, background: 'rgba(255,255,255,0.04)',
          }}/>
        ))}
      </div>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
      }}/>
    </div>
  );
}

// AR tracking grid overlay
function TrackingGrid() {
  const t = window.tokens;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09, pointerEvents: 'none' }}>
      <defs>
        <pattern id="arGrid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M 26 0 L 0 0 0 26" fill="none" stroke={t.accent} strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arGrid)"/>
    </svg>
  );
}

function ConfidenceMeter({ value = 0.92 }) {
  const t = window.tokens;
  const bars = 8;
  const active = Math.round(value * bars);
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
      {[...Array(bars)].map((_, i) => (
        <div key={i} style={{
          width: 3, height: 4 + i * 1,
          borderRadius: 1,
          background: i < active ? t.accent : 'rgba(255,255,255,0.15)',
          boxShadow: i < active ? `0 0 4px ${t.accent}` : 'none',
        }}/>
      ))}
    </div>
  );
}

// The info card that floats over a recognized building
function AROverlayCard({ building, visible, onTap }) {
  const t = window.tokens;
  if (!building) return null;
  return (
    <div onClick={onTap} style={{
      position: 'absolute',
      top: 92, left: '50%',
      transform: `translate(-50%, 0) scale(${visible ? 1 : 0.88})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
      zIndex: 15, width: 264, cursor: 'pointer',
    }}>
      {/* leader line */}
      <div style={{
        position: 'absolute', bottom: -48, left: '50%',
        width: 1.5, height: 48, transform: 'translateX(-50%)',
        background: `linear-gradient(180deg, ${building.accent}, transparent)`,
      }}/>
      <div style={{
        position: 'absolute', bottom: -52, left: '50%',
        width: 8, height: 8, borderRadius: '50%',
        background: building.accent,
        boxShadow: `0 0 10px ${building.accent}`,
        transform: 'translateX(-50%)',
        animation: 'pulse 1.6s ease-in-out infinite',
      }}/>

      <div style={{
        background: 'rgba(8,11,18,0.82)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${building.accent}44`,
        borderRadius: 14,
        padding: '12px 14px 12px',
        position: 'relative',
        boxShadow: `0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 ${building.accent}30, 0 0 40px ${building.accent}22`,
      }}>
        <CornerBrackets color={building.accent} size={10} thickness={1.2} inset={4}/>

        {/* top meta */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 6,
        }}>
          <div style={{
            fontFamily: t.mono, fontSize: 9, color: building.accent,
            letterSpacing: 1.2, textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: building.accent, boxShadow: `0 0 6px ${building.accent}` }}/>
            Recunoscut
          </div>
          <ConfidenceMeter value={0.92}/>
        </div>

        <div style={{
          fontFamily: t.display, fontSize: 15, fontWeight: 700,
          color: '#fff', letterSpacing: 0.2, lineHeight: 1.2,
        }}>{building.name}</div>

        <div style={{
          fontSize: 11, color: t.textDim, marginTop: 3, fontFamily: t.body,
        }}>{building.tag}</div>

        {/* Stat grid */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          {[
            { label: 'AN', val: building.year },
            { label: 'STIL', val: building.style },
            { label: 'DIST', val: building.distance },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.03)',
              borderRadius: 7, padding: '6px 4px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontFamily: t.mono, fontSize: 7, color: t.textMuted, letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: t.text, fontWeight: 500, marginTop: 2, fontFamily: t.body }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.star c={building.accent} size={11}/>
            <span style={{ fontSize: 11, color: t.text, fontWeight: 500 }}>{building.rating}</span>
            <span style={{ fontSize: 10, color: t.textMuted, marginLeft: 4 }}>· arhit. {building.architect}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontFamily: t.mono, color: building.accent,
          }}>
            DETALII
            <Icon.chevron c={building.accent} size={10}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// Other buildings as distant markers
function DistantMarker({ building, x, y, onTap }) {
  const t = window.tokens;
  return (
    <div onClick={onTap} style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 8,
      animation: 'fadeIn 0.6s ease',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)',
        border: `1px solid ${building.accent}66`,
        borderRadius: 20, padding: '4px 10px',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: t.mono, fontSize: 9, color: '#fff',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: building.accent, boxShadow: `0 0 6px ${building.accent}`,
        }}/>
        {building.shortName}
        <span style={{ color: t.textMuted }}>· {building.distance}</span>
      </div>
    </div>
  );
}

function ARView({ activeBuilding, setActiveBuilding, discovered, setDiscovered,
                  onOpenDetail, onOpenVoice, scanning, setScanning,
                  onScanComplete, buildings }) {
  const t = window.tokens;
  const [time, setTime] = React.useState(0);
  const building = buildings[activeBuilding];

  React.useEffect(() => {
    const iv = setInterval(() => setTime(v => v + 1), 60);
    return () => clearInterval(iv);
  }, []);

  const otherBuildings = buildings
    .map((b, i) => ({ ...b, idx: i }))
    .filter((b, i) => i !== activeBuilding);

  const markerPositions = [
    { x: 16, y: 32 }, { x: 86, y: 40 }, { x: 22, y: 58 },
  ];

  const handleScan = () => {
    if (scanning) return;
    setScanning(true);
    setTimeout(() => {
      const next = (activeBuilding + 1) % buildings.length;
      setActiveBuilding(next);
      setDiscovered(d => d.includes(next) ? d : [...d, next]);
      setScanning(false);
      onScanComplete && onScanComplete(next);
    }, 1800);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <CameraFeed time={time}/>
      <TrackingGrid/>

      {/* Scan line */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`,
          boxShadow: `0 0 18px ${t.accent}`,
          animation: 'scanline 3s linear infinite',
        }}/>
      </div>

      {/* Top HUD bar */}
      <div style={{
        position: 'absolute', top: 56, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: t.accent, boxShadow: `0 0 8px ${t.accent}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}/>
          <div>
            <div style={{ fontFamily: t.mono, fontSize: 9, color: t.accent, letterSpacing: 1.5 }}>AR ACTIV</div>
            <div style={{ fontSize: 10, color: t.textDim, marginTop: 1 }}>Centrul Vechi · București</div>
          </div>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '8px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: t.mono, fontSize: 10, color: t.text,
        }}>
          <Icon.compass c={t.accent} size={14}/>
          <span>{building.bearing} · 42°</span>
        </div>
      </div>

      {/* Reticle */}
      {!scanning && (
        <div style={{
          position: 'absolute', top: '52%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 6,
          width: 100, height: 100, pointerEvents: 'none',
        }}>
          <CornerBrackets color={t.accent} size={18} thickness={1.5} animated={true}/>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 5, height: 5, borderRadius: '50%',
            background: t.accent, boxShadow: `0 0 10px ${t.accent}`,
          }}/>
        </div>
      )}

      {/* Distant markers */}
      {!scanning && otherBuildings.map((b, i) => (
        <DistantMarker key={b.id} building={b}
          x={markerPositions[i]?.x || 20}
          y={markerPositions[i]?.y || 30}
          onTap={() => setActiveBuilding(b.idx)}/>
      ))}

      {/* Overlay card */}
      {!scanning && <AROverlayCard building={building} visible={true} onTap={onOpenDetail}/>}

      {/* Scanning overlay */}
      {scanning && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: `2px solid ${t.accent}`, borderTopColor: 'transparent',
              animation: 'spin 0.9s linear infinite',
              boxShadow: `0 0 30px ${t.accent}55`,
            }}/>
            <div style={{
              position: 'absolute', inset: 14, borderRadius: '50%',
              border: `1px solid ${t.accent}55`, borderBottomColor: 'transparent',
              animation: 'spin 1.6s linear infinite reverse',
            }}/>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.camera c={t.accent} size={28}/>
            </div>
          </div>
          <div style={{
            fontFamily: t.mono, fontSize: 11, color: t.accent,
            letterSpacing: 3, marginTop: 20,
          }}>ANALIZARE...</div>
          <div style={{
            fontSize: 11, color: t.textDim, marginTop: 6,
          }}>Compar cu 4.230 de clădiri</div>

          {/* progress bar */}
          <div style={{
            width: 160, height: 3, background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, marginTop: 16, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: t.accent,
              boxShadow: `0 0 8px ${t.accent}`,
              animation: 'shimmer 1.8s ease-in-out',
              width: '100%',
              transformOrigin: 'left',
              animation: 'spin 1.8s linear',
            }}/>
          </div>
        </div>
      )}

      {/* Building dot selector */}
      <div style={{
        position: 'absolute', bottom: 168, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6, zIndex: 15,
      }}>
        {buildings.map((b, i) => (
          <button key={i} onClick={() => setActiveBuilding(i)} style={{
            height: 6, border: 'none', cursor: 'pointer', padding: 0,
            width: i === activeBuilding ? 24 : 6,
            borderRadius: 3,
            background: i === activeBuilding ? b.accent : 'rgba(255,255,255,0.25)',
            boxShadow: i === activeBuilding ? `0 0 8px ${b.accent}` : 'none',
            transition: 'all 0.3s',
          }}/>
        ))}
      </div>

      {/* Bottom action bar */}
      <div style={{
        position: 'absolute', bottom: 88, left: 16, right: 16, zIndex: 15,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onOpenVoice} style={{
          flex: 1, height: 52, borderRadius: 14,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: t.body, fontSize: 13, fontWeight: 500,
        }}>
          <Icon.mic c={t.accent} size={18}/>
          Întreabă AI
        </button>

        <button onClick={handleScan} disabled={scanning} style={{
          width: 64, height: 64, borderRadius: '50%',
          border: `2px solid ${t.accent}`,
          background: `radial-gradient(circle, ${t.accent}33, ${t.accent}15)`,
          cursor: 'pointer', position: 'relative',
          boxShadow: `0 0 24px ${t.accent}44, inset 0 0 12px ${t.accent}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: t.accent, boxShadow: `0 0 16px ${t.accent}`,
          }}/>
          {!scanning && (
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: `1.5px solid ${t.accent}`, opacity: 0.4,
              animation: 'rippleOut 2s ease-out infinite',
            }}/>
          )}
        </button>

        <button style={{
          flex: 1, height: 52, borderRadius: 14,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: t.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: t.body, fontSize: 13, fontWeight: 500,
        }}>
          <Icon.bookmark c={t.textDim} size={16}/>
          Salvează
        </button>
      </div>
    </div>
  );
}

window.ARView = ARView;
window.CornerBrackets = CornerBrackets;
