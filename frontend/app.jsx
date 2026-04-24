// Main app shell — glues everything together

const TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#5EFCCF",
  "showOnboarding": true,
  "defaultTab": "ar"
}/*EDITMODE-END*/;

function App() {
  const t = window.tokens;
  const [flow, setFlow] = React.useState(TWEAKS.showOnboarding ? 'splash' : 'home'); // splash | onboarding | home
  const [tab, setTab] = React.useState(TWEAKS.defaultTab); // ar | map | list
  const [activeBuilding, setActiveBuilding] = React.useState(0);
  const [discovered, setDiscovered] = React.useState([0]);
  const [scanning, setScanning] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);
  const [showVoice, setShowVoice] = React.useState(false);
  const [tweaksOn, setTweaksOn] = React.useState(false);
  const [tweaks, setTweaks] = React.useState(TWEAKS);
  const [buildings, setBuildings] = React.useState(window.buildings);
  const [apiError, setApiError] = React.useState(null);

  React.useEffect(() => {
    window.fetchBuildings()
      .then(data => {
        if (data && data.length > 0) {
          setBuildings(data);
          window.buildings = data;
        }
      })
      .catch(err => {
        console.warn('[API] Fallback la date locale:', err.message);
        setApiError(err.message);
      });
  }, []);

  // Tweaks protocol
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOn(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Apply accent tweak
  const accent = tweaks.accent || t.accent;
  const modTokens = { ...t, accent, accentDim: `${accent}22` };
  window.tokens = modTokens;

  const updateTweak = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };

  const building = buildings[activeBuilding];

  // Tab bar
  const TabBar = () => (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,8,12,0.92)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 22, paddingTop: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {[
          { k: 'ar', label: 'AR', icon: Icon.ar },
          { k: 'map', label: 'Hartă', icon: Icon.map },
          { k: 'list', label: 'Descoperite', icon: Icon.list },
        ].map(({ k, label, icon: I }) => (
          <button key={k} onClick={() => { setTab(k); setShowDetail(false); }}
            style={{
              flex: 1, border: 'none', background: 'none', cursor: 'pointer',
              padding: '6px 0 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
            <I c={tab === k ? accent : 'rgba(255,255,255,0.35)'} size={22}/>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: tab === k ? accent : 'rgba(255,255,255,0.35)',
              fontFamily: modTokens.body, letterSpacing: 0.2,
            }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 50% 10%, #13141a 0%, #07080b 60%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', gap: 28,
      fontFamily: modTokens.body,
    }}>
      <IOSDevice dark width={390} height={800}>
        {/* flow screens */}
        {flow === 'splash' && <SplashScreen onComplete={() => setFlow('onboarding')}/>}
        {flow === 'onboarding' && <OnboardingScreen onComplete={() => setFlow('home')}/>}

        {/* home */}
        {flow === 'home' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {/* screens — hidden when Detail is showing */}
            {!showDetail && tab === 'ar' && (
              <ARView
                activeBuilding={activeBuilding}
                setActiveBuilding={setActiveBuilding}
                discovered={discovered}
                setDiscovered={setDiscovered}
                onOpenDetail={() => setShowDetail(true)}
                onOpenVoice={() => setShowVoice(true)}
                scanning={scanning}
                setScanning={setScanning}
                buildings={buildings}
              />
            )}
            {!showDetail && tab === 'map' && (
              <MapScreen
                buildings={buildings}
                discovered={discovered}
                activeBuilding={activeBuilding}
                setActiveBuilding={setActiveBuilding}
                onOpenDetail={() => setShowDetail(true)}
              />
            )}
            {!showDetail && tab === 'list' && (
              <DiscoveredScreen
                buildings={buildings}
                discovered={discovered}
                setActiveBuilding={setActiveBuilding}
                onOpenDetail={() => setShowDetail(true)}
              />
            )}

            {/* modal sheets */}
            {showDetail && (
              <DetailScreen
                building={building}
                onBack={() => setShowDetail(false)}
                onOpenVoice={() => setShowVoice(true)}
              />
            )}
            {showVoice && (
              <VoiceSheet
                building={building}
                onClose={() => setShowVoice(false)}
              />
            )}

            <TabBar/>
          </div>
        )}
      </IOSDevice>

      {/* Side context panel - shows flow map at >large viewports */}
      <SideNav flow={flow} setFlow={setFlow} tab={tab} setTab={setTab}
        setShowDetail={setShowDetail} setShowVoice={setShowVoice}
        showDetail={showDetail} showVoice={showVoice}
        scanning={scanning}
      />

      {/* Tweaks panel */}
      {tweaksOn && (
        <TweaksPanel tweaks={tweaks} update={updateTweak}/>
      )}
    </div>
  );
}

