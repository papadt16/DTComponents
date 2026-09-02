import { useState } from "react";

// Three small animated schematic-style SVGs to fill the empty right side
// of the hero. Pure CSS-driven animation (see the "HERO CIRCUIT ANIMATION"
// block in global.css) — no JS timers, so it's cheap to keep running.
// Deliberately simplified/illustrative rather than fully accurate pinouts —
// this is decoration, not a build guide.

function Circuit555Blinker() {
  return (
    <svg viewBox="0 0 320 220" fill="none">
      {/* Vcc rail — power always flowing */}
      <line x1="40" y1="36" x2="280" y2="36" stroke="var(--signal)" strokeWidth="2" className="anim-flow-slow" />
      <text x="40" y="24" fontSize="11" fill="var(--text-on-dark-muted)" fontFamily="var(--font-mono)">+V</text>

      {/* Vcc down to chip */}
      <line x1="160" y1="36" x2="160" y2="70" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* Chip body */}
      <rect x="120" y="70" width="80" height="70" rx="6" fill="var(--copper)" className="anim-chip-pulse" />
      <circle cx="132" cy="82" r="3" fill="var(--silkscreen)" />
      <text x="160" y="112" textAnchor="middle" fontSize="16" fontFamily="var(--font-mono)" fill="var(--ink)" fontWeight="700">555</text>

      {/* Timing network — left */}
      <line x1="120" y1="95" x2="80" y2="95" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="80" y1="36" x2="80" y2="95" stroke="var(--text-on-dark-muted)" strokeWidth="2" strokeDasharray="0" />
      {/* resistor on the vertical timing leg */}
      <path d="M80 50 l-6 4 l12 6 l-12 6 l12 6 l-6 4" stroke="var(--silkscreen)" strokeWidth="2" fill="none" />
      {/* capacitor to ground */}
      <line x1="80" y1="95" x2="80" y2="150" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="65" y1="156" x2="95" y2="156" stroke="var(--silkscreen)" strokeWidth="3" />
      <line x1="65" y1="164" x2="95" y2="164" stroke="var(--silkscreen)" strokeWidth="2" />
      <line x1="80" y1="164" x2="80" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* Output branch — right, drives the LED */}
      <line x1="200" y1="95" x2="240" y2="95" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <path d="M240 95 l6 -4 l-12 -6 l12 -6 l-12 -6 l6 -4" stroke="var(--silkscreen)" strokeWidth="2" fill="none" transform="translate(0,20) rotate(90 240 95)" />
      <line x1="240" y1="95" x2="240" y2="115" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <g transform="translate(240,115)">
        <polygon points="-9,0 9,0 0,16" fill="currentColor" className="anim-led-blink" />
        <line x1="-9" y1="16" x2="9" y2="16" stroke="currentColor" strokeWidth="2" className="anim-led-blink" />
      </g>
      <line x1="240" y1="131" x2="240" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* Ground rail */}
      <line x1="40" y1="190" x2="280" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="160" y1="140" x2="160" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="148" y1="196" x2="172" y2="196" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="152" y1="202" x2="168" y2="202" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="156" y1="208" x2="164" y2="208" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
    </svg>
  );
}

function CapacitorCharge() {
  return (
    <svg viewBox="0 0 320 220" fill="none">
      <line x1="50" y1="40" x2="220" y2="40" stroke="var(--signal)" strokeWidth="2" className="anim-flow-slow" />
      <text x="50" y="28" fontSize="11" fill="var(--text-on-dark-muted)" fontFamily="var(--font-mono)">+V</text>

      <line x1="90" y1="40" x2="90" y2="60" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      {/* resistor */}
      <path d="M90 60 l-6 4 l12 6 l-12 6 l12 6 l-6 4" stroke="var(--silkscreen)" strokeWidth="2" fill="none" />
      <line x1="90" y1="96" x2="90" y2="120" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* capacitor jar, fill animates */}
      <rect x="60" y="120" width="60" height="60" rx="4" fill="none" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <clipPath id="capClip">
        <rect x="60" y="120" width="60" height="60" rx="4" />
      </clipPath>
      <rect x="60" y="120" width="60" height="60" fill="var(--copper)" className="anim-cap-fill" clipPath="url(#capClip)" opacity="0.85" />
      <text x="90" y="115" textAnchor="middle" fontSize="10" fill="var(--text-on-dark-muted)" fontFamily="var(--font-mono)">C1</text>

      <line x1="90" y1="180" x2="90" y2="200" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* bulb branch showing brightness track the charge */}
      <line x1="220" y1="40" x2="220" y2="150" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <circle cx="220" cy="168" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="anim-cap-fill" style={{ color: "#ffd166", transformOrigin: "220px 168px" }} />
      <line x1="211" y1="159" x2="229" y2="177" stroke="currentColor" strokeWidth="1.5" style={{ color: "#ffd166" }} />
      <line x1="229" y1="159" x2="211" y2="177" stroke="currentColor" strokeWidth="1.5" style={{ color: "#ffd166" }} />
      <line x1="220" y1="186" x2="220" y2="200" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      <line x1="90" y1="200" x2="220" y2="200" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="155" y1="200" x2="155" y2="208" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="145" y1="208" x2="165" y2="208" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="149" y1="213" x2="161" y2="213" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
    </svg>
  );
}

