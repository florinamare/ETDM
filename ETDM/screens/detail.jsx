// Detail screen — full info about a building
function DetailScreen({ building, onBack, onOpenVoice }) {
  const t = window.tokens;
  if (!building) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#07070a',
      overflowY: 'auto', animation: 'fadeUp 0.35s ease',
    }}>
      {/* Hero */}
      <div style={{
        position: 'relative', height: 320,
        background: `linear-gradient(180deg, ${building.accent}22 0%, ${building.accent}08 40%, #07070a 100%)`,
        overflow: 'hidden',
      }}>
        {/* abstract building illustration */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 260 }} viewBox="0 0 340 260" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="bg1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={building.accent} stopOpacity="0.35"/>
              <stop offset="1" stopColor={building.accent} stopOpacity="0.08"/>
            </linearGradient>
          </defs>
          {/* symmetric monumental silhouette */}
          <rect x="60" y="110" width="220" height="150" fill="url(#bg1)"/>
          <rect x="80" y="90" width="180" height="20" fill={building.accent} opacity="0.4"/>
          <rect x="100" y="50" width="140" height="40" fill="url(#bg1)"/>
          <polygon points="100,50 170,15 240,50" fill={building.accent} opacity="0.5"/>
          {/* columns */}
          {[0,1,2,3,4,5,6].map(i => (
            <rect key={i} x={75 + i * 30} y="130" width="8" height="110" fill={building.accent} opacity="0.25"/>
          ))}
          {/* windows */}
          {[0,1,2,3,4,5].map(i => (
            <rect key={i} x={90 + i * 35} y="155" width="14" height="18" fill="#000" opacity="0.35"/>
          ))}
        </svg>

        {/* Top nav */}
        <div style={{
          position: 'absolute', top: 54, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 10,
        }}>
          <button onClick={onBack} style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <Icon.back c="#fff" size={18}/>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon.bookmark c="#fff" size={16}/></button>
            <button style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon.share c="#fff" size={16}/></button>
          </div>
        </div>

        {/* Tag + rating row */}
        <div style={{
          position: 'absolute', bottom: 16, left: 20, right: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{
            padding: '5px 11px', borderRadius: 20,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
            border: `1px solid ${building.accent}66`,
            fontFamily: t.mono, fontSize: 9, color: building.accent,
            letterSpacing: 1.5,
          }}>{building.tag.toUpperCase()}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', borderRadius: 20,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <Icon.star c={building.accent} size={11}/>
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{building.rating}</span>
          </div>
        </div>
      </div>

      {/* Title block */}
      <div style={{ padding: '20px 20px 14px' }}>
        <div style={{
          fontFamily: t.display, fontSize: 26, fontWeight: 700, lineHeight: 1.1,
          color: '#fff', letterSpacing: -0.4,
        }}>{building.name}</div>
        <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: t.textDim }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon.pin c={building.accent} size={12}/> {building.distance} · {building.bearing}
          </div>
          <div>{building.year}</div>
          <div>· {building.style}</div>
        </div>
      </div>

      {/* Specs */}
      <div style={{ padding: '0 16px', display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { k: 'AN', v: building.year },
          { k: 'ARHITECT', v: building.architect },
          { k: 'STIL', v: building.style },
        ].map(s => (
          <div key={s.k} style={{
            flex: 1, padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontFamily: t.mono, fontSize: 8, color: t.textMuted, letterSpacing: 1 }}>{s.k}</div>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 500, marginTop: 4, fontFamily: t.body }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Blurb */}
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: t.text, fontFamily: t.body }}>
          {building.blurb}
        </div>
      </div>

      {/* Facts */}
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.textMuted,
          letterSpacing: 1.5, marginBottom: 10,
        }}>◉ FAPTE INTERESANTE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {building.facts.map((f, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, padding: '12px 14px',
              background: 'rgba(255,255,255,0.025)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: `${building.accent}22`,
                color: building.accent, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.mono, fontSize: 11, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, flex: 1 }}>{f}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI suggestions */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.textMuted,
          letterSpacing: 1.5, marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.sparkle c={t.accent} size={12}/> ÎNTREBĂRI SUGERATE DE AI
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            `Cum arăta înainte de restaurare?`,
            `Ce evenimente istorice s-au petrecut aici?`,
            `De ce a fost ales acest stil?`,
          ].map((q, i) => (
            <button key={i} onClick={onOpenVoice} style={{
              textAlign: 'left', padding: '12px 14px', borderRadius: 12,
              background: 'rgba(94,252,207,0.06)',
              border: `1px solid ${t.accent}33`,
              color: t.text, fontFamily: t.body, fontSize: 13,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon.mic c={t.accent} size={14}/>
              <span style={{ flex: 1 }}>{q}</span>
              <Icon.chevron c={t.textDim} size={10}/>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'sticky', bottom: 96, padding: '0 16px 20px',
      }}>
        <button onClick={onOpenVoice} style={{
          width: '100%', height: 52, borderRadius: 14, border: 'none',
          background: t.accent, color: '#042',
          fontFamily: t.body, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: `0 10px 24px ${t.accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon.mic c="#042" size={17}/>
          Întreabă ghidul AI
        </button>
      </div>
    </div>
  );
}

window.DetailScreen = DetailScreen;
