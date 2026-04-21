// Voice AI sheet — pulls up as a sheet over AR view
function VoiceSheet({ building, onClose }) {
  const t = window.tokens;
  const [phase, setPhase] = React.useState('listening'); // listening | thinking | answering
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');

  const demoFlows = [
    {
      q: 'Când a fost construit?',
      a: `${building.name} a fost construit în ${building.year}, în timpul unei epoci de mari transformări arhitecturale. ${building.facts[0]}`,
    },
    {
      q: 'Cine l-a proiectat?',
      a: `Arhitectul ${building.architect} a creat acest monument în stil ${building.style}. ${building.facts[2]}`,
    },
  ];
  const flow = demoFlows[0];

  React.useEffect(() => {
    // Simulate voice recognition
    const typeQuestion = () => {
      let i = 0;
      const iv = setInterval(() => {
        setQuestion(flow.q.slice(0, i));
        i++;
        if (i > flow.q.length) {
          clearInterval(iv);
          setTimeout(() => setPhase('thinking'), 400);
        }
      }, 45);
      return iv;
    };
    const iv = typeQuestion();
    return () => clearInterval(iv);
  }, []);

  React.useEffect(() => {
    if (phase === 'thinking') {
      const t1 = setTimeout(() => {
        setPhase('answering');
      }, 1200);
      return () => clearTimeout(t1);
    }
    if (phase === 'answering') {
      let i = 0;
      const iv = setInterval(() => {
        setAnswer(flow.a.slice(0, i));
        i += 2;
        if (i > flow.a.length) clearInterval(iv);
      }, 20);
      return () => clearInterval(iv);
    }
  }, [phase]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'linear-gradient(180deg, rgba(12,17,25,0.98), rgba(8,10,16,0.98))',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: 'none',
        padding: '10px 20px 120px',
        animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
      }}>
        {/* handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }}/>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <div>
            <div style={{
              fontFamily: t.mono, fontSize: 10, color: t.accent,
              letterSpacing: 2, marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon.sparkle c={t.accent} size={11}/>
              GHID AI · GEMINI
            </div>
            <div style={{ fontSize: 15, color: '#fff', fontWeight: 600 }}>
              Despre {building.shortName}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon.close c={t.textDim} size={14}/>
          </button>
        </div>

        {/* Visualizer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 120, marginBottom: 14, position: 'relative',
        }}>
          {/* rings */}
          <div style={{
            position: 'absolute', width: 140, height: 140, borderRadius: '50%',
            border: `1.5px solid ${t.accent}33`,
            animation: phase === 'listening' ? 'rippleOut 2s ease-out infinite' : 'none',
          }}/>
          <div style={{
            position: 'absolute', width: 140, height: 140, borderRadius: '50%',
            border: `1.5px solid ${t.accent}33`,
            animation: phase === 'listening' ? 'rippleOut 2s ease-out infinite 0.8s' : 'none',
          }}/>

          {phase === 'listening' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 68 }}>
              {[0.6, 1.2, 0.8, 1.6, 1.1, 0.9, 1.4, 0.7, 1.3, 0.9, 0.6].map((h, i) => (
                <div key={i} style={{
                  width: 4, height: 58, borderRadius: 2,
                  background: `linear-gradient(180deg, ${t.accent}, #8BD3FF)`,
                  boxShadow: `0 0 10px ${t.accent}66`,
                  animation: `wave ${0.4 + i * 0.05}s ease-in-out infinite alternate`,
                  transform: `scaleY(${h})`,
                }}/>
              ))}
            </div>
          )}

          {phase === 'thinking' && (
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${t.accent}`, borderTopColor: 'transparent',
                animation: 'spin 0.9s linear infinite',
              }}/>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.sparkle c={t.accent} size={26}/>
              </div>
            </div>
          )}

          {phase === 'answering' && (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${t.accent}44, transparent 70%)`,
              border: `2px solid ${t.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center', height: 32 }}>
                {[0.5, 1.2, 0.8, 1.4, 0.7].map((h, i) => (
                  <div key={i} style={{
                    width: 3, height: 22, borderRadius: 2, background: t.accent,
                    animation: `wave ${0.3 + i * 0.08}s ease-in-out infinite alternate`,
                    transform: `scaleY(${h})`,
                  }}/>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status text */}
        <div style={{
          textAlign: 'center', fontFamily: t.mono, fontSize: 10,
          color: t.accent, letterSpacing: 2, marginBottom: 18,
        }}>
          {phase === 'listening' && 'ASCULT...'}
          {phase === 'thinking' && 'GÂNDESC...'}
          {phase === 'answering' && '◉ RĂSPUND · ro-RO-AlinaNeural'}
        </div>

        {/* Conversation */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 12,
          minHeight: 80,
        }}>
          <div style={{
            fontFamily: t.mono, fontSize: 9, color: t.textMuted,
            letterSpacing: 1.5, marginBottom: 6,
          }}>TU</div>
          <div style={{ fontSize: 14, color: '#fff', lineHeight: 1.4, minHeight: 20 }}>
            {question}
            {phase === 'listening' && <span style={{ color: t.accent, animation: 'blink 1s steps(1) infinite' }}>▌</span>}
          </div>
        </div>

        {(phase === 'thinking' || phase === 'answering') && (
          <div style={{
            background: `linear-gradient(135deg, ${t.accent}12, rgba(255,255,255,0.02))`,
            border: `1px solid ${t.accent}33`,
            borderRadius: 14, padding: '14px 16px',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{
              fontFamily: t.mono, fontSize: 9, color: t.accent,
              letterSpacing: 1.5, marginBottom: 6,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Icon.sparkle c={t.accent} size={10}/> AI
            </div>
            <div style={{ fontSize: 14, color: t.text, lineHeight: 1.55, minHeight: 40 }}>
              {phase === 'thinking' ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: t.accent,
                      animation: `pulse 1.2s ease-in-out infinite ${i * 0.15}s`,
                    }}/>
                  ))}
                </div>
              ) : answer}
              {phase === 'answering' && answer.length < flow.a.length && (
                <span style={{ color: t.accent, animation: 'blink 1s steps(1) infinite' }}>▌</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

window.VoiceSheet = VoiceSheet;
