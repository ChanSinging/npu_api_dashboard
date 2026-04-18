import { useState } from 'react';
import { DIMENSIONS } from '../data';

export default function ImpactScatter({ apis, onFocus }) {
  const w = 760, h = 260, pad = { t: 16, r: 24, b: 28, l: 42 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const xMin = 2, xMax = 7;
  const xScale = v => pad.l + ((v - xMin) / (xMax - xMin)) * iw;
  const yScale = v => pad.t + (1 - v) * ih;
  const points = apis.map(a => {
    const ok = DIMENSIONS.filter(d => a.dims[d.key] === 'aligned' || a.dims[d.key] === 'reviewed').length;
    return { a, y: ok / 4, x: Math.log10(Math.max(1, a.freq)) };
  });
  const danger = points.filter(p => p.x > 5.5 && p.y < 0.5);
  const [hv, setHv] = useState(null);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      <rect x={xScale(5.5)} y={yScale(0.5)} width={xScale(xMax) - xScale(5.5)} height={yScale(0) - yScale(0.5)} fill="var(--s-fixing-dim)" />
      <text x={xScale(5.5) + 6} y={yScale(0) - 6} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--s-fixing)" fontWeight="600">
        ⚠ 高频 · 对齐差 ({danger.length})
      </text>
      {[0, 0.25, 0.5, 0.75, 1].map(v => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={yScale(v)} y2={yScale(v)} stroke="var(--line-soft)" strokeDasharray="1 2" />
          <text x={pad.l - 6} y={yScale(v) + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-4)">{(v * 100).toFixed(0)}%</text>
        </g>
      ))}
      {[2, 3, 4, 5, 6, 7].map(v => (
        <g key={v}>
          <line x1={xScale(v)} x2={xScale(v)} y1={pad.t} y2={h - pad.b} stroke="var(--line-soft)" strokeDasharray="1 2" />
          <text x={xScale(v)} y={h - pad.b + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-4)">10^{v}</text>
        </g>
      ))}
      <text x={pad.l} y={pad.t - 4} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-3)">↑ 单 API 对齐度</text>
      <text x={w - pad.r} y={h - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-3)">调用频次 →</text>
      {points.map(p => {
        const lvlColor = p.a.level === 'L0' ? 'var(--npu)' : p.a.level === 'L1' ? 'var(--fg-2)' : 'var(--fg-3)';
        const opacity  = p.a.level === 'L0' ? 1 : p.a.level === 'L1' ? 0.7 : 0.4;
        const r        = p.a.level === 'L0' ? 3.2 : 2.2;
        return (
          <circle key={p.a.name} cx={xScale(p.x)} cy={yScale(p.y)} r={r}
            fill={lvlColor} opacity={opacity}
            onMouseEnter={e => setHv({ x: e.clientX, y: e.clientY, p })}
            onMouseLeave={() => setHv(null)}
            onClick={() => onFocus && onFocus(p.a)}
            style={{ cursor: 'pointer' }} />
        );
      })}
      <g transform={`translate(${pad.l + 8} ${pad.t + 8})`}>
        <circle cx={0}  cy={0} r={3.2} fill="var(--npu)" />
        <text x={8}  y={3} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-2)">L0</text>
        <circle cx={34} cy={0} r={2.2} fill="var(--fg-2)" opacity="0.7" />
        <text x={42} y={3} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-2)">L1</text>
        <circle cx={68} cy={0} r={2.2} fill="var(--fg-3)" opacity="0.4" />
        <text x={76} y={3} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-2)">L2</text>
      </g>
      {hv && (
        <foreignObject
          x={Math.min(hv.p.x, xMax - 0.3) !== hv.p.x ? xScale(hv.p.x) - 180 : xScale(hv.p.x) + 8}
          y={yScale(hv.p.y) - 10} width="180" height="60" style={{ pointerEvents: 'none' }}>
          <div className="tip" style={{ position: 'static' }}>
            <div className="head">{hv.p.a.name}</div>
            <div className="row"><span>对齐</span><b>{(hv.p.y * 100).toFixed(0)}% ({DIMENSIONS.filter(d => hv.p.a.dims[d.key] === 'aligned' || hv.p.a.dims[d.key] === 'reviewed').length}/4)</b></div>
            <div className="row"><span>频次</span><b>{hv.p.a.freq.toLocaleString()}</b></div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
