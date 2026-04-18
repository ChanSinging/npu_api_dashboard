import { useState } from 'react';
import { MODULES, DIMENSIONS, STATUS_META, moduleRate } from '../data';

export default function PixelMatrix({ apis, onFocus }) {
  const [tip, setTip] = useState(null);
  return (
    <div onMouseLeave={() => setTip(null)}>
      {MODULES.map(mod => {
        const list = apis.filter(a => a.module === mod.key);
        const r = moduleRate(apis, mod.key);
        return (
          <div key={mod.key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 54px', gap: 10, alignItems: 'center', padding: '4px 0', borderBottom: '1px dashed var(--line-soft)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right', color: 'var(--fg-2)', paddingRight: 8 }}>
              <b style={{ color: 'var(--fg)', fontWeight: 500 }}>{mod.name}</b>
              <div style={{ color: 'var(--fg-4)', fontSize: 10 }}>{list.length} API</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, minWidth: 0 }}>
              {list.map(a => (
                <div key={a.name} className="pxmat-quad" style={{ width: 14, height: 14 }}
                  onClick={() => onFocus && onFocus(a)}
                  onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, api: a })}
                  onMouseMove={e => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}>
                  <span className={a.dims.func} />
                  <span className={a.dims.prec} />
                  <span className={a.dims.mem} />
                  <span className={a.dims.det} />
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {(r.rate * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}
      {tip && (
        <div className="tip" style={{ left: tip.x + 16, top: tip.y + 16 }}>
          <div className="head">{tip.api.name}</div>
          <div className="row"><span>等级 · 频次</span><b>{tip.api.level} · {tip.api.freq.toLocaleString()}</b></div>
          {DIMENSIONS.map(d => (
            <div key={d.key} className="row">
              <span>{d.name}</span>
              <b style={{ color: `var(--s-${tip.api.dims[d.key]})` }}>{STATUS_META[tip.api.dims[d.key]].label}</b>
            </div>
          ))}
          <div className="row" style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid oklch(0.4 0.01 260)' }}>
            <span>用例</span><b>{tip.api.casePass}/{tip.api.caseTotal}</b>
          </div>
        </div>
      )}
    </div>
  );
}
