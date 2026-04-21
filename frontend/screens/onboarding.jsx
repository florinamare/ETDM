// Onboarding — 3 slides + permission dialog
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = React.useState(0);
  const [permAsked, setPermAsked] = React.useState(false);
  const t = window.tokens;

  const slides = [
    {
      title: "Privește clădirile.\nAflă povestea.",
      sub: "Îndreaptă camera către orice monument din oraș și descoperă instant istoria lui.",
      illust: 'ar',
    },
    {
      title: "Întreabă cu vocea.\nRăspunde cu AI.",
      sub: "Ghid vocal inteligent care îți răspunde în română despre orice clădire recunoscută.",
      illust: 'voice',
    },
    {
      title: "Colecționează\nBucureștiul.",
      sub: "Deblochează cladiri pe hartă, urmărește-ți progresul și împarte descoperirile.",
      illust: 'collect',
    },
  ];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else setPermAsked(true);
  };

  const current = slides[step];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 0%, #0d2220 0%, #050509 50%, #000 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '72px 24px 40px',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              height: 3, borderRadius: 2,
              width: i === step ? 28 : 18,
              background: i <= step ? t.accent : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s',
            }}/>
          ))}
        </div>
        <button onClick={onComplete} style={{
          background: 'none', border: 'none', color: t.textDim,
          fontSize: 14, fontFamily: t.body, cursor: 'pointer',
        }}>Omite</button>
      </div>

      {/* Illustration area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <OnboardIllust kind={current.illust} />
      </div>

      {/* Copy */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: t.display, fontWeight: 700,
          fontSize: 30, lineHeight: 1.1, color: '#fff',
          whiteSpace: 'pre-line', marginBottom: 14,
          letterSpacing: -0.5,
        }}>{current.title}</div>
        <div style={{
          fontSize: 15, lineHeight: 1.5, color: t.textDim,
          fontFamily: t.body,
        }}>{current.sub}</div>
      </div>

      <button onClick={next} style={{
        height: 54, borderRadius: 16, border: 'none',
        background: t.accent, color: '#042', cursor: 'pointer',
        fontFamily: t.body, fontSize: 16, fontWeight: 600,
        boxShadow: `0 10px 30px ${t.accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {step < slides.length - 1 ? 'Continuă' : 'Acordă permisiuni'}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="#042" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Permission sheet */}
      {permAsked && <PermissionSheet onGrant={onComplete} onDeny={() => setPermAsked(false)} />}
    </div>
  );
}

function OnboardIllust({ kind }) {
  const t = window.tokens;
  if (kind === 'ar') {
    return (
      <div style={{ position: 'relative', width: 260, height: 260 }}>
        {/* phone outline */}
        <div style={{
          position: 'absolute', inset: '20px 80px',
          border: `1.5px solid ${t.borderStrong}`, borderRadius: 22,
          background: 'linear-gradient(180deg, #0e1822, #070a10)',
        }}/>
        {/* reticle inside phone */}
        <div style={{
          position: 'absolute', top: 100, left: 100, width: 60, height: 60,
          border: `1.5px dashed ${t.accent}`, borderRadius: 8,
          animation: 'pulse 2s ease-in-out infinite',
        }}/>
        {/* floating info card */}
        <div style={{
          position: 'absolute', top: 40, right: 12, width: 130,
          background: t.panel, backdropFilter: 'blur(12px)',
          border: `1px solid ${t.accent}44`, borderRadius: 10,
          padding: '10px 12px', animation: 'float 3s ease-in-out infinite',
        }}>
          <div style={{ fontFamily: t.mono, fontSize: 8, color: t.accent, letterSpacing: 1 }}>RECUNOSCUT</div>
          <div style={{ fontFamily: t.display, fontSize: 11, fontWeight: 700, marginTop: 3 }}>Ateneul</div>
          <div style={{ fontSize: 9, color: t.textDim, marginTop: 3 }}>1888 · Neoclasic</div>
          <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
            {[1,1,1,1,0.3].map((v,i) => (
              <div key={i} style={{ flex:1, height: 3, borderRadius: 2, background: t.accent, opacity: v }}/>
            ))}
          </div>
        </div>
        {/* scan corners */}
        {['tl','tr','bl','br'].map((p, i) => (
          <div key={p} style={{
            position: 'absolute', width: 16, height: 16,
            top: p[0]==='t' ? 30 : 'auto', bottom: p[0]==='b' ? 30 : 'auto',
            left: p[1]==='l' ? 90 : 'auto', right: p[1]==='r' ? 90 : 'auto',
            borderTop: p[0]==='t' ? `2px solid ${t.accent}` : 'none',
            borderBottom: p[0]==='b' ? `2px solid ${t.accent}` : 'none',
            borderLeft: p[1]==='l' ? `2px solid ${t.accent}` : 'none',
            borderRight: p[1]==='r' ? `2px solid ${t.accent}` : 'none',
          }}/>
        ))}
      </div>
    );
  }
  if (kind === 'voice') {
    return (
      <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          border: `1.5px solid ${t.accent}33`, animation: 'rippleOut 2s ease-out infinite',
        }}/>
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          border: `1.5px solid ${t.accent}33`, animation: 'rippleOut 2s ease-out infinite 0.8s',
        }}/>
        <div style={{
          width: 108, height: 108, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.accent}33, transparent)`,
          border: `1.5px solid ${t.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display:'flex', gap: 3, alignItems: 'center', height: 40 }}>
            {[0.6,1.2,0.8,1.5,1,0.7,1.3,0.5].map((h, i) => (
              <div key={i} style={{
                width: 3, height: 40, borderRadius: 2, background: t.accent,
                animation: `wave ${0.5 + i * 0.08}s ease-in-out infinite alternate`,
                transform: `scaleY(${h})`,
              }}/>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: 10, padding: '6px 12px',
          background: t.panel, border: `1px solid ${t.border}`, borderRadius: 20,
          fontFamily: t.mono, fontSize: 10, color: t.textDim,
        }}>„Când a fost construit?”</div>
      </div>
    );
  }
  // collect
  return (
    <div style={{ position: 'relative', width: 260, height: 260 }}>
      {window.buildings.slice(0,4).map((b, i) => (
        <div key={b.id} style={{
          position: 'absolute',
          top: [20, 60, 130, 180][i], left: [30, 140, 40, 130][i],
          width: 90, height: 58, borderRadius: 10,
          background: t.panelSolid, border: `1px solid ${b.accent}55`,
          padding: '8px 10px',
          boxShadow: `0 8px 24px ${b.accent}22`,
          animation: `fadeUp 0.5s ease ${i * 0.15}s both`,
        }}>
          <div style={{ fontFamily: t.mono, fontSize: 7, color: b.accent, letterSpacing: 1 }}>DEBLOCAT</div>
          <div style={{ fontFamily: t.display, fontSize: 10, fontWeight: 700, marginTop: 3 }}>{b.shortName}</div>
          <div style={{ fontSize: 8, color: t.textDim, marginTop: 2 }}>{b.year}</div>
        </div>
      ))}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d="M70 50 L180 90 L85 160 L175 210" stroke={t.accent} strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none"/>
      </svg>
    </div>
  );
}

function PermissionSheet({ onGrant, onDeny }) {
  const t = window.tokens;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'rgba(30,30,36,0.95)', borderRadius: 14,
        padding: '22px 20px 10px', width: '100%', maxWidth: 290,
        fontFamily: t.body, textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.12)',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>
          „AR Tourist” dorește acces la cameră
        </div>
        <div style={{ fontSize: 13, color: t.textDim, marginTop: 8, lineHeight: 1.4 }}>
          Camera este folosită pentru a recunoaște clădirile în timp real și a afișa informații AR deasupra lor.
        </div>
        <div style={{ fontSize: 13, color: t.textDim, marginTop: 12, lineHeight: 1.4 }}>
          De asemenea, microfonul permite utilizarea asistentului vocal.
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 18, display: 'flex' }}>
          <button onClick={onDeny} style={{
            flex: 1, padding: '12px 0', border: 'none', background: 'none',
            color: '#0A84FF', fontSize: 16, fontFamily: t.body, cursor: 'pointer',
          }}>Nu permite</button>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}/>
          <button onClick={onGrant} style={{
            flex: 1, padding: '12px 0', border: 'none', background: 'none',
            color: '#0A84FF', fontSize: 16, fontWeight: 600, fontFamily: t.body, cursor: 'pointer',
          }}>Permite</button>
        </div>
      </div>
    </div>
  );
}

window.OnboardingScreen = OnboardingScreen;
