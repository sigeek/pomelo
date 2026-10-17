// Café storefront illustration from the team's Paper prototype ("01 · Welcome").
export function Storefront({ name }: { name: string }) {
  const ink = "#5C2D2B";
  const line = { stroke: ink, strokeWidth: 3.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 390 420" className="block w-full" role="img" aria-label="A small café with an open sign">
      <g opacity="0.9">
        <path d="M40 60a16 16 0 0 1 30-6 12 12 0 0 1 18 10H34a10 10 0 0 1 6-4z" fill="#FFFFFF" />
        <path d="M290 40a16 16 0 0 1 30-6 12 12 0 0 1 18 10h-54a10 10 0 0 1 6-4z" fill="#FFFFFF" />
      </g>
      <g>
        <rect x="34" y="96" width="322" height="324" fill="#F6DFA2" {...line} />
        <rect x="96" y="104" width="198" height="46" rx="10" fill="#FFF9EE" {...line} />
        <path d="M26 166h338l-16 44H42z" fill="#FFF9EE" {...line} />
        <path d="M26 166h48l-6 44H42zM122 166h48l-2 44h-44zM218 166h48l2 44h-44zM314 166h50l-16 44h-26z" fill="#B9C98B" {...line} />
        <path d="M42 210q13 12 26 0q14 12 28 0q14 12 28 0q14 12 28 0q14 12 28 0q14 12 28 0q14 12 28 0q14 12 28 0q14 12 28 0q13 12 26 0" fill="#FFF9EE" {...line} />
        <rect x="56" y="240" width="120" height="110" rx="8" fill="#DDF0F4" {...line} />
        <path d="M116 240v110M56 296h120" {...line} strokeWidth={3} />
        <rect x="214" y="236" width="104" height="184" rx="10" fill="#BC8559" {...line} />
        <rect x="228" y="252" width="76" height="76" rx="6" fill="#DDF0F4" {...line} />
        <circle cx="296" cy="352" r="5" fill="#F2B33D" {...line} />
        <rect x="50" y="350" width="132" height="14" rx="4" fill="#BC8559" {...line} />
        <path d="M66 350c-4-14 4-26 12-28 0 10 2 18-4 28zM98 350c0-16 10-26 18-26-2 12-6 20-12 26zM140 350c-6-12 0-24 8-26 2 10 2 18-2 26z" fill="#7F9455" {...line} />
        <circle cx="84" cy="336" r="5" fill="#E8706B" {...line} />
        <circle cx="128" cy="332" r="5" fill="#F2B33D" {...line} />
        <circle cx="160" cy="338" r="5" fill="#E8706B" {...line} />
      </g>
      <g transform="translate(234 258) scale(0.5)">
        <path d="M60 22V10" stroke={ink} strokeWidth="6" strokeLinecap="round" />
        <circle cx="60" cy="8" r="7" fill="#F2B33D" stroke={ink} strokeWidth="6" />
        <rect x="16" y="22" width="88" height="66" rx="26" fill="#FFF9EE" stroke={ink} strokeWidth="6" />
        <rect x="28" y="34" width="64" height="42" rx="15" fill={ink} stroke={ink} strokeWidth="6" />
        <circle cx="48" cy="52" r="6" fill="#9BE6C6" />
        <circle cx="72" cy="52" r="6" fill="#9BE6C6" />
        <path d="M50 62q10 9 20 0" fill="none" stroke="#9BE6C6" strokeWidth="5" strokeLinecap="round" />
      </g>
      <text x="195" y="135" textAnchor="middle" fontFamily="var(--font-itim)" fontSize="24" fill={ink}>
        {name}
      </text>
      <g transform="rotate(-8 330 286)">
        <rect x="300" y="268" width="62" height="34" rx="6" fill="#FFF9EE" stroke={ink} strokeWidth="3" />
        <text x="331" y="291" textAnchor="middle" fontFamily="var(--font-itim)" fontSize="17" fill="#2F7A4A">
          OPEN
        </text>
      </g>
    </svg>
  );
}