function AstableFlasher() {
  return (
    <svg viewBox="0 0 320 220" fill="none">
      <line x1="40" y1="30" x2="280" y2="30" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      <line x1="40" y1="190" x2="280" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

      {/* left branch: LED A */}
      <g transform="translate(110,0)">
        <line x1="0" y1="30" x2="0" y2="55" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
        <polygon points="-9,55 9,55 0,71" fill="currentColor" className="anim-flasher-a" />
        <line x1="-9" y1="71" x2="9" y2="71" stroke="currentColor" strokeWidth="2" className="anim-flasher-a" />
        <line x1="0" y1="71" x2="0" y2="95" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

        {/* transistor */}
        <circle cx="0" cy="120" r="20" fill="none" stroke="var(--copper)" strokeWidth="2" />
        <line x1="0" y1="95" x2="0" y2="106" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
        <line x1="-10" y1="112" x2="10" y2="128" stroke="var(--copper)" strokeWidth="2" />
        <line x1="-10" y1="112" x2="-10" y2="128" stroke="var(--copper)" strokeWidth="2" />
        <line x1="0" y1="140" x2="0" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      </g>

      {/* right branch: LED B */}
      <g transform="translate(210,0)">
        <line x1="0" y1="30" x2="0" y2="55" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
        <polygon points="-9,55 9,55 0,71" fill="currentColor" className="anim-flasher-b" />
        <line x1="-9" y1="71" x2="9" y2="71" stroke="currentColor" strokeWidth="2" className="anim-flasher-b" />
        <line x1="0" y1="71" x2="0" y2="95" stroke="var(--text-on-dark-muted)" strokeWidth="2" />

        <circle cx="0" cy="120" r="20" fill="none" stroke="var(--copper)" strokeWidth="2" />
        <line x1="0" y1="95" x2="0" y2="106" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
        <line x1="-10" y1="112" x2="10" y2="128" stroke="var(--copper)" strokeWidth="2" />
        <line x1="-10" y1="112" x2="-10" y2="128" stroke="var(--copper)" strokeWidth="2" />
        <line x1="0" y1="140" x2="0" y2="190" stroke="var(--text-on-dark-muted)" strokeWidth="2" />
      </g>

      {/* cross-coupling capacitors between the two transistor bases */}
      <line x1="110" y1="118" x2="210" y2="118" stroke="var(--signal)" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.55" />

      <text x="160" y="205" textAnchor="middle" fontSize="10" fill="var(--text-on-dark-muted)" fontFamily="var(--font-mono)">Q1 ⇄ Q2 cross-coupled</text>
    </svg>
  );
}

const CIRCUITS = [
  { key: "555", label: "555 Timer — LED Blinker", Component: Circuit555Blinker },
  { key: "rc", label: "RC Charge / Discharge", Component: CapacitorCharge },
  { key: "astable", label: "Astable LED Flasher", Component: AstableFlasher },
];

export default function HeroCircuitAnimation() {
  const [index, setIndex] = useState(0);
  const { label, Component } = CIRCUITS[index];

  function prev() {
    setIndex((i) => (i - 1 + CIRCUITS.length) % CIRCUITS.length);
  }
  function next() {
    setIndex((i) => (i + 1) % CIRCUITS.length);
  }

  return (
    <div className="hero-circuit-panel">
      <div className="hero-circuit-label">{label}</div>
      <div className="hero-circuit-stage">
        <button className="hero-circuit-arrow left" onClick={prev} aria-label="Previous circuit">‹</button>
        <Component key={index} />
        <button className="hero-circuit-arrow right" onClick={next} aria-label="Next circuit">›</button>
      </div>
      <div className="hero-circuit-dots">
        {CIRCUITS.map((c, i) => (
          <span key={c.key} className={`hero-circuit-dot ${i === index ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
}
