export default function Spark({ data, color = 'var(--fg)', height = 20, refLine }) {
  const w = 160, h = height, pad = 1;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * (w - pad * 2),
    pad + (1 - (v - min) / span) * (h - pad * 2),
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, display: 'block' }}>
      {refLine !== undefined && (
        <line x1={0} x2={w}
          y1={pad + (1 - (refLine - min) / span) * (h - pad * 2)}
          y2={pad + (1 - (refLine - min) / span) * (h - pad * 2)}
          stroke="var(--line)" strokeDasharray="1.5 1.5" />
      )}
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="1.8" fill={color} />
    </svg>
  );
}
