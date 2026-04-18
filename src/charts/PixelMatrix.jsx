import { useState } from 'react';
import { MODULES, DIMENSIONS, STATUS_META, moduleRate } from '../data';

function apiColor(api) {
  const dims = Object.values(api.dims);
  if (dims.every(d => d === 'untested')) return 'untested';
  if (dims.some(d => d === 'fixing')) return 'fixing';
  if (dims.every(d => d === 'aligned' || d === 'reviewed')) return 'aligned';
  return 'partial';
}

const COLOR_MAP = {
  aligned: 'var(--s-aligned)',
  partial: 'var(--s-reviewed)',
  fixing: 'var(--s-fixing)',
  untested: 'var(--s-untested)',
};

const LABEL_MAP = {
  aligned: '完全对齐',
  partial: '部分对齐',
  fixing: '待修复',
  untested: '未测试',
};

export default function PixelMatrix({ apis, onFocus }) {
  const [tip, setTip] = useState(null);
  return (
    <div onMouseLeave={() => setTip(null)}>
      {MODULES.map(mod => {
        const list = apis.filter(a => a.module === mod.key);
        const r = moduleRate(apis, mod.key);
        return (
          <div key={mod.key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 54px', gap: 10, alignItems: 'center', padding: '3px 0', borderBottom: '1px dashed var(--line-soft)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right', color: 'var(--fg-2)', paddingRight: 8 }}>
              <b style={{ color: 'var(--fg)', fontWeight: 500 }}>{mod.name}</b>
              <div style={{ color: 'var(--fg-4)', fontSize: 10 }}>{list.length} API</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, minWidth: 0 }}>
              {list.map(a => {
                const c = apiColor(a);
                return (
                  <div key={a.name}
                    style={{ width: 7, height: 7, background: COLOR_MAP[c], borderRadius: 1, cursor: 'pointer', flexShrink: 0, border: c === 'untested' ? '0.5px solid var(--line)' : 'none' }}
                    onClick={() => onFocus && onFocus(a)}
                    onMouseEnter={e => setTip({ x: e.clientX, y: e.clientY, api: a, color: c })}
                    onMouseMove={e => setTip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                  />
                );
              })}
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
          <div className="row"><span>状态</span><b style={{ color: COLOR_MAP[tip.color] }}>{LABEL_MAP[tip.color]}</b></div>
          <div className="row"><span>等级 · 频次</span><b>{tip.api.level} · {tip.api.freq.toLocaleString()}</b></div>
          {DIMENSIONS.map(d => (
            <div key={d.key} className="row">
              <span>{d.name}</span>
              <b style={{ color: `var(--s-${tip.api.dims[d.key]})` }}>{STATUS_META[tip.api.dims[d.key]]?.label || tip.api.dims[d.key]}</b>
            </div>
          ))}
          {tip.api.dts?.length > 0 && (
            <div className="row"><span>DTS</span><b style={{ color: 'var(--s-fixing)' }}>{tip.api.dts.join(', ')}</b></div>
          )}
          <div className="row" style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid oklch(0.4 0.01 260)' }}>
            <span>用例</span><b>{tip.api.casePass}/{tip.api.caseTotal}</b>
          </div>
        </div>
      )}
    </div>
  );
}
