// ALX PeerFinder
// Theme built on ALX's official brand palette, using the same semantic-token
// architecture as FIT PeerFinder and ALX ProConnect: tokens are named for the
// JOB they do (surface, text, accent), not for what they look like, so a
// future palette change never leaves a variable called "gold" that's actually
// blue.
//
//   surface.*   layered dark "ink" backgrounds, lowest → highest elevation
//   line.*      borders and dividers
//   text.*      foreground hierarchy (hi = primary, lo = secondary, mute = tertiary)
//   accent.*    brand accents, each with a base + `Hi` variant:
//                 base → true brand hex; solid buttons, dark-surface fills
//                 Hi   → lighter tone; text/icons/borders on dark surfaces
//                        where the base would not clear contrast minimums
//
// ── Brand source of truth (ALX brand guide) ─────────────────────────────────
// Primary:   Deep Navy #03134F · Black #1C1F2A · Twilight Blue #0452F0
// Secondary: Lime Green #C4E878 · Jungle Green #02B75E ·
//             Jasmine Yellow #FDE791 · Sunflower Yellow #EAB308 ·
//             Lavender #E9DBFF · Pale Sky #EBF6FF
//
// Two of ALX's own secondary pairs map onto the base/Hi pattern directly —
// no invented tints needed there:
//   Jungle Green   (base) + Lime Green     (Hi) → accent.lime
//   Sunflower Yellow (base) + Jasmine Yellow (Hi) → accent.rose
//
// Everywhere else a lighter/darker tint isn't in the brand guide, it's
// clearly marked "derived" below — blended toward white or black at a noted
// ratio, not sampled from an official swatch.

const ink = {
  base: '#020A2E',    // derived — Deep Navy blended ~25% toward Black; page canvas
  raised: '#03134F',  // Deep Navy — cards, panels, navbar
  high: '#0E2569',    // derived — Deep Navy blended toward Twilight Blue; hover/elevated
  line: '#22397A',    // derived — mid navy-blue border tone
  lineSoft: '#152A5C',// derived — subtler divider tone
};

export const colors = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  surface: {
    base: ink.base,
    raised: ink.raised,
    high: ink.high,
    glass: 'rgba(3, 19, 79, 0.72)',
    scrim: 'rgba(2, 10, 46, 0.82)',
    paper: '#FFFFFF',
    paper2: '#EBF6FF', // Pale Sky
  },

  line: {
    base: ink.line,
    soft: ink.lineSoft,
    paper: '#DCE7F5', // derived light divider for the rare paper surface
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  text: {
    hi: '#EBF6FF',      // Pale Sky — headings, primary copy on dark
    lo: '#9FADD6',      // derived — secondary copy, labels
    mute: '#6672A0',     // derived — meta, placeholders, disabled
    onAccent: '#03134F', // Deep Navy — dark text on lime/rose/bright buttons
    ink: '#03134F',      // Deep Navy — primary copy on paper surfaces
    inkLo: '#1C1F2A',    // Black — secondary copy on paper surfaces
  },

  // ── Accents ───────────────────────────────────────────────────────────────
  accent: {
    // Primary action colour — buttons, links, active states
    azure: '#0452F0',       // Twilight Blue
    azureHi: '#6C93F5',     // derived — Twilight Blue blended toward white
    azureHover: '#2E6CF3',  // derived — slightly lightened hover state
    azureSoft: 'rgba(4, 82, 240, 0.14)',

    // Success, capacity bars, positive status — a true ALX brand pair
    lime: '#02B75E',        // Jungle Green
    limeHi: '#C4E878',      // Lime Green
    limeHover: '#03D06C',   // derived — lightened hover state
    limeSoft: 'rgba(2, 183, 94, 0.14)',

    // Highlights, badges, attention — a true ALX brand pair
    rose: '#EAB308',        // Sunflower Yellow
    roseHi: '#FDE791',      // Jasmine Yellow
    roseSoft: 'rgba(234, 179, 8, 0.14)',

    // Reserved pastel — Lavender, for special badges that want a distinct
    // fourth hue (kept separate from rose/yellow family above)
    lavender: '#E9DBFF',
    lavenderSoft: 'rgba(233, 219, 255, 0.14)',

    // Destructive / error — curated, ALX's palette has no red
    danger: '#E5484D',
    dangerHi: '#FF8A8E',
    dangerSoft: 'rgba(229, 72, 77, 0.14)',
  },

  // ── Effects ───────────────────────────────────────────────────────────────
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.30)',
    md: '0 4px 16px rgba(0, 0, 0, 0.34)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.44)',
    glow: '0 0 0 1px rgba(4, 82, 240, 0.30), 0 8px 28px rgba(4, 82, 240, 0.18)',
  },

  radius: { sm: '6px', md: '10px', lg: '16px', pill: '999px' },

  // ── Legacy aliases ────────────────────────────────────────────────────────
  // Every ALX page was written against these exact names (colors.primary.iris,
  // colors.secondary.gold, etc). Keeping them mapped to the new tokens means
  // any file not yet rewritten still renders correctly on the dark theme
  // instead of crashing on an undefined key.
  primary: {
    berkeleyBlue: ink.base,
    iris: '#0452F0',
    springGreen: '#02B75E',
    white: '#EBF6FF',
  },
  secondary: {
    electricBlue: '#6C93F5',
    blueNCS: '#0452F0',
    tomato: '#E5484D',
    gold: '#EAB308',
    turquoise: '#02B75E',
  },
};

export const fonts = {
  main: "'Poppins', sans-serif",
};

// Shared building blocks — spread these into a page's style object, then
// override as needed, instead of re-deriving the same card/input/button look
// in every file: style={{ ...ui.card, padding: '32px' }}
export const ui = {
  page: {
    minHeight: '100vh',
    background: colors.surface.base,
    color: colors.text.hi,
    fontFamily: fonts.main,
  },
  card: {
    background: colors.surface.raised,
    border: `1px solid ${colors.line.soft}`,
    borderRadius: colors.radius.lg,
    boxShadow: colors.shadow.md,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: colors.surface.base,
    border: `1px solid ${colors.line.base}`,
    borderRadius: colors.radius.md,
    color: colors.text.hi,
    fontFamily: fonts.main,
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: colors.text.lo,
  },
  btnPrimary: {
    background: colors.accent.azure,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: colors.radius.pill,
    padding: '14px 28px',
    fontFamily: fonts.main,
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.18s ease, transform 0.18s ease',
  },
  btnGhost: {
    background: 'transparent',
    color: colors.text.lo,
    border: `1px solid ${colors.line.base}`,
    borderRadius: colors.radius.pill,
    padding: '10px 20px',
    fontFamily: fonts.main,
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'border-color 0.18s ease, color 0.18s ease',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: colors.radius.pill,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
};

// Poppins is loaded in index.html:
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