function SideNav({ flow, setFlow, tab, setTab, setShowDetail, setShowVoice, showDetail, showVoice }) {
  const t = window.tokens;
  const steps = [
    { id: 'splash', label: '1  Splash', go: () => setFlow('splash') },
    { id: 'onboarding', label: '2  Onboarding', go: () => setFlow('onboarding') },
    { id: 'ar', label: '3  AR View', go: () => { setFlow('home'); setTab('ar'); setShowDetail(false); setShowVoice(false); } },
    { id: 'voice', label: '4  Voice AI', go: () => { setFlow('home'); setTab('ar'); setShowVoice(true); } },
    { id: 'detail', label: '5  Detalii monument', go: () => { setFlow('home'); setTab('ar'); setShowDetail(true); setShowVoice(false); } },
    { id: 'map', label: '6  Hartă', go: () => { setFlow('home'); setTab('map'); setShowDetail(false); } },
    { id: 'list', label: '7  Descoperite', go: () => { setFlow('home'); setTab('list'); setShowDetail(false); } },
  ];

  let currentId = flow === 'splash' || flow === 'onboarding' ? flow : tab;
  if (showVoice) currentId = 'voice';
  else if (showDetail) currentId = 'detail';

  return (
    <div style={{
      width: 220, alignSelf: 'stretch', display: 'flex', flexDirection: 'column',
      paddingTop: 40, gap: 20,
    }}>
      <div>
        <div style={{
          fontFamily: t.mono, fontSize: 10, color: t.textMuted,
          letterSpacing: 2, marginBottom: 8,
        }}>◆ AR TOURIST</div>
        <div style={{
          fontFamily: t.display, fontSize: 18, fontWeight: 700, color: '#fff',
          letterSpacing: -0.2, marginBottom: 4,
        }}>Interactive Preview</div>
        <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.5 }}>
          Prototip iOS · React Native · ViroReact · Gemini 2.0 · Edge TTS
        </div>
      </div>

      <div>
        <div style={{
          fontFamily: t.mono, fontSize: 9, color: t.textMuted,
          letterSpacing: 2, marginBottom: 8,
        }}>NAVIGAȚIE</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map(s => (
            <button key={s.id} onClick={s.go} style={{
              textAlign: 'left', padding: '9px 12px', borderRadius: 8,
              border: 'none', cursor: 'pointer',
              background: currentId === s.id ? 'rgba(94,252,207,0.1)' : 'transparent',
              color: currentId === s.id ? t.accent : t.textDim,
              fontSize: 12, fontFamily: t.mono, fontWeight: 500,
              letterSpacing: 0.3,
              borderLeft: currentId === s.id ? `2px solid ${t.accent}` : '2px solid transparent',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{
        padding: '12px 14px', borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontFamily: t.mono, fontSize: 9, color: t.textMuted,
          letterSpacing: 1.5, marginBottom: 6,
        }}>HINT</div>
        <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.5 }}>
          Apasă butonul <span style={{ color: t.accent }}>verde rotund</span> din AR pentru a scana o clădire nouă.
        </div>
      </div>
    </div>
  );
}

function TweaksPanel({ tweaks, update }) {
  const t = window.tokens;
  const accents = [
    { name: 'Mint', c: '#5EFCCF' },
    { name: 'Cyan', c: '#8BD3FF' },
    { name: 'Peach', c: '#FFB26B' },
    { name: 'Lilac', c: '#C4A8FF' },
    { name: 'Rose', c: '#FF8FB3' },
  ];
  return (
    <div style={{
      position: 'fixed', right: 20, bottom: 20, zIndex: 1000,
      width: 260, background: 'rgba(15,18,24,0.96)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: 16,
      fontFamily: t.body, color: '#fff',
      boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    }}>
      <div style={{
        fontFamily: t.mono, fontSize: 11, color: t.accent,
        letterSpacing: 2, marginBottom: 14,
      }}>◆ TWEAKS</div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8, fontFamily: t.mono, letterSpacing: 1 }}>
          CULOARE ACCENT
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {accents.map(a => (
            <button key={a.c} onClick={() => update('accent', a.c)}
              style={{
                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                background: a.c, border: tweaks.accent === a.c ? '2px solid #fff' : '2px solid transparent',
                boxShadow: `0 0 12px ${a.c}44`,
              }} title={a.name}/>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8, fontFamily: t.mono, letterSpacing: 1 }}>
          PORNIRE APLICAȚIE
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
          {[
            { k: true, label: 'Splash' },
            { k: false, label: 'Direct AR' },
          ].map(o => (
            <button key={String(o.k)} onClick={() => update('showOnboarding', o.k)} style={{
              flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: tweaks.showOnboarding === o.k ? t.accent : 'transparent',
              color: tweaks.showOnboarding === o.k ? '#042' : t.textDim,
              fontSize: 11, fontWeight: 600, fontFamily: t.body,
            }}>{o.label}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8, fontFamily: t.mono, letterSpacing: 1 }}>
          TAB IMPLICIT
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
          {['ar', 'map', 'list'].map(k => (
            <button key={k} onClick={() => update('defaultTab', k)} style={{
              flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: tweaks.defaultTab === k ? t.accent : 'transparent',
              color: tweaks.defaultTab === k ? '#042' : t.textDim,
              fontSize: 11, fontWeight: 600, fontFamily: t.body, textTransform: 'capitalize',
            }}>{k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
