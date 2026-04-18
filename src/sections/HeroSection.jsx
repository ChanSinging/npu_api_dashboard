import { useMemo } from 'react';
import { APIS, REPOS, TREND_30D, DIMENSIONS, overallAlignment, weightedAlignment } from '../data';
import { HeroGauge } from '../charts';

export default function HeroSection({ filtered }) {
  const ov = useMemo(() => overallAlignment(filtered), [filtered]);
  const wv = useMemo(() => weightedAlignment(filtered), [filtered]);

  const totalCases    = filtered.reduce((s, a) => s + a.caseTotal, 0);
  const passCases     = filtered.reduce((s, a) => s + a.casePass, 0);
  const fixingCount   = filtered.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'fixing').length, 0);
  const reviewedCount = filtered.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'reviewed').length, 0);
  const untestedCount = filtered.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'untested').length, 0);
  const l0            = filtered.filter(a => a.level === 'L0');
  const l0Aligned     = l0.filter(a => DIMENSIONS.every(d => a.dims[d.key] === 'aligned' || a.dims[d.key] === 'reviewed')).length;
  const denominator   = fixingCount + reviewedCount + untestedCount || 1;

  return (
    <section className="hero-solo">
      <div className="hero-solo-grid">
        <div className="hero-gauge">
          <HeroGauge rate={wv.rate} rawRate={ov.rate} />
          <div className="hero-gauge-legend">
            <span><span className="sw" style={{ background: 'var(--npu)' }} />加权 {(wv.rate * 100).toFixed(1)}%</span>
            <span><span className="sw" style={{ background: 'var(--fg-3)', border: '1px dashed var(--fg-3)' }} />平均 {(ov.rate * 100).toFixed(1)}%</span>
            <span><span className="sw" style={{ background: 'var(--s-aligned)' }} />30d +{((wv.rate - TREND_30D[0].weighted) * 100).toFixed(1)}pp</span>
          </div>
        </div>
        <div className="hero-main">
          <div className="hero-eyebrow">
            <span className="tag npu">torch_npu</span>
            <span className="mono dim">昇腾 910B · CANN 8.1.RC2 · torch 2.7.0</span>
            <span className="pill" style={{ marginLeft: 'auto' }}><span className="dot" />在线 · 日更</span>
          </div>
          <h1 className="hero-h1">PyTorch on NPU · API 一致性总览</h1>
          <p className="hero-lede">
            全量 <b>{APIS.length}</b> API · <b>{totalCases.toLocaleString()}</b> 用例 · 每日自动回归 · 覆盖 <b>{REPOS.length}</b> 个主流开源仓库
          </p>
          <div className="hero-kpi-row">
            <div className="kpi">
              <div className="kpi-k">L0 就绪</div>
              <div className="kpi-v">{l0Aligned}<span className="dim mono" style={{ fontSize: 14 }}>/{l0.length}</span></div>
              <div className="kpi-bar"><div style={{ width: `${l0Aligned / (l0.length || 1) * 100}%`, background: 'var(--npu)' }} /></div>
            </div>
            <div className="kpi">
              <div className="kpi-k">已评审接受</div>
              <div className="kpi-v" style={{ color: 'var(--s-reviewed)' }}>{reviewedCount}</div>
              <div className="kpi-bar"><div style={{ width: `${reviewedCount / denominator * 100}%`, background: 'var(--s-reviewed)' }} /></div>
            </div>
            <div className="kpi">
              <div className="kpi-k">待修复差异</div>
              <div className="kpi-v" style={{ color: 'var(--s-fixing)' }}>{fixingCount}</div>
              <div className="kpi-bar"><div style={{ width: `${fixingCount / denominator * 100}%`, background: 'var(--s-fixing)' }} /></div>
            </div>
            <div className="kpi">
              <div className="kpi-k">未测试</div>
              <div className="kpi-v dim">{untestedCount}</div>
              <div className="kpi-bar"><div style={{ width: `${untestedCount / denominator * 100}%`, background: 'var(--fg-4)' }} /></div>
            </div>
            <div className="kpi">
              <div className="kpi-k">用例通过</div>
              <div className="kpi-v">{(passCases / (totalCases || 1) * 100).toFixed(1)}<span style={{ fontSize: 12, color: 'var(--fg-3)' }}>%</span></div>
              <div className="kpi-bar"><div style={{ width: `${passCases / (totalCases || 1) * 100}%`, background: 'var(--s-aligned)' }} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
