import { MODULES } from '../data';

const color = r => r > 0.85 ? 'var(--s-aligned)' : r > 0.65 ? 'var(--s-reviewed)' : r > 0.4 ? 'oklch(0.68 0.16 55)' : 'var(--s-fixing)';

export default function ModuleDimHeat({ dimKey, apis }) {
  const rows = MODULES.map(m => {
    const sub = apis.filter(a => a.module === m.key);
    const aligned = sub.filter(a => a.dims[dimKey] === 'aligned' || a.dims[dimKey] === 'reviewed').length;
    return { mod: m, rate: sub.length ? aligned / sub.length : 0 };
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 9 }}>
      {rows.map(r => (
        <div key={r.mod.key} style={{ display: 'grid', gridTemplateColumns: '1fr 24px', gap: 4, alignItems: 'center' }}>
          <div style={{ height: 8, background: 'var(--bg-1)', border: '1px solid var(--line-soft)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${r.rate * 100}%`, background: color(r.rate) }} />
          </div>
          <div style={{ color: 'var(--fg-3)', fontSize: 9, textAlign: 'right' }}>{(r.rate * 100).toFixed(0)}</div>
        </div>
      ))}
    </div>
  );
}
