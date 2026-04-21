// Splash screen
function SplashScreen({ onComplete }) {
  React.useEffect(() => {
    const t = setTimeout(onComplete, 2400);
    return () => clearTimeout(t);
  }, []);
  const t = window.tokens;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, #0d2220 0%, #030306 60%, #000 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Grid backdrop */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
        <defs>
          <pattern id="splashGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke={t.accent} strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#splashGrid)"/>
      </svg>

      {/* Rotating rings */}
      <div style={{
        position: 'relative', width: 140, height: 140,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1.5px dashed ${t.accent}`, opacity: 0.5,
          animation: 'spin 8s linear infinite',
        }}/>
        <div style={{
          position: 'absolute', inset: 18, borderRadius: '50%',
          border: `1px solid ${t.accent}55`,
          animation: 'spin 4s linear infinite reverse',
          borderTopColor: t.accent,
        }}/>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: `linear-gradient(135deg, ${t.accent}, #2bd4a0)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${t.accent}66, inset 0 2px 0 rgba(255,255,255,0.3)`,
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" stroke="#042" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M4 7l8 4 8-4M12 11v10" stroke="#042" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      <div style={{
        fontFamily: t.display, fontWeight: 900, fontSize: 22,
        color: '#fff', letterSpacing: 4, marginTop: 36,
      }}>AR TOURIST</div>
      <div style={{
        fontFamily: t.mono, fontSize: 10, color: t.accent,
        letterSpacing: 3, marginTop: 8, opacity: 0.75,
      }}>SMART GUIDE · v2.1</div>

      <div style={{
        position: 'absolute', bottom: 80, display: 'flex',
        alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: 3, background: t.accent,
          animation: 'pulse 1s ease-in-out infinite',
        }}/>
        <div style={{ fontFamily: t.mono, fontSize: 10, color: t.textMuted, letterSpacing: 2 }}>
          INIȚIALIZARE SISTEM
        </div>
      </div>
    </div>
  );
}

window.SplashScreen = SplashScreen;
