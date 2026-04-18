export default function MiniRadial({ rate, size = 54, color = 'var(--npu)' }) {
  const r = size / 2 - 6, c = size / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-2)" strokeWidth="5" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${circ * rate} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={c + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fontWeight="500" fill="var(--fg)">
        {(rate * 100).toFixed(0)}
      </text>
      <text x={c} y={c + 13} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="var(--fg-3)">%</text>
    </svg>
  );
}
