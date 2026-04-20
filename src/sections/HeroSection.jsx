import { useMemo } from 'react';
import { Progress, Tag, Space, Row, Col } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { APIS, REPOS, TREND_30D, DIMENSIONS, overallAlignment, weightedAlignment } from '../data';
import { HeroGauge } from '../charts';
import { colors } from '../components/EChart';

function buildStats(list) {
  const totalDims     = list.length * DIMENSIONS.length || 1;
  const alignedCount  = list.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'aligned').length, 0);
  const reviewedCount = list.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'reviewed').length, 0);
  const fixingCount   = list.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'fixing').length, 0);
  const untestedCount = list.reduce((s, a) => s + DIMENSIONS.filter(d => a.dims[d.key] === 'untested').length, 0);
  return { total: totalDims, aligned: alignedCount, partial: reviewedCount, fixing: fixingCount, untested: untestedCount };
}

const STATUS_RISK = { fixing: 5, unsupported: 5, untested: 2, reviewed: 0.5, aligned: 0 };
const LEVEL_WEIGHT = { L0: 6, L1: 3, L2: 1 };

function formatFreq(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}k`;
  return `${value}`;
}

export default function HeroSection({ filtered = [], onFocus }) {
  const ov = useMemo(() => overallAlignment(filtered), [filtered]);
  const wv = useMemo(() => weightedAlignment(filtered), [filtered]);

  const totalCases = filtered.reduce((s, a) => s + a.caseTotal, 0);
  const passCases  = filtered.reduce((s, a) => s + a.casePass, 0);
  const readyApis  = filtered.filter(a => DIMENSIONS.every(d => {
    const status = a.dims[d.key];
    return status === 'aligned' || status === 'reviewed';
  }));
  const l0         = filtered.filter(a => a.level === 'L0');
  const l01        = filtered.filter(a => a.level === 'L0' || a.level === 'L1');
  const change30d  = (wv.rate - TREND_30D[0].weighted) * 100;

  const l0Stats   = buildStats(l0);
  const l01Stats  = buildStats(l01);
  const allStats  = buildStats(filtered);
  const blockedWeight = Math.max(0, wv.total - wv.aligned);

  const l0Aligned = l0.filter(a => DIMENSIONS.every(d => a.dims[d.key] === 'aligned' || a.dims[d.key] === 'reviewed')).length;

  const topRiskModule = useMemo(() => {
    const byModule = new Map();
    filtered.forEach(api => {
      const riskDims = DIMENSIONS.reduce((sum, d) => {
        const status = api.dims[d.key];
        return sum + (status === 'fixing' || status === 'untested' || status === 'unsupported' ? 1 : 0);
      }, 0);
      if (!riskDims) return;
      const current = byModule.get(api.module) || { module: api.module, riskDims: 0, apis: 0, freq: 0 };
      current.riskDims += riskDims;
      current.apis += 1;
      current.freq += api.freq;
      byModule.set(api.module, current);
    });
    return [...byModule.values()].sort((a, b) => b.freq - a.freq || b.riskDims - a.riskDims)[0];
  }, [filtered]);

  const releaseQueue = useMemo(() => {
    return filtered
      .map(api => {
        const issues = DIMENSIONS
          .map(d => ({ dim: d, status: api.dims[d.key] }))
          .filter(item => item.status !== 'aligned')
          .sort((a, b) => (STATUS_RISK[b.status] || 0) - (STATUS_RISK[a.status] || 0));
        const score = issues.reduce((sum, item) => sum + (STATUS_RISK[item.status] || 0), 0) * (LEVEL_WEIGHT[api.level] || 1) * Math.log10(api.freq + 10);
        return { api, issues, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.api.freq - a.api.freq)
      .slice(0, 3);
  }, [filtered]);

  const focusRisk = (api) => {
    if (onFocus) onFocus(api);
  };

  const focusRiskKeyDown = (event, api) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    focusRisk(api);
  };

  return (
    <ProCard className="hero-solo" bodyStyle={{ padding: '28px 28px 24px' }} bordered={false}>
      <Row gutter={40} align="middle">
        <Col flex="360px">
          <HeroGauge rate={wv.rate} rawRate={ov.rate} />
          <div className="hero-gauge-legend">
            <span><span className="sw" style={{ background: colors.npu }} />加权 {(wv.rate * 100).toFixed(1)}%</span>
            <span><span className="sw" style={{ background: colors.fg3, border: '1px dashed ' + colors.fg3 }} />平均 {(ov.rate * 100).toFixed(1)}%</span>
            <span><span className="sw" style={{ background: colors.aligned }} />30d {change30d >= 0 ? '+' : ''}{change30d.toFixed(1)}pp</span>
          </div>
        </Col>
        <Col flex="auto">
          <Space align="center" style={{ marginBottom: 12 }}>
            <Tag color={colors.npu} style={{ color: '#fff' }}>torch_npu</Tag>
            <span className="mono dim">昇腾 910B · CANN 8.1.RC2 · torch 2.7.0</span>
            <Tag icon={<span className="dot" />} style={{ marginLeft: 'auto', borderColor: colors.line }}>
              <span style={{ color: colors.fg2 }}>在线 · 日更</span>
            </Tag>
          </Space>
          <h1 className="hero-h1">PyTorch on NPU · API 一致性总览</h1>
          <p className="hero-lede">
            全量 <b>{APIS.length}</b> API · <b>{totalCases.toLocaleString()}</b> 用例 · 每日自动回归 · 覆盖 <b>{REPOS.length}</b> 个主流开源仓库
          </p>
          <div className="hero-kpi-row">
            <ProCard bodyStyle={{ padding: '10px 12px' }} bordered={false}>
              <div className="kpi-k">L0 就绪</div>
              <div className="kpi-v">{l0Aligned}<span className="dim mono" style={{ fontSize: 14 }}>/{l0.length}</span></div>
              <Progress percent={l0Aligned / (l0.length || 1) * 100} showInfo={false} strokeColor="#d4871a" size={{ height: 3 }} style={{ marginTop: 6 }} />
            </ProCard>
            <ProCard bodyStyle={{ padding: '10px 12px' }} bordered={false}>
              <div className="kpi-k">已评审接受</div>
              <div className="kpi-v" style={{ color: colors.reviewed }}>{allStats.partial}</div>
              <Progress percent={allStats.partial / allStats.total * 100} showInfo={false} strokeColor="#8fa65c" size={{ height: 3 }} style={{ marginTop: 6 }} />
            </ProCard>
            <ProCard bodyStyle={{ padding: '10px 12px' }} bordered={false}>
              <div className="kpi-k">待修复差异</div>
              <div className="kpi-v" style={{ color: colors.fixing }}>{allStats.fixing}</div>
              <Progress percent={allStats.fixing / allStats.total * 100} showInfo={false} strokeColor="#c94a4a" size={{ height: 3 }} style={{ marginTop: 6 }} />
            </ProCard>
            <ProCard bodyStyle={{ padding: '10px 12px' }} bordered={false}>
              <div className="kpi-k">未测试</div>
              <div className="kpi-v dim">{allStats.untested}</div>
              <Progress percent={allStats.untested / allStats.total * 100} showInfo={false} strokeColor="#999" size={{ height: 3 }} style={{ marginTop: 6 }} />
            </ProCard>
            <ProCard bodyStyle={{ padding: '10px 12px' }} bordered={false}>
              <div className="kpi-k">用例通过</div>
              <div className="kpi-v">{(passCases / (totalCases || 1) * 100).toFixed(1)}<span style={{ fontSize: 12, color: colors.fg3 }}>%</span></div>
              <Progress percent={passCases / (totalCases || 1) * 100} showInfo={false} strokeColor="#5a9a6e" size={{ height: 3 }} style={{ marginTop: 6 }} />
            </ProCard>
          </div>
        </Col>
      </Row>
    </ProCard>
  );
}
