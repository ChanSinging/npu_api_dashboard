export default function HeroGauge({ rate, rawRate }) {
  const size = 260, cx = size / 2, cy = size / 2 + 14, r = 96, tk = 14;
  const arcPath = (startDeg, endDeg, rr) => {
    const s = (startDeg - 90) * Math.PI / 180;
    const e = (endDeg - 90) * Math.PI / 180;
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${cx + rr * Math.cos(s)} ${cy + rr * Math.sin(s)} A ${rr} ${rr} 0 ${large} 1 ${cx + rr * Math.cos(e)} ${cy + rr * Math.sin(e)}`;
  };
  const fillDeg    = -180 + rate    * 180;
  const rawFillDeg = -180 + rawRate * 180;
  return (
    <svg viewBox={`0 0 ${size} ${size * 0.7}`} style={{ width: '100%', maxWidth: 360, height: 'auto' }}>
      <path d={arcPath(-180, 0, r)} fill="none" stroke="var(--bg-2)" strokeWidth={tk} strokeLinecap="round" />
      <path d={arcPath(-180, rawFillDeg, r - tk - 3)} fill="none" stroke="var(--fg-3)" strokeWidth="2" strokeDasharray="2 2" />
      <path d={arcPath(-180, fillDeg, r)} fill="none" stroke="var(--npu)" strokeWidth={tk} strokeLinecap="round" />
      {Array.from({ length: 11 }).map((_, i) => {
        const deg = -180 + i * 18;
        const a = (deg - 90) * Math.PI / 180;
        const r1 = r + tk / 2 + 2, r2 = r + tk / 2 + (i % 5 === 0 ? 8 : 4);
        return <line key={i} x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)} x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)} stroke="var(--line-hard)" strokeWidth="0.8" />;
      })}
      {[0, 25, 50, 75, 100].map(v => {
        const deg = -180 + (v / 100) * 180;
        const a = (deg - 90) * Math.PI / 180;
        const rr = r + tk / 2 + 18;
        return <text key={v} x={cx + rr * Math.cos(a)} y={cy + rr * Math.sin(a) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-3)" textAnchor="middle">{v}</text>;
      })}
      <text x={cx} y={cy - 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="54" fontWeight="500" fill="var(--fg)" style={{ letterSpacing: '-0.04em' }}>
        {(rate * 100).toFixed(1)}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--fg-3)">
        % 加权对齐率
      </text>
    </svg>
  );
}
