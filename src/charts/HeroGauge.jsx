export default function HeroGauge({ stats, label }) {
  const size = 77, cx = size / 2, cy = size / 2, r = 29, tk = 6;
  const startDeg = 210, endDeg = 510, totalDeg = endDeg - startDeg;
  const { total, aligned, partial, fixing, untested } = stats;
  const rate = (aligned + partial) / total;

  const arcPath = (s, e, rr) => {
    const sa = (s - 90) * Math.PI / 180;
    const ea = (e - 90) * Math.PI / 180;
    const large = Math.abs(e - s) > 180 ? 1 : 0;
    return `M ${cx + rr * Math.cos(sa)} ${cy + rr * Math.sin(sa)} A ${rr} ${rr} 0 ${large} 1 ${cx + rr * Math.cos(ea)} ${cy + rr * Math.sin(ea)}`;
  };

  const segments = [
    { val: aligned, color: 'var(--s-aligned)' },
    { val: partial, color: 'var(--s-reviewed)' },
    { val: fixing, color: 'var(--s-fixing)' },
    { val: untested, color: 'var(--s-untested)' },
  ];

  let curDeg = startDeg;
  const segPaths = segments.map((seg, i) => {
    if (seg.val === 0) return null;
    const segDeg = (seg.val / total) * totalDeg;
    const path = arcPath(curDeg, curDeg + segDeg, r);
    curDeg += segDeg;
    return { path, color: seg.color, key: i };
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '70%', height: 'auto' }}>
        <path d={arcPath(startDeg, endDeg, r)} fill="none" stroke="var(--bg-2)" strokeWidth={tk} strokeLinecap="butt" />
        {segPaths.filter(Boolean).map(s => (
          <path key={s.key} d={s.path} fill="none" stroke={s.color} strokeWidth={tk} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fontWeight="500" fill="var(--fg)" style={{ letterSpacing: '-0.03em' }}>
          {(rate * 100).toFixed(2)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="var(--fg-3)">
          {label}
        </text>
      </svg>
      <div className="hero-ring-detail">
        <span style={{ color: 'var(--s-aligned)' }}>{aligned}</span>
        <span className="dim">·</span>
        <span style={{ color: 'var(--s-reviewed)' }}>{partial}</span>
        <span className="dim">·</span>
        <span style={{ color: 'var(--s-fixing)' }}>{fixing}</span>
        <span className="dim">·</span>
        <span style={{ color: 'var(--fg-4)' }}>{untested}</span>
        <span className="dim" style={{ marginLeft: 2 }}>/ {total}</span>
      </div>
    </div>
  );
}
