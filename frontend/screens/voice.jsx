// Voice AI sheet — ghid turistic cu voce reală și AI
function VoiceSheet({ building, onClose }) {
  const t = window.tokens;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [phase, setPhase] = React.useState('idle'); // idle | listening | thinking | answering | error
  const [transcript, setTranscript] = React.useState('');
  const [typedInput, setTypedInput] = React.useState('');
  const [messages, setMessages] = React.useState([]);    // [{role, content}]
  const [suggestions, setSuggestions] = React.useState([
    'Când a fost construit?',
    'Cine l-a proiectat?',
    'Ce stil arhitectural are?',
  ]);
  const [lastAnswer, setLastAnswer] = React.useState('');
  const [displayedAnswer, setDisplayedAnswer] = React.useState('');
  const [hasSR, setHasSR] = React.useState(false);
  const recognitionRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  // ─── Init SpeechRecognition ─────────────────────────────────────────────────
  React.useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setHasSR(!!SR);

    // Sugestii inițiale bazate pe tag
    const tagSuggestions = {
      'Monument Istoric':       ['Cum a supraviețuit timpului?', 'Ce evenimente istorice s-au petrecut?', 'De ce acest stil?'],
      'Patrimoniu UNESCO':      ['De ce a primit statutul UNESCO?', 'Ce îl face unic?', 'Cum este protejat?'],
      'Clădire Administrativă': ['Ce funcții îndeplinește astăzi?', 'Cât a durat construcția?', 'Povestea din spatele ei?'],
    };
    if (building && building.tag && tagSuggestions[building.tag]) {
      setSuggestions(tagSuggestions[building.tag]);
    }
  }, []);

  // ─── Scroll la ultimul mesaj ────────────────────────────────────────────────
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, displayedAnswer]);

  // ─── Typewriter effect pentru răspuns ──────────────────────────────────────
  React.useEffect(() => {
    if (phase !== 'answering' || !lastAnswer) return;
    setDisplayedAnswer('');
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setDisplayedAnswer(lastAnswer.slice(0, i));
      if (i >= lastAnswer.length) {
        setDisplayedAnswer(lastAnswer);
        clearInterval(iv);
      }
    }, 18);
    return () => clearInterval(iv);
  }, [phase, lastAnswer]);

  // ─── Trimitere întrebare la backend ─────────────────────────────────────────
  const handleSubmit = React.useCallback(async (question) => {
    if (!question || !question.trim()) return;
    setTranscript('');
    setTypedInput('');

    const userMsg = { role: 'user', content: question.trim() };
    setMessages(prev => [...prev, userMsg]);
    setPhase('thinking');

    // Ultimele 4 mesaje ca istoric context
    const history = messages.slice(-4).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    try {
      const data = await window.askAIVoice({ question: question.trim(), building, history });

      const answer = data.answer || 'Nu am putut genera un răspuns.';
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setSuggestions(data.suggestions || suggestions);
      setLastAnswer(answer);
      setPhase('answering');

      // Redare audio dacă există
      if (data.audio_b64) {
        try {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          const audio = new Audio(`data:audio/mp3;base64,${data.audio_b64}`);
          audioRef.current = audio;
          await audio.play();
        } catch (_) {
          // Browser poate bloca autoplay — continuăm fără audio
        }
      }
    } catch (err) {
      console.error('[AI]', err);
      setPhase('error');
      setTimeout(() => setPhase('idle'), 2000);
    }
  }, [building, messages, suggestions]);

  // ─── Microfon (Web Speech API) ──────────────────────────────────────────────
  const startListening = React.useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition = new SR();
    recognition.lang = 'ro-RO';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => setPhase('listening');

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        recognition.stop();
        handleSubmit(t);
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setPhase('idle');
    };

    recognition.onend = () => {
      if (transcript && phase === 'listening') handleSubmit(transcript);
    };

    recognition.start();
  }, [handleSubmit, transcript, phase]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setPhase('idle');
  }, []);

  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!building) return null;

  // ─── Sub-componente vizuale ──────────────────────────────────────────────────
  const Visualizer = () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 100, position: 'relative',
    }}>
      {phase === 'listening' && (
        <>
          <div style={{
            position: 'absolute', width: 130, height: 130, borderRadius: '50%',
            border: `1.5px solid ${t.accent}33`,
            animation: 'rippleOut 2s ease-out infinite',
          }}/>
          <div style={{
            position: 'absolute', width: 130, height: 130, borderRadius: '50%',
            border: `1.5px solid ${t.accent}22`,
            animation: 'rippleOut 2s ease-out infinite 0.7s',
          }}/>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 54, zIndex: 1 }}>
            {[0.5, 1.1, 0.7, 1.5, 1.0, 0.8, 1.3, 0.6, 1.2, 0.9].map((h, i) => (
              <div key={i} style={{
                width: 4, height: 50, borderRadius: 2,
                background: `linear-gradient(180deg, ${t.accent}, #8BD3FF)`,
                boxShadow: `0 0 8px ${t.accent}55`,
                animation: `wave ${0.35 + i * 0.04}s ease-in-out infinite alternate`,
                transform: `scaleY(${h})`,
              }}/>
            ))}
          </div>
        </>
      )}

      {phase === 'thinking' && (
        <div style={{ position: 'relative', width: 70, height: 70 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${t.accent}`, borderTopColor: 'transparent',
            animation: 'spin 0.85s linear infinite',
          }}/>
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: `1px solid ${t.accent}44`, borderBottomColor: 'transparent',
            animation: 'spin 1.4s linear infinite reverse',
          }}/>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon.sparkle c={t.accent} size={22}/>
          </div>
        </div>
      )}

      {phase === 'answering' && (
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.accent}33, transparent 70%)`,
          border: `2px solid ${t.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 28 }}>
            {[0.5, 1.2, 0.8, 1.4, 0.6].map((h, i) => (
              <div key={i} style={{
                width: 3, height: 20, borderRadius: 2, background: t.accent,
                animation: `wave ${0.28 + i * 0.07}s ease-in-out infinite alternate`,
                transform: `scaleY(${h})`,
              }}/>
            ))}
          </div>
        </div>
      )}

      {(phase === 'idle' || phase === 'error') && (
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: `radial-gradient(circle, ${t.accent}18, transparent 70%)`,
          border: `1.5px solid ${t.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.mic c={t.accent} size={26}/>
        </div>
      )}
    </div>
  );

  const phaseLabel = {
    idle:      hasSR ? 'APASĂ MICRO PENTRU A VORBI' : 'SCRIE ÎNTREBAREA',
    listening: '◉ ASCULT...',
    thinking:  'GÂNDESC...',
    answering: `◉ RĂSPUND · ro-RO-AlinaNeural`,
    error:     '✕ EROARE · REÎNCEARCĂ',
  }[phase] || '';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.2s ease',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(180deg, rgba(12,17,25,0.99), rgba(8,10,16,0.99))',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: 'none',
        padding: '10px 20px 34px',
        animation: 'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)' }}/>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{
              fontFamily: t.mono, fontSize: 10, color: t.accent,
              letterSpacing: 2, marginBottom: 4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon.sparkle c={t.accent} size={11}/>
              GHID AI · EDGE TTS
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

        {/* Vizualizator */}
        <Visualizer/>

        {/* Status label */}
        <div style={{
          textAlign: 'center', fontFamily: t.mono, fontSize: 10,
          color: phase === 'error' ? t.danger : t.accent,
          letterSpacing: 2, marginBottom: 14, minHeight: 16,
        }}>{phaseLabel}</div>

        {/* Transcriere live */}
        {(phase === 'listening' && transcript) && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            padding: '10px 14px', marginBottom: 10,
            fontSize: 13, color: '#fff', lineHeight: 1.4,
            border: `1px solid ${t.accent}33`,
          }}>
            {transcript}
            <span style={{ color: t.accent, animation: 'blink 1s steps(1) infinite' }}>▌</span>
          </div>
        )}

        {/* Conversație ─── scroll area */}
        {messages.length > 0 && (
          <div style={{
            flex: 1, overflowY: 'auto', marginBottom: 12,
            display: 'flex', flexDirection: 'column', gap: 10,
            scrollbarWidth: 'none',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                background: msg.role === 'user'
                  ? 'rgba(255,255,255,0.04)'
                  : `linear-gradient(135deg, ${t.accent}10, rgba(255,255,255,0.02))`,
                border: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.06)' : t.accent + '33'}`,
                borderRadius: 12, padding: '10px 14px',
                animation: 'fadeUp 0.25s ease',
              }}>
                <div style={{
                  fontFamily: t.mono, fontSize: 9,
                  color: msg.role === 'user' ? t.textMuted : t.accent,
                  letterSpacing: 1.5, marginBottom: 5,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {msg.role === 'user' ? 'TU' : (
                    <><Icon.sparkle c={t.accent} size={9}/> AI</>
                  )}
                </div>
                <div style={{ fontSize: 13, color: t.text, lineHeight: 1.55 }}>
                  {/* Typewriter effect doar pe ultimul mesaj AI în faza 'answering' */}
                  {msg.role === 'assistant' && i === messages.length - 1 && phase === 'answering'
                    ? displayedAnswer
                    : msg.content}
                  {msg.role === 'assistant' && i === messages.length - 1 && phase === 'answering' && displayedAnswer.length < msg.content.length && (
                    <span style={{ color: t.accent, animation: 'blink 1s steps(1) infinite' }}>▌</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>
        )}

        {/* Sugestii de întrebări */}
        {phase === 'idle' && messages.length === 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: t.mono, fontSize: 9, color: t.textMuted,
              letterSpacing: 1.5, marginBottom: 8,
            }}>ÎNTREBĂRI SUGERATE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => handleSubmit(q)} style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(94,252,207,0.05)',
                  border: `1px solid ${t.accent}28`,
                  color: t.text, fontFamily: t.body, fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Icon.mic c={t.accent} size={12}/>
                  <span style={{ flex: 1 }}>{q}</span>
                  <Icon.chevron c={t.textMuted} size={9}/>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sugestii follow-up după răspuns */}
        {phase === 'idle' && messages.length > 0 && suggestions.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => handleSubmit(q)} style={{
                  padding: '6px 10px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${t.accent}28`,
                  color: t.textDim, fontFamily: t.body, fontSize: 11,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input text fallback + buton microfon */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input
            type="text"
            value={typedInput}
            onChange={e => setTypedInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(typedInput)}
            placeholder="Scrie sau vorbește..."
            disabled={phase === 'listening' || phase === 'thinking'}
            style={{
              flex: 1, height: 44, borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${typedInput ? t.accent + '44' : 'rgba(255,255,255,0.1)'}`,
              color: '#fff', fontFamily: t.body, fontSize: 13,
              padding: '0 14px', outline: 'none',
            }}
          />

          {/* Buton trimite text */}
          {typedInput.trim() && (
            <button
              onClick={() => handleSubmit(typedInput)}
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: t.accent, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
              <Icon.chevron c="#042" size={14}/>
            </button>
          )}

          {/* Buton microfon */}
          {hasSR && !typedInput.trim() && (
            <button
              onClick={phase === 'listening' ? stopListening : startListening}
              disabled={phase === 'thinking' || phase === 'answering'}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                border: `2px solid ${phase === 'listening' ? t.danger : t.accent}`,
                background: phase === 'listening'
                  ? `rgba(255,107,139,0.18)`
                  : `radial-gradient(circle, ${t.accent}28, ${t.accent}10)`,
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: phase === 'listening'
                  ? `0 0 20px ${t.danger}44`
                  : `0 0 16px ${t.accent}33`,
                transition: 'all 0.2s',
                opacity: (phase === 'thinking' || phase === 'answering') ? 0.4 : 1,
              }}>
              {phase === 'listening'
                ? <Icon.close c={t.danger} size={18}/>
                : <Icon.mic c={t.accent} size={22}/>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

window.VoiceSheet = VoiceSheet;
