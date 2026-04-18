import { useState, useRef } from 'react';

export default function DualTrend({ data }) {
  const w = 800, h = 150, pad = { t: 8, r: 60, b: 20, l: 6 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const min = 0.45, max = 0.95;
  const x = i => pad.l + (i / (data.length - 1)) * iw;
  const y = v => pad.t + (1 - (v - min) / (max - min)) * ih;
  const rawD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.rate).toFixed(1)}`).join(' ');
  const wD   = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.weighted).toFixed(1)}`).join(' ');
  const [hv, setHv] = useState(null);
  const ref = useRef(null);
  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width * w;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx - pad.l) / iw * (data.length - 1))));
    setHv(idx);
  };
  return (
    <svg ref={ref} viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h, cursor: 'crosshair' }}
      onMouseMove={onMove} onMouseLeave={() => setHv(null)}>
      {[0.5, 0.6, 0.7, 0.8, 0.9].map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--line-soft)" strokeDasharray="1 2" />
          <text x={w - pad.r + 4} y={y(t) + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-4)">{(t * 100).toFixed(0)}%</text>
        </g>
      ))}
      {[0, 7, 14, 21, 29].map(i => (
        <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-4)">
          {i === 29 ? '今天' : `-${29 - i}d`}
        </text>
      ))}
      <path d={wD} fill="none" stroke="var(--npu)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d={rawD} fill="none" stroke="var(--fg-3)" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={pad.l} x2={w - pad.r} y1={y(1.0)} y2={y(1.0)} stroke="var(--cuda)" strokeWidth="1.2" />
      <text x={w - pad.r - 4} y={y(1.0) - 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--cuda)">CUDA 基准 100%</text>
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].weighted)} r="3" fill="var(--npu)" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].rate)} r="2.5" fill="var(--fg-3)" />
      {hv !== null && (
        <g>
          <line x1={x(hv)} x2={x(hv)} y1={pad.t} y2={h - pad.b} stroke="var(--fg-3)" strokeDasharray="1 2" />
          <g transform={`translate(${Math.min(x(hv) + 6, w - 160)}, ${pad.t + 4})`}>
            <rect width="150" height="46" fill="var(--fg)" rx="2" />
            <text x="8" y="14" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--bg-1)">{29 - hv === 0 ? '今天' : `${29 - hv}天前`}</text>
            <text x="8" y="28" fontFamily="var(--font-mono)" fontSize="10" fill="oklch(0.85 0.15 45)">加权 {(data[hv].weighted * 100).toFixed(1)}%</text>
            <text x="8" y="41" fontFamily="var(--font-mono)" fontSize="10" fill="oklch(0.85 0 0)">平均 {(data[hv].rate * 100).toFixed(1)}%</text>
            <text x="142" y="41" fontFamily="var(--font-mono)" fontSize="9.5" fill="oklch(0.78 0.14 150)" textAnchor="end">+{data[hv].newlyAligned}</text>
          </g>
        </g>
      )}
    </svg>
  );
}
