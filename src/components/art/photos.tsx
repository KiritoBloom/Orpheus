"use client";

/* ============================================================
   PHOTOGRAPHIC ARTWORK — procedural SVG "photographs".
   Every clue is vector: crisp at any zoom. Human-only details
   are deliberately small/dim at fit-size, sharp when zoomed.
   ============================================================ */

export function PhotoDSC04821() {
  //DONE
  // Office window portrait, evening. CLUE: reflection in glass (lower half)
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="p1_wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3f45" /><stop offset="100%" stopColor="#2b3036" />
        </linearGradient>
        <linearGradient id="p1_glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d7f8a" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#54646e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#42525c" stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="p1_lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd9a0" stopOpacity=".9" /><stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* wall + desk */}
      <rect width="800" height="600" fill="url(#p1_wall)" />
      <rect x="0" y="470" width="800" height="130" fill="#24282e" />
      <rect x="0" y="466" width="800" height="6" fill="#1d2127" />

      {/* window */}
      <g>
        <rect x="90" y="60" width="430" height="380" fill="url(#p1_glass)" stroke="#20242a" strokeWidth="8" />
        {/* city dusk through glass */}
        <rect x="94" y="64" width="422" height="372" fill="#31404d" opacity="0.5" />
        {[...Array(14)].map((_, i) => (
          <rect key={i} x={100 + i * 30} y={330 - (i % 4) * 22} width="14" height={110 + (i % 4) * 22} fill="#232c34" opacity="0.75" />
        ))}
        {[...Array(26)].map((_, i) => (
          <circle key={`w${i}`} cx={104 + ((i * 53) % 400)} cy={120 + ((i * 91) % 200)} r="1.6" fill="#ffd9a0" opacity="0.65" />
        ))}
        {/* mullion */}
        <rect x="300" y="60" width="10" height="380" fill="#20242a" />
        <rect x="90" y="245" width="430" height="10" fill="#20242a" />

        {/* ===== THE REFLECTION (human-only clue; dim, sharpens on zoom naturally by scale) ===== */}
        <g opacity="0.32">
          {/* figure holding phone, reflected in lower-right pane */}
          <g transform="translate(452 300)">
            <ellipse cx="0" cy="118" rx="26" ry="7" fill="#10141a" />
            <path d="M-16 116 C-20 66 -14 40 0 38 C14 40 20 66 16 116 Z" fill="#141920" />
            <circle cx="0" cy="24" r="13" fill="#171d24" />
            <path d="M-13 18 A13 13 0 0 1 13 18 L 13 12 A15 15 0 0 0 -15 12 Z" fill="#0e1218" />
            {/* raised phone */}
            <rect x="17" y="28" width="9" height="16" rx="2" fill="#0a0d12" transform="rotate(-18 21 36)" />
            {/* reversed visitor badge glint on lanyard */}
            <rect x="-7" y="52" width="13" height="18" rx="1.5" fill="#1d242e" stroke="#39424d" strokeWidth="1" />
            <line x1="-2" y1="40" x2="0" y2="52" stroke="#222a33" strokeWidth="2" />
          </g>
        </g>
        {/* subtle glass sheen over everything */}
        <polygon points="90,60 250,60 150,440 90,440" fill="#ffffff" opacity="0.05" />
        <polygon points="270,60 320,60 220,440 190,440" fill="#ffffff" opacity="0.04" />
      </g>

      {/* Daniel, back three-quarter to camera, facing window */}
      <g>
        <ellipse cx="600" cy="472" rx="70" ry="10" fill="#14171b" />
        <path d="M540 470 C544 360 552 300 600 296 C648 300 656 360 660 470 Z" fill="#3c4148" />
        <path d="M548 340 C560 310 640 310 652 340 L656 380 C630 368 570 368 544 380 Z" fill="#33373e" />
        <circle cx="600" cy="272" r="30" fill="#4a4038" />
        <path d="M570 264 a30 30 0 0 1 60 0 l0 -12 a30 22 0 0 0 -60 0 z" fill="#5a5048" />
        <rect x="586" y="238" width="28" height="8" rx="4" fill="#4a4038" />
      </g>

      {/* desk items */}
      <rect x="520" y="420" width="180" height="10" rx="2" fill="#15181d" />
      <rect x="540" y="398" width="60" height="22" rx="2" fill="#1c2127" stroke="#2a3038" />
      <circle cx="700" cy="408" r="12" fill="#20252b" />
      <circle cx="700" cy="408" r="6" fill="url(#p1_lamp)" />

      {/* whiteboard corner with equations (background left) */}
      <g transform="translate(0 40)" opacity="0.9">
        <rect x="8" y="80" width="70" height="240" fill="#39424a" stroke="#20242a" strokeWidth="4" />
        <text x="16" y="112" fontSize="11" fill="#cfd8dc" fontFamily="monospace">λ̄?</text>
        <text x="16" y="140" fontSize="11" fill="#cfd8dc" fontFamily="monospace">0.0031</text>
      </g>

      {/* film grain + vignette */}
      <rect width="800" height="600" filter="url(#grainSoft)" opacity="0.5" />
      <radialGradient id="p1_vig" cx="50%" cy="46%" r="72%">
        <stop offset="62%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.42" />
      </radialGradient>
      <rect width="800" height="600" fill="url(#p1_vig)" />
      <defs>
        <filter id="grainSoft"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" /><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.03 0" /></filter>
      </defs>

      {/* EXIF timestamp burn-in (bottom-right, camera style) */}
      <text x="792" y="592" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#e8f0e8" opacity="0.85">21:47 24-03-04</text>
    </svg>
  );
}

