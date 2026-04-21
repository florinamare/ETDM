// Discovered tab — gamified list of buildings
function DiscoveredScreen({ buildings, discovered, setActiveBuilding, onOpenDetail }) {
  const t = window.tokens;
  const pct = (discovered.length / buildings.length) * 100;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#07070a',
      overflowY: 'auto',
      paddingBottom: 96,
    }}>
      {/* Header */}
      <div style={{ padding: '56px 20px 14px' }}>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.accent,
          letterSpacing: 2, marginBottom: 6,
        }}>✦ COLECȚIA TA</div>
        <div style={{
          fontFamily: t.display, fontSize: 26, fontWeight: 700,
          color: '#fff', letterSpacing: -0.3,
        }}>Descoperite</div>
      </div>

      {/* Progress card */}
      <div style={{
        margin: '0 16px 20px', padding: '16px 18px',
        background: `linear-gradient(135deg, ${t.accent}18, rgba(255,255,255,0.02))`,
        borderRadius: 18, border: `1px solid ${t.accent}44`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 140, height: 140,
          background: `radial-gradient(circle, ${t.accent}33, transparent 70%)`,
          borderRadius: '50%',
        }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, position: 'relative' }}>
          <div>
            <div style={{ fontFamily: t.mono, fontSize: 9, color: t.textMuted, letterSpacing: 1.5 }}>
              PROGRES NIVEL EXPLORATOR
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontFamily: t.display, fontSize: 32, fontWeight: 900, color: '#fff' }}>
                {discovered.length}
              </span>
              <span style={{ fontSize: 15, color: t.textDim, fontFamily: t.display, fontWeight: 500 }}>
                / {buildings.length}
              </span>
            </div>
          </div>
          <div style={{
            padding: '5px 10px', borderRadius: 20,
            background: t.accent, color: '#042',
            fontFamily: t.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
          }}>Nivel 2</div>
        </div>

        {/* progress bar */}
        <div style={{
          height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 4,
            background: `linear-gradient(90deg, ${t.accent}, #8BD3FF)`,
            boxShadow: `0 0 10px ${t.accent}`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}/>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 10, fontSize: 11, color: t.textDim,
        }}>
          <span>{buildings.length - discovered.length} rămase</span>
          <span>▲ {Math.round(pct)}% complet</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginBottom: 20 }}>
        {[
          { n: discovered.length * 23, l: 'MINUTE\nEXPLORATE' },
          { n: discovered.length * 42, l: 'ÎNTREBĂRI\nAI' },
          { n: 3, l: 'INSIGNE\nCÂȘTIGATE' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontFamily: t.display, fontSize: 20, fontWeight: 700, color: '#fff' }}>
              {s.n}
            </div>
            <div style={{
              fontFamily: t.mono, fontSize: 8, color: t.textMuted,
              letterSpacing: 1, marginTop: 3, whiteSpace: 'pre-line', lineHeight: 1.3,
            }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* List header */}
      <div style={{
        padding: '0 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
      }}>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.textMuted,
          letterSpacing: 1.5,
        }}>MONUMENTE</div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 2 }}>
          {['Toate', 'Deblocate', 'Ascunse'].map((f, i) => (
            <div key={f} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 10,
              background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: i === 0 ? '#fff' : t.textDim, fontWeight: 500,
              cursor: 'pointer',
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {buildings.map((b, i) => {
          const isDiscovered = discovered.includes(i);
          return (
            <div key={b.id} onClick={() => { if (isDiscovered) { setActiveBuilding(i); onOpenDetail(); }}}
              style={{
                background: isDiscovered
                  ? `linear-gradient(135deg, ${b.accent}11, rgba(255,255,255,0.02))`
                  : 'rgba(255,255,255,0.015)',
                borderRadius: 14,
                border: `1px solid ${isDiscovered ? b.accent + '33' : 'rgba(255,255,255,0.06)'}`,
                padding: 14, cursor: isDiscovered ? 'pointer' : 'default',
                display: 'flex', gap: 12, alignItems: 'center',
                opacity: isDiscovered ? 1 : 0.6,
                animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
              }}>
              {/* thumbnail placeholder */}
              <div style={{
                width: 64, height: 64, borderRadius: 10,
                background: isDiscovered
                  ? `linear-gradient(135deg, ${b.accent}44, ${b.accent}11)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isDiscovered ? b.accent + '55' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', flexShrink: 0, overflow: 'hidden',
              }}>
                {/* micro-icon */}
                {isDiscovered ? (
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="8" y="16" width="20" height="14" fill={b.accent} opacity="0.7"/>
                    <rect x="10" y="20" width="3" height="4" fill="#042" opacity="0.5"/>
                    <rect x="15" y="20" width="3" height="4" fill="#042" opacity="0.5"/>
                    <rect x="20" y="20" width="3" height="4" fill="#042" opacity="0.5"/>
                    <rect x="25" y="20" width="3" height="4" fill="#042" opacity="0.5"/>
                    <polygon points="6,16 18,6 30,16" fill={b.accent}/>
                  </svg>
                ) : (
                  <Icon.lock c={t.textMuted} size={22}/>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    fontFamily: t.display, fontSize: 14, fontWeight: 700,
                    color: isDiscovered ? '#fff' : t.textMuted,
                    letterSpacing: 0.1,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {isDiscovered ? b.name : '?????????????'}
                  </div>
                  {isDiscovered && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <Icon.star c={b.accent} size={11}/>
                      <span style={{ fontSize: 11, color: '#fff', fontWeight: 500 }}>{b.rating}</span>
                    </div>
                  )}
                </div>
                {isDiscovered ? (
                  <>
                    <div style={{
                      fontFamily: t.mono, fontSize: 9, color: b.accent,
                      letterSpacing: 1, marginTop: 3,
                    }}>{b.year} · {b.tag.toUpperCase()}</div>
                    <div style={{
                      fontSize: 11, color: t.textDim, marginTop: 6,
                      lineHeight: 1.4, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>{b.blurb}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 6 }}>
                    Scanează pentru a debloca · aproximativ {b.distance}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.DiscoveredScreen = DiscoveredScreen;
