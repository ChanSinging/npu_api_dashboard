import { useMemo } from 'react';

export default function Spark({ data, color = 'var(--fg)', height = 20, showArea, refLine }) {
  const w = 160, h = height, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

  const areaD = useMemo(() => {
    if (!showArea) return null;
    const base = h - pad;
    return `${lineD} L ${pts[pts.length - 1][0].toFixed(2)} ${base} L ${pts[0][0].toFixed(2)} ${base} Z`;
  }, [showArea, lineD, pts, h, pad]);

  const gradId = useMemo(() => `sg-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }}>
      {showArea && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
      )}
      {refLine !== undefined && (
        <line x1={0} x2={w}
          y1={pad + (1 - (refLine - min) / span) * (h - pad * 2)}
          y2={pad + (1 - (refLine - min) / span) * (h - pad * 2)}
          stroke="var(--line)" strokeDasharray="1.5 1.5" />
      )}
      {showArea && areaD && <path d={areaD} fill={`url(#${gradId})`} />}
      <path d={lineD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4.5" fill={color} opacity="0.2" />
    </svg>
  );
}
