import { VELOCITY } from '../data';

export default function VelocityBars() {
  const w = 360, h = 80, pad = { t: 10, r: 6, b: 18, l: 6 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const barW = iw / VELOCITY.length - 2;
  const allVals = VELOCITY.flatMap(v => [v.aligned, -Math.abs(v.fixing), v.reviewed]);
  const maxAbs = Math.max(...allVals.map(Math.abs));
  const y0 = pad.t + ih / 2;
  const scale = v => (v / maxAbs) * (ih / 2);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      <line x1={pad.l} x2={w - pad.r} y1={y0} y2={y0} stroke="var(--line-hard)" />
      {VELOCITY.map((v, i) => {
        const x = pad.l + i * (iw / VELOCITY.length);
        const alignedH  = scale(v.aligned);
        const reviewedH = scale(v.reviewed);
        const fixingH   = scale(Math.abs(v.fixing));
        return (
          <g key={i}>
            <rect x={x} y={y0 - alignedH - reviewedH} width={barW} height={alignedH}  fill="var(--s-aligned)" />
            <rect x={x} y={y0 - reviewedH}            width={barW} height={reviewedH} fill="var(--s-reviewed)" />
            <rect x={x} y={y0}                        width={barW} height={fixingH}   fill="var(--s-fixing)" />
            {i % 2 === 0 && <text x={x + barW / 2} y={h - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--fg-4)">W{i + 1}</text>}
          </g>
        );
      })}
    </svg>
  );
}
