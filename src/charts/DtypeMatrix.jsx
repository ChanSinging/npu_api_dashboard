import { useState, Fragment } from 'react';
import { DTYPES, DTYPE_MATRIX } from '../data';

const cellBg = v => v >= 0.85 ? 'var(--s-aligned)' : v >= 0.65 ? 'var(--s-reviewed)' : v >= 0.40 ? 'oklch(0.68 0.16 55)' : 'var(--s-fixing)';

export default function DtypeMatrix() {
  const [tip, setTip] = useState(null);
  return (
    <div onMouseLeave={() => setTip(null)}>
      <div style={{ display: 'grid', gridTemplateColumns: `70px repeat(${DTYPES.length}, 1fr)`, gap: 2, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
        <div />
        {DTYPES.map(dt => <div key={dt} style={{ textAlign: 'center', color: 'var(--fg-3)', padding: '2px 0' }}>{dt}</div>)}
        {DTYPE_MATRIX.map(row => (
          <Fragment key={row.dim.key}>
            <div style={{ color: 'var(--fg-2)', padding: '6px 4px 6px 0', textAlign: 'right' }}>{row.dim.name}</div>
            {DTYPES.map(dt => {
              const v = row.cells[dt];
              return (
                <div key={dt}
                  onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, dim: row.dim.name, dt, v })}
                  onMouseMove={e => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                  style={{ background: cellBg(v), color: 'var(--panel)', padding: '6px 0', textAlign: 'center', fontSize: 10, fontWeight: 500, cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
                  {(v * 100).toFixed(0)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      {tip && (
        <div className="tip" style={{ left: tip.x + 14, top: tip.y + 14 }}>
          <div className="head">{tip.dim} · {tip.dt}</div>
          <div className="row"><span>对齐率</span><b>{(tip.v * 100).toFixed(1)}%</b></div>
        </div>
      )}
    </div>
  );
}