export function PhotoDSC04655() {
  // Study wide shot. CLUE: wall clock stopped at 02:13
  //DONE
  return (
    <svg viewBox="0 0 800 533" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="p2_wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#41362c"/><stop offset="100%" stopColor="#332a22"/></linearGradient>
      </defs>
      <rect width="800" height="533" fill="url(#p2_wall)" />
      {/* bookshelves */}
      {[0, 1, 2].map((s) => (
        <g key={s} transform={`translate(${30 + s * 250} 40)`}>
          <rect width="210" height="300" fill="#241d16" stroke="#191410" strokeWidth="4"/>
          {[0,1,2,3].map((r) => (
            <g key={r}>
              <rect x="10" y={20 + r * 70} width="190" height="8" fill="#191410"/>
              {[...Array(7)].map((_, b) => (
                <rect key={b} x={16 + b * 26} y={-6 + 20 + r * 70} width={18} height={26}
                  fill={["#4d3f31","#3a3f45","#57493a","#2f3a35","#46372e","#3c3129","#50412f"][(b + r + s) % 7]} />
              ))}
            </g>
          ))}
        </g>
      ))}

      {/* THE WALL CLOCK — stopped at 02:13 */}
      <g transform="translate(400 120)">
        <circle r="46" fill="#1c1712" stroke="#5a4c3a" strokeWidth="5"/>
        <circle r="38" fill="#d8d2c4"/>
        {Array.from({length:12}).map((_,i)=>(
          <line key={i} x1="0" y1="-34" x2="0" y2="-29" stroke="#2a241c" strokeWidth={i%3===0?3:1.6} transform={`rotate(${i*30})`}/>
        ))}
        {/* hour hand ≈ 2, minute hand pointing at 13 min */}
        <line x1="0" y1="0" x2="16" y2="-14" stroke="#1c1712" strokeWidth="4" strokeLinecap="round"/>
        <line x1="0" y1="0" x2="6" y2="-30" stroke="#1c1712" strokeWidth="2.6" strokeLinecap="round"/>
        <circle r="3" fill="#1c1712"/>
        <text y="62" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#8d8171">QUARTZ · STOPPED</text>
      </g>

      {/* desk with computer */}
      <rect x="0" y="420" width="800" height="113" fill="#211a14"/>
      <rect x="0" y="414" width="800" height="8" fill="#181209"/>
      <g transform="translate(500 300)">
        <rect width="230" height="150" rx="4" fill="#11150f" stroke="#2a3128" strokeWidth="5"/>
        <rect x="8" y="8" width="214" height="134" fill="#0d130e"/>
        <text x="20" y="40" fontSize="10" fill="#7fae8b" fontFamily="monospace">orpheus@local:~$</text>
        <text x="20" y="58" fontSize="10" fill="#43604a" fontFamily="monospace">&gt; nightly_encrypt OK_</text>
      </g>
      {/* lamp glow */}
      <circle cx="160" cy="330" r="90" fill="#ffce8a" opacity="0.12"/>
      <rect x="150" y="330" width="20" height="84" fill="#191410"/>
      <ellipse cx="160" cy="326" rx="34" ry="14" fill="#e8b06a"/>

      <radialGradient id="p2_vig" cx="50%" cy="46%" r="74%"><stop offset="60%" stopColor="#000" stopOpacity="0"/><stop offset="100%" stopColor="#000" stopOpacity="0.45"/></radialGradient>
      <rect width="800" height="533" fill="url(#p2_vig)"/>
      <text x="792" y="526" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#efe8da" opacity="0.85">09:12 24-03-08</text>
    </svg>
  );
}

