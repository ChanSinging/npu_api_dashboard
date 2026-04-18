import { DIMENSIONS, STATUS_META } from '../data';

export default function FocusCard({ focus, onClose }) {
  if (!focus?.name) return null;
  return (
    <div className="focus-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {focus.module} · {focus.level} · {focus.freq?.toLocaleString()} calls
          </div>
          <div className="mono" style={{ fontSize: 13.5, color: 'var(--fg)', marginTop: 3, fontWeight: 500 }}>
            {focus.name}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 0, color: 'var(--fg-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginTop: 12, background: 'var(--line-soft)', border: '1px solid var(--line-soft)' }}>
        {DIMENSIONS.map(d => (
          <div key={d.key} style={{ background: 'var(--panel)', padding: '7px 8px' }}>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)' }}>{d.name}</div>
            <div className="mono" style={{ fontSize: 10.5, marginTop: 3, color: `var(--s-${focus.dims[d.key]})` }}>
              ● {STATUS_META[focus.dims[d.key]].short}
            </div>
          </div>
        ))}
      </div>
      <div className="mono" style={{ marginTop: 10, fontSize: 11, color: 'var(--fg-3)' }}>
        用例 <b style={{ color: 'var(--fg)' }}>{focus.casePass}/{focus.caseTotal}</b> · 更新 {focus.updatedAt} by {focus.updatedBy}
      </div>
      <a href="#" style={{ display: 'block', marginTop: 12, textAlign: 'center', padding: '6px 0', background: 'var(--fg)', color: 'var(--bg)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, borderRadius: 2 }}>
        → 查看详情页
      </a>
    </div>
  );
}
