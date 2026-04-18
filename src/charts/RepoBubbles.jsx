const color = r => r >= 0.95 ? 'var(--s-aligned)' : r >= 0.85 ? 'oklch(0.7 0.15 110)' : r >= 0.75 ? 'var(--s-reviewed)' : r >= 0.6 ? 'oklch(0.65 0.17 50)' : 'var(--s-fixing)';

export default function RepoBubbles({ repos, onFocus }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)' }}>
      {repos.map(r => {
        const [org, name] = r.name.split('/');
        return (
          <div key={r.name} onClick={() => onFocus && onFocus(r)}
            style={{ background: 'var(--panel)', padding: '14px 12px', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 112 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: 3, width: `${r.rate * 100}%`, background: color(r.rate) }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 3,
                background: `conic-gradient(from 0deg, ${'oklch(0.55 0.15 ' + ((name.charCodeAt(0) * 7) % 360) + ')'}, ${'oklch(0.65 0.15 ' + ((name.charCodeAt(1) * 11) % 360) + ')'})`,
                display: 'grid', placeItems: 'center',
                color: 'white', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              }}>{name[0].toUpperCase()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', fontWeight: 500, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: color(r.rate), letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {(r.rate * 100).toFixed(0)}<span style={{ fontSize: 10, color: 'var(--fg-3)' }}>%</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--fg-3)', marginLeft: 'auto' }}>★{r.stars}</div>
            </div>
            <div style={{ display: 'flex', gap: 1, marginTop: 6, height: 6 }}>
              <div style={{ flex: r.apiAligned, background: color(r.rate) }} />
              <div style={{ flex: r.missing, background: 'var(--s-fixing-dim)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-3)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>可用 <b style={{ color: 'var(--fg)', fontWeight: 500 }}>{r.apiAligned}</b></span>
              <span>阻塞 <b style={{ color: r.missing > 20 ? 'var(--s-fixing)' : 'var(--fg)', fontWeight: 500 }}>{r.missing}</b></span>
              <span>/{r.apiUsed}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