export function PhotoDSC04788() {
  //DONE
  // Observatory group photo. CLUE: uninvited sixth attendee photographing Daniel
  const people = [
    { x: 105, coat: "#4a3f35", h: 96, skin: "#c9a184", face: true },
    { x: 205, coat: "#39424e", h: 102, skin: "#8a6248", face: true },
    { x: 305, coat: "#57493a", h: 90, skin: "#d8b090", face: true },
    { x: 400, coat: "#42474f", h: 106, skin: "#b98c68", face: true }, // Daniel (taller, grey beard)
    { x: 495, coat: "#4d3a3a", h: 94, skin: "#caa287", face: true },
    { x: 610, coat: "#3f464d", h: 108, skin: "#cfa98c", face: false }, // THE VISITOR — turned away
  ];
  return (
    <svg viewBox="0 0 800 533" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* night sky */}
      <rect width="800" height="533" fill="#131a26"/>
      {[...Array(40)].map((_,i)=>(<circle key={i} cx={(i*97)%800} cy={(i*61)%260} r={i%5===0?1.6:1} fill="#dfe8ff" opacity={0.5+((i*13)%40)/100}/>))}
      {/* dome silhouette */}
      <path d="M0 300 Q400 130 800 300 L800 533 L0 533 Z" fill="#0d1119" opacity="0.9"/>
      <rect y="290" width="800" height="243" fill="#161b22"/>
      <rect y="284" width="800" height="10" fill="#1f252e"/>

      {people.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${430 - p.h / 2})`}>
          <ellipse cy={p.h/2+6} rx="34" ry="6" fill="#0a0d12" opacity="0.6"/>
          <path d={`M-24 ${p.h/2} C-26 ${p.h/2-58} -18 ${p.h/2-84} 0 ${p.h/2-86} C18 ${p.h/2-84} 26 ${p.h/2-58} 24 ${p.h/2} Z`} fill={p.coat}/>
          <circle cy={p.h/2-102} r="17" fill={p.skin}/>
          {p.face ? (
            <>
              <circle cx="-6" cy={p.h/2-105} r="1.6" fill="#20160e"/>
              <circle cx="6" cy={p.h/2-105} r="1.6" fill="#20160e"/>
              <path d={`M-5 ${p.h/2-95} Q0 ${p.h/2-92} 5 ${p.h/2-95}`} stroke="#3a2a1c" strokeWidth="1.4" fill="none"/>
            </>
          ) : (
            <>
              {/* turned away — hair only + raised camera */}
              <path d={`M-17 ${p.h/2-102} a17 17 0 0 1 34 0 l0 -6 a19 14 0 0 0 -34 0 z`} fill="#241d18"/>
              <rect x="16" y={p.h/2-124} width="14" height="10" rx="2" fill="#101318"/>
              <rect x="18" y={p.h/2-126} width="6" height="4" fill="#101318"/>
              {/* lanyard clip glinting backwards */}
              <rect x="-8" y={p.h/2-76} width="15" height="20" rx="1.5" fill="#1c2129" stroke="#39424d" strokeWidth="1" transform="rotate(180 0 -66)"/>
            </>
          )}
        </g>
      ))}
      <text x="20" y="516" fontSize="12" fontFamily="monospace" fill="#aab6c4" opacity="0.9">OPEN NIGHT · MAR 6 · group of 6 (list said 5)</text>
      <text x="792" y="526" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#dfe8f0" opacity="0.85">21:32 24-03-06</text>
    </svg>
  );
}

export function PhotoDSC04903() {
  //DONE
  // Whiteboard. CLUES: drift graph, circled 0.0031°?, ⊙⊙⊙ glyph row,
  // tiny handwriting bottom-right "begin with the light"
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="600" fill="#5a6167"/>
      <rect x="40" y="30" width="720" height="520" fill="#e9ece7" stroke="#8b9298" strokeWidth="10"/>
      <rect x="40" y="30" width="720" height="520" fill="none" stroke="#c3c9cc" strokeWidth="2"/>

      {/* title */}
      <text x="70" y="86" fontSize="26" fill="#31404a" fontFamily="monospace">MODEL REVISION 3 — stacked residual B(t)</text>

      {/* axes */}
      <g transform="translate(90 140)">
        <line x1="0" y1="0" x2="0" y2="300" stroke="#5b6870" strokeWidth="2"/>
        <line x1="0" y1="300" x2="480" y2="300" stroke="#5b6870" strokeWidth="2"/>
        <text x="-14" y="10" fontSize="12" fill="#5b6870" fontFamily="monospace" textAnchor="end">μr</text>
        <text x="470" y="322" fontSize="12" fill="#5b6870" fontFamily="monospace">months →</text>
        {/* exponential-ish curve */}
        <path d="M0 296 C120 290 220 280 300 255 C370 230 420 170 470 90" stroke="#31404a" strokeWidth="3.5" fill="none"/>
        {/* data dots w/ error bars */}
        {[...Array(14)].map((_,i)=>{
          const t=i/13; const x=t*470; const y=296-Math.pow(t,1.9)*206;
          return (<g key={i}><line x1={x} y1={y-9} x2={x} y2={y+9} stroke="#7a868e" strokeWidth="1.4"/><circle cx={x} cy={y} r="3" fill="#31404a"/></g>);
        })}
        <text x="330" y="70" fontSize="15" fill="#7a2e2e" fontFamily="monospace">e-fold ≈ 9 yr !</text>
      </g>

      {/* right column notes */}
      <g fontFamily="monospace" fill="#31404a">
        <text x="610" y="170" fontSize="15">granularity floor:</text>
        <text x="610" y="192" fontSize="15">0.0003 μrad</text>
        <text x="610" y="228" fontSize="15">cross-corr 0.93</text>
        <text x="610" y="264" fontSize="15">02:13 ± 4 min</text>
        <text x="610" y="286" fontSize="13" fill="#7a2e2e">(twice now)</text>
        {/* the odd glyph row */}
        <text x="612" y="360" fontSize="26" letterSpacing="10">⊙ ⊙ ⊙</text>
        <text x="612" y="384" fontSize="12">scan cycle?</text>
      </g>

      {/* circled number bottom-left of board */}
      <g transform="translate(120 500)">
        <circle r="26" fill="none" stroke="#7a2e2e" strokeWidth="2.5"/>
        <text textAnchor="middle" y="6" fontSize="17" fontFamily="monospace" fill="#31404a">0.0031°?</text>
      </g>

      {/* TINY handwriting bottom-right (human-only clue) */}
      <text x="742" y="540" textAnchor="end" fontSize="11" fontFamily="'Segoe Script','Comic Sans MS',cursive" fill="#4a5a6a" transform="rotate(-2 742 540)">begin with the light — D</text>

      <radialGradient id="p4_vig" cx="50%" cy="46%" r="75%"><stop offset="62%" stopColor="#000" stopOpacity="0"/><stop offset="100%" stopColor="#000" stopOpacity="0.35"/></radialGradient>
      <rect width="800" height="600" fill="url(#p4_vig)"/>
      <text x="792" y="592" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#f0f4ef" opacity="0.85">18:40 24-03-07</text>
    </svg>
  );
}

export function PhotoIMG0022() {
  //DONE
  // Monitor reminder card. CLUE: the three words handwritten.
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="600" fill="#1b1f24"/>
      {/* monitor bezel */}
      <rect x="60" y="60" width="680" height="440" rx="10" fill="#23282e" stroke="#15181c" strokeWidth="6"/>
      <rect x="84" y="84" width="632" height="392" fill="#0d130e"/>
      <text x="104" y="120" fontSize="13" fill="#43604a" fontFamily="monospace">mcduff-wks01 ~ $ _</text>
      <text x="104" y="150" fontSize="13" fill="#2f463a" fontFamily="monospace">[terminal dimmed]</text>
      {/* bezel brand */}
      <text x="400" y="486" textAnchor="middle" fontSize="11" fill="#4a525a" fontFamily="monospace">MERIDIAN VIEW 21"</text>

      {/* sticky note ON bezel */}
      <g transform="translate(430 250) rotate(-3)">
        <rect width="240" height="190" fill="#e8d98a" stroke="#c9b96a" strokeWidth="2"/>
        <rect width="240" height="26" fill="#dccb78"/>
        <g fontFamily="'Segoe Script','Comic Sans MS',cursive" fill="#3a3222">
          <text x="22" y="66" fontSize="21">LANTERN</text>
          <text x="22" y="104" fontSize="21">ORPHEUS</text>
          <text x="22" y="142" fontSize="21">ECHO</text>
          <text x="22" y="172" fontSize="13">— order matters. tell no one.</text>
        </g>
      </g>

      {/* pen lying on desk */}
      <g transform="translate(150 520) rotate(8)">
        <rect width="150" height="10" rx="5" fill="#2e3a4a"/>
        <rect x="138" width="12" height="10" rx="3" fill="#8b9298"/>
      </g>

      <radialGradient id="p5_vig" cx="50%" cy="46%" r="75%"><stop offset="60%" stopColor="#000" stopOpacity="0"/><stop offset="100%" stopColor="#000" stopOpacity="0.5"/></radialGradient>
      <rect width="800" height="600" fill="url(#p5_vig)"/>
      <text x="792" y="592" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#eef2ee" opacity="0.85">23:51 24-03-08 ⚡FLASH</text>
    </svg>
  );
}

export function PhotoIMG0044() {
  //DONE
  // Door camera. CLUES: timestamp overlay 02:07:33, figure w/ hard case
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="600" fill="#0c0f13"/>
      {/* fisheye porch view, grayscale-green night vision */}
      <g filter="url(#nv)">
        <rect width="800" height="600" fill="#1a221c"/>
        {/* porch boards in perspective */}
        {[...Array(6)].map((_,i)=>(
          <rect key={i} x={-100+i*30} y={430+i*28} width={1000-i*40} height="14" fill={i%2?"#232c24":"#1f2820"} opacity="0.9"/>
        ))}
        {/* door frame right */}
        <rect x="600" y="120" width="180" height="330" fill="#2a241c"/>
        <rect x="620" y="140" width="140" height="290" fill="#3a2f22"/>
        <circle cx="650" cy="300" r="6" fill="#c9b96a"/>
        {/* planter left */}
        <path d="M60 470 l30 -60 l30 60 z" fill="#24301f"/>
      </g>

      {/* THE FIGURE — cap low, hard case */}
      <g transform="translate(360 300)" opacity="0.92">
        <ellipse cy="168" rx="40" ry="8" fill="#0a0d09"/>
        <path d="M-26 164 C-30 84 -22 44 0 40 C22 44 30 84 26 164 Z" fill="#161b15"/>
        {/* cap shadowing face entirely */}
        <path d="M-18 26 a18 18 0 0 1 36 0 l6 6 -48 0 z" fill="#0e120d"/>
        <rect x="-18" y="18" width="36" height="10" fill="#0a0d09"/>
        {/* hard case in right hand */}
        <g transform="translate(34 96)">
          <rect width="56" height="34" rx="3" fill="#1d241d" stroke="#0d100c" strokeWidth="2"/>
          <rect x="24" y="-6" width="8" height="8" fill="#0d100c"/>
        </g>
        <path d="M20 60 C28 70 30 84 30 96 L38 96 C38 80 34 64 26 54 Z" fill="#161b15"/>
      </g>

      {/* IR hotspot center (camera artifact) */}
      <radialGradient id="ir" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#b8ffc9" stopOpacity="0.14"/><stop offset="100%" stopColor="#b8ffc9" stopOpacity="0"/>
      </radialGradient>
      <rect width="800" height="600" fill="url(#ir)"/>

      <filter id="nv"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 0.55 0 0 0 0 1 0 0 0 0 0.62 0 0 0 0.06 0"/><feComposite operator="over" in2="SourceGraphic"/></filter>

      {/* OSD overlays */}
      <g fontFamily="monospace" fill="#c9ffd6">
        <text x="24" y="40" fontSize="20" letterSpacing="2">CAM 01 — FRONT DOOR</text>
        <text x="24" y="70" fontSize="16">02:07:33 · MAR 10</text>
        <text x="24" y="94" fontSize="13" opacity="0.75">IR ● REC ● LOCAL EVENT WINDOW</text>
        <rect x="24" y="106" width="752" height="2" fill="#c9ffd6" opacity="0.25"/>
        <text x="776" y="580" textAnchor="end" fontSize="12" opacity="0.7">EXPORTED 06:58 BY S.OKAFOR</text>
      </g>
    </svg>
  );
}

export function PhotoIMG0103() {
  //DONE
  // Health band trace. CLUE: sync normal until 01:52, optical cache ends mid-beat
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="500" fill="#0e1113"/>
      <rect x="20" y="20" width="760" height="460" rx="8" fill="#131719" stroke="#23292c" strokeWidth="4"/>
      <text x="44" y="58" fontSize="17" fill="#9fb3ab" fontFamily="monospace">PULSEBAND — NIGHT SYNC TRACE</text>
      <text x="44" y="82" fontSize="12" fill="#5c6b64" fontFamily="monospace">subject MCDUFF,D · 2026-03-09 22:00 → 03-10 07:00 · export IMG_0103</text>

      {/* grid */}
      <g transform="translate(60 110)">
        {[...Array(6)].map((_,i)=>(<line key={i} x1="0" y1={i*56} x2="680" y2={i*56} stroke="#1d2426"/>))}
        {["22:00","00:00","02:00","04:00","06:00"].map((t,i)=>(
          <text key={t} x={i*170} y="292" fontSize="12" fill="#5c6b64" fontFamily="monospace">{t}</text>
        ))}
        {/* heartbeat trace — steady, then ends mid-beat at 01:52 */}
        <path
          d="M0 150 l14 -4 l10 8 l12 -46 l10 60 l12 -22 l14 4 l16 -6 l14 6 l12 -48 l10 62 l12 -24 l14 4 l16 -6 l14 6 l12 -46 l10 60 l12 -22 l14 4 l16 -6 l14 6 l12 -48 l10 62 l12 -24 l14 4 l16 -6 l14 6 l12 -46 l10 60 l12 -22 l14 4 l16 -6"
          stroke="#7fd49a" strokeWidth="2" fill="none"/>
        {/* gap after 01:52 */}
        <line x1="330" y1="0" x2="330" y2="280" stroke="#c9a35c" strokeWidth="2" strokeDasharray="6 5"/>
        <text x="338" y="24" fontSize="13" fill="#c9a35c" fontFamily="monospace">01:52 — last poll</text>
        <text x="338" y="42" fontSize="12" fill="#c9a35c" fontFamily="monospace" opacity="0.8">optical cache: ENDS MID-BEAT ▾</text>
        <path d="M330 150 l10 -4 l8 8 l9 -40 l7 54" stroke="#c9a35c" strokeWidth="2" fill="none"/>
        <text x="360" y="176" fontSize="12" fill="#8a744a" fontFamily="monospace">no data</text>
      </g>

      <text x="44" y="462" fontSize="11" fill="#5c6b64" fontFamily="monospace">sync agent v4.4 · hourly polls · local cache retained · gap reported to ARIA service 08:02</text>
    </svg>
  );
}

export function PhotoOldCern() {
  //DONE
  // Vintage CERN 2003 — warmth, wrong-path reward
  return (
    <svg viewBox="0 0 800 566" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="566" fill="#8a8378"/>
      <rect width="800" height="566" fill="url(#sep)" />
      <defs><linearGradient id="sep" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9a35c" stopOpacity="0.25"/><stop offset="100%" stopColor="#4a5aa0" stopOpacity="0.12"/>
      </linearGradient></defs>
      {/* building */}
      <rect x="60" y="120" width="680" height="240" fill="#a89f8e"/>
      <rect x="60" y="120" width="680" height="16" fill="#8d8577"/>
      {[...Array(12)].map((_,i)=>(<rect key={i} x={84+i*54} y="156" width="34" height="60" fill="#5d6a72"/>))}
      <text x="400" y="250" textAnchor="middle" fontSize="30" fontFamily="monospace" fill="#6d6455" letterSpacing="8">MEYRIN SITE</text>
      {/* crew posing */}
      {[130,235,340,445,550,660].map((x,i)=>(
        <g key={i} transform={`translate(${x} 360)`}>
          <path d="M-22 120 C-24 60 -16 30 0 28 C16 30 24 60 22 120 Z" fill={["#7a6a52","#5d6a72","#6d5a4a","#4a5a68","#75665a","#5a4f43"][i]}/>
          <circle cy="12" r="16" fill={["#caa287","#8a6248","#d8b090","#b98c68","#c9a184","#a87e5e"][i]}/>
          {i===1 && <path d="M-14 6 a14 14 0 0 1 28 0 l0 -8 a16 12 0 0 0 -28 0z" fill="#3a2f24"/>}
        </g>
      ))}
      <rect x="0" y="480" width="800" height="86" fill="#f0ead8"/>
      <text x="24" y="516" fontSize="16" fontFamily="'Courier New',monospace" fill="#5d5343">TRIGGER-COUNTER CREW · AUG 2003 · someone wrote "very small hole,</text>
      <text x="24" y="540" fontSize="16" fontFamily="'Courier New',monospace" fill="#5d5343">very large argument" on the board and we laughed until it hurt</text>
      <text x="776" y="40" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#f5efdf" opacity="0.9">KODAK · scanned '19</text>
    </svg>
  );
}

export function PhotoSarahDefense() {
  //DONE
  // The good day
  return (
    <svg viewBox="0 0 800 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="600" fill="#4a4440"/>
      <rect x="0" y="0" width="800" height="380" fill="#57514b"/>
      {/* banner */}
      <rect x="180" y="60" width="440" height="70" rx="6" fill="#7a2e2e"/>
      <text x="400" y="106" textAnchor="middle" fontSize="30" fontFamily="monospace" fill="#f0e6d8" letterSpacing="4">CONGRATS DR. OKAFOR!</text>
      {/* two figures with cake */}
      <g transform="translate(280 220)">
        <path d="M-30 260 C-34 120 -24 60 0 56 C24 60 34 120 30 260 Z" fill="#5d4a63"/>
        <circle cy="30" r="26" fill="#8a6248"/>
        <path d="M-26 22 a26 26 0 0 1 52 0 l0 -14 a28 20 0 0 0 -52 0 z" fill="#241d18"/>
        <circle cx="-9" cy="26" r="2" fill="#1a120c"/><circle cx="9" cy="26" r="2" fill="#1a120c"/>
        <path d="M-8 40 q8 6 16 0" stroke="#3a2218" strokeWidth="2" fill="none"/>
      </g>
      <g transform="translate(470 240)">
        <path d="M-28 240 C-32 110 -22 56 0 52 C22 56 32 110 28 240 Z" fill="#3f464d"/>
        <circle cy="26" r="24" fill="#c9a184"/>
        <path d="M-24 18 a24 24 0 0 1 48 0 l0 -12 a26 18 0 0 0 -48 0 z" fill="#d8d3ca"/>
        <circle cx="-8" cy="22" r="2" fill="#241a12"/><circle cx="8" cy="22" r="2" fill="#241a12"/>
        <path d="M-7 36 q7 5 14 0" stroke="#4a2c1c" strokeWidth="2" fill="none"/>
      </g>
      {/* cake table */}
      <rect x="0" y="500" width="800" height="100" fill="#33291f"/>
      <g transform="translate(360 430)">
        <rect width="90" height="46" rx="4" fill="#e8dcc8"/>
        <rect y="-8" width="90" height="10" rx="3" fill="#c9a35c"/>
        <line x1="45" y1="-8" x2="45" y2="-26" stroke="#7a2e2e" strokeWidth="3"/>
        <circle cx="45" cy="-28" r="3" fill="#ffb84a"/>
      </g>
      <radialGradient id="p8_vig" cx="50%" cy="46%" r="75%"><stop offset="62%" stopColor="#000" stopOpacity="0"/><stop offset="100%" stopColor="#000" stopOpacity="0.4"/></radialGradient>
      <rect width="800" height="600" fill="url(#p8_vig)"/>
      <text x="792" y="592" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#f0ead8" opacity="0.9">17:05 25-11-20</text>
    </svg>
  );
}

export function PhotoBadgeScan() {
  //DONE
  // Visitor badge photographed through glass
  return (
    <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="500" fill="#20262a"/>
      {/* glass glare diagonal */}
      <polygon points="0,0 300,0 100,500 0,500" fill="#ffffff" opacity="0.06"/>
      <polygon points="330,0 400,0 200,500 140,500" fill="#ffffff" opacity="0.05"/>
      {/* badge */}
      <g transform="translate(200 70) rotate(-1)">
        <rect width="400" height="300" rx="8" fill="#dde2e4"/>
        <rect width="400" height="56" rx="8" fill="#2e3a42"/>
        <text x="200" y="36" textAnchor="middle" fontSize="20" fontFamily="monospace" fill="#dfe8ec" letterSpacing="4">KESTREL INSTITUTE</text>
        {/* bird mark */}
        <path d="M46 28 l10 -12 l4 6 l8 -10 l-2 12 z" fill="#9fb3ba"/>
        <text x="60" y="120" fontSize="15" fill="#5a6870" fontFamily="monospace">VISITOR — ESCORT REQUIRED</text>
        <text x="60" y="170" fontSize="30" fill="#20282e" fontFamily="monospace" letterSpacing="2">M. HALDANE</text>
        <text x="60" y="204" fontSize="15" fill="#5a6870" fontFamily="monospace">DIRECTORATE LIAISON · APPLIED PROGRAMS</text>
        {/* barcode */}
        {[...Array(26)].map((_,i)=>(<rect key={i} x={60+i*11} y={236} width={i%3?2:4} height="44" fill="#20282e"/>))}
        {/* lanyard clip */}
        <rect x="180" y="-26" width="40" height="30" fill="none" stroke="#8b9298" strokeWidth="4"/>
        <line x1="200" y1="-60" x2="200" y2="-26" stroke="#3a4248" strokeWidth="6"/>
      </g>
      <text x="24" y="480" fontSize="12" fontFamily="monospace" fill="#7a868c">scan of badge photographed through institute glass — D.M. 03-02 · clip matches reversed lanyard in DSC04821</text>
    </svg>
  );
}

export function PhotoBrassPlate() {
  //DONE
  // Brass plate: LANTERN · [worn] · ECHO
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="450" fill="#241f18"/>
      <g transform="translate(100 120)">
        <rect width="600" height="210" rx="8" fill="#8a7440" stroke="#6d5a2e" strokeWidth="6"/>
        <rect x="14" y="14" width="572" height="182" rx="5" fill="none" stroke="#a8935a" strokeWidth="2"/>
        <text x="110" y="122" fontSize="40" fontFamily="'Times New Roman',serif" fill="#3a2f16" letterSpacing="4">LANTERN</text>
        {/* middle word worn to illegibility */}
        <text x="300" y="122" textAnchor="middle" fontSize="40" fontFamily="'Times New Roman',serif" fill="#3a2f16" opacity="0.16" letterSpacing="4">??????</text>
        <g opacity="0.35">
          <ellipse cx="300" cy="108" rx="86" ry="30" fill="#8a7440"/>
          <path d="M225 100 q75 -18 150 0" stroke="#6d5a2e" strokeWidth="3" fill="none" opacity="0.5"/>
        </g>
        <text x="492" y="122" fontSize="40" fontFamily="'Times New Roman',serif" fill="#3a2f16" letterSpacing="4">ECHO</text>
        <text x="300" y="178" textAnchor="middle" fontSize="14" fontFamily="serif" fill="#4a3c1c" letterSpacing="6" opacity="0.7">· IN ORDER · ALWAYS IN ORDER ·</text>
      </g>
      <text x="24" y="428" fontSize="12" fontFamily="monospace" fill="#7a6a4a">brass plate above study door — middle slot worn smooth. he touched it every morning.</text>
    </svg>
  );
}

export function PhotoCampusMap() {
  //DONE
  // Hand-annotated campus map
  return (
    <svg viewBox="0 0 800 566" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="566" fill="#e8e4d8"/>
      {/* streets */}
      <g stroke="#c9c2ae" strokeWidth="14">
        <line x1="0" y1="140" x2="800" y2="120"/>
        <line x1="0" y1="300" x2="800" y2="290"/>
        <line x1="0" y1="450" x2="800" y2="440"/>
        <line x1="180" y1="0" x2="200" y2="566"/>
        <line x1="480" y1="0" x2="470" y2="566"/>
        <line x1="680" y1="0" x2="690" y2="566"/>
      </g>
      <g stroke="#b3ac96" strokeWidth="2" fill="none">
        <path d="M0 220 Q400 205 800 215"/>
      </g>
      {/* buildings */}
      <g fill="#b3ab97" stroke="#8f8873" strokeWidth="2">
        <rect x="220" y="160" width="110" height="80"/>
        <rect x="360" y="170" width="90" height="60"/>
        <rect x="240" y="320" width="120" height="90"/>
        <rect x="500" y="320" width="140" height="70"/>
        <rect x="510" y="160" width="120" height="80"/>
        <rect x="720" y="310" width="60" height="80"/>
      </g>
      <g fontFamily="monospace" fontSize="13" fill="#6d6753">
        <text x="228" y="205">DAVID RITTENHOUSE LAB</text>
        <text x="366" y="205">SKIMMER LOT</text>
        <text x="250" y="370">OBSERVATORY DOME</text>
        <text x="512" y="360">FLOWER WALK</text>
      </g>
      {/* THE ANNOTATION — circle two blocks east */}
      <g>
        <ellipse cx="575" cy="200" rx="86" ry="56" fill="none" stroke="#a02020" strokeWidth="4"/>
        <text x="575" y="196" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#a02020" fontFamily="monospace">KESTREL</text>
        <text x="575" y="216" textAnchor="middle" fontSize="12" fill="#a02020" fontFamily="monospace">leased suite 4F</text>
        <text x="575" y="234" textAnchor="middle" fontSize="12" fill="#a02020" fontFamily="'Segoe Script',cursive">WHO PAYS??</text>
        <line x1="330" y1="200" x2="487" y2="200" stroke="#a02020" strokeWidth="2" strokeDasharray="8 5"/>
        <text x="392" y="188" fontSize="12" fill="#a02020" fontFamily="monospace">two blocks. TWO.</text>
      </g>
      {/* compass + note */}
      <g transform="translate(60 470)" fontFamily="'Segoe Script',cursive" fill="#4a4436">
        <text fontSize="16">he watched the colloquium from the back for a month before introducing himself.</text>
      </g>
      <text x="792" y="552" textAnchor="end" fontSize="13" fontFamily="monospace" fill="#8f8873">annotated 03-04</text>
    </svg>
  );
}
