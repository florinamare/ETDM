// Small monoline SVG icon set
const Icon = {
  scan: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M3 12h18" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  mic: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke={p.c||'currentColor'} strokeWidth="1.8"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3M8.5 21h7" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  map: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M9 3v16M15 5v16" stroke={p.c||'currentColor'} strokeWidth="1.6"/>
    </svg>
  ),
  list: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  ar: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <path d="M12 3L4 7v10l8 4 8-4V7l-8-4z" stroke={p.c||'currentColor'} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M4 7l8 4 8-4M12 11v10" stroke={p.c||'currentColor'} strokeWidth="1.6"/>
    </svg>
  ),
  pin: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-6.5-7-12a7 7 0 1114 0c0 5.5-7 12-7 12z" fill={p.fill||'none'} stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="12" cy="9" r="2.5" fill={p.dotFill||'none'} stroke={p.c||'currentColor'} strokeWidth="1.8"/>
    </svg>
  ),
  star: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill={p.c||'currentColor'}>
      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
    </svg>
  ),
  back: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  close: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  compass: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={p.c||'currentColor'} strokeWidth="1.6"/>
      <path d="M15 9l-2 6-4 1 2-6 4-1z" fill={p.c||'currentColor'}/>
    </svg>
  ),
  bookmark: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill={p.fill||'none'}>
      <path d="M6 3h12v18l-6-4-6 4V3z" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  share: (p) => (
    <svg width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v13M7 8l5-5 5 5M5 13v7h14v-7" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  sparkle: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill={p.c||'currentColor'}>
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z"/>
    </svg>
  ),
  check: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none">
      <path d="M4 12l5 5L20 6" stroke={p.c||'currentColor'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  lock: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke={p.c||'currentColor'} strokeWidth="1.8"/>
      <path d="M8 10V7a4 4 0 018 0v3" stroke={p.c||'currentColor'} strokeWidth="1.8"/>
    </svg>
  ),
  chevron: (p) => (
    <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none">
      <path d="M9 5l7 7-7 7" stroke={p.c||'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  camera: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke={p.c||'currentColor'} strokeWidth="1.8"/>
      <circle cx="12" cy="13.5" r="3.5" stroke={p.c||'currentColor'} strokeWidth="1.8"/>
      <path d="M8 7l1.5-3h5L16 7" stroke={p.c||'currentColor'} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  globe: (p) => (
    <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={p.c||'currentColor'} strokeWidth="1.6"/>
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke={p.c||'currentColor'} strokeWidth="1.6"/>
    </svg>
  ),
};

window.Icon = Icon;
