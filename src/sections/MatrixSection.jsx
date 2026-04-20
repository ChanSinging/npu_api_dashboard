import { useState, useMemo } from 'react';
import { Card } from 'antd';
import { APIS, DIMENSIONS } from '../data';
import { PixelMatrix, ImpactScatter, DtypeMatrix } from '../charts';
import { colors } from '../components/EChart';

const hasBlocking = a => DIMENSIONS.some(d => a.dims[d.key] === 'fixing' || a.dims[d.key] === 'unsupported');
const hasUntested = a => DIMENSIONS.some(d => a.dims[d.key] === 'untested');
const isPriority = a => (a.level === 'L0' || a.level === 'L1') && hasBlocking(a);
const isReady = a => DIMENSIONS.every(d => a.dims[d.key] === 'aligned' || a.dims[d.key] === 'reviewed');

export default function MatrixSection({ filtered, onFocus }) {
  const [mode, setMode] = useState('all');
  const [moduleFocus, setModuleFocus] = useState(null);

  const matrixStats = useMemo(() => {
    const blocked = filtered.filter(hasBlocking);
    const untested = filtered.filter(hasUntested);
    const priority = filtered.filter(isPriority);
    const ready = filtered.filter(isReady);
    const blockedDims = filtered.reduce((sum, api) => (
      sum + DIMENSIONS.filter(d => api.dims[d.key] === 'fixing' || api.dims[d.key] === 'unsupported').length
    ), 0);

    const byModule = new Map();
    filtered.forEach(api => {
      const blockDims = DIMENSIONS.filter(d => api.dims[d.key] === 'fixing' || api.dims[d.key] === 'unsupported').length;
      const testGaps = DIMENSIONS.filter(d => api.dims[d.key] === 'untested').length;
      if (!blockDims && !testGaps) return;
      const current = byModule.get(api.module) || { module: api.module, apis: 0, risk: 0, freq: 0 };
      current.apis += 1;
      current.risk += blockDims * 2 + testGaps;
      current.freq += api.freq;
      byModule.set(api.module, current);
    });

    return {
      blocked,
      blockedDims,
      untested,
      priority,
      ready,
      modules: [...byModule.values()].sort((a, b) => b.risk - a.risk || b.freq - a.freq).slice(0, 5),
    };
  }, [filtered]);

  const visible = useMemo(() => {
    let list = filtered;
    if (mode === 'blocking') list = list.filter(hasBlocking);
    if (mode === 'priority') list = list.filter(isPriority);
    if (mode === 'untested') list = list.filter(hasUntested);
    if (moduleFocus) list = list.filter(api => api.module === moduleFocus);
    return list;
  }, [filtered, mode, moduleFocus]);

  const filterButtons = [
    { key: 'all', label: '全部', count: filtered.length },
    { key: 'blocking', label: '阻塞', count: matrixStats.blocked.length },
    { key: 'priority', label: 'L0/L1 风险', count: matrixStats.priority.length },
    { key: 'untested', label: '未测试', count: matrixStats.untested.length },
  ];

  return (
    <>
      <div className="sec-head">
        <span className="idx">§4</span>
        <div>
          <span className="title">全量 API × 维度矩阵</span>
          <span className="sub">每格 4 象限 = 功能↖ 精度↗ 内存↙ 确定性↘</span>
        </div>
        <div className="pxmat-legend">
          <span><span className="swatch" style={{ background: colors.aligned }} />完全对齐</span>
          <span><span className="swatch" style={{ background: colors.reviewed }} />已评审</span>
          <span><span className="swatch" style={{ background: colors.fixing }} />待修复</span>
          <span><span className="swatch" style={{ background: colors.unsupported }} />不支持</span>
          <span><span className="swatch" style={{ background: colors.untested, border: '1px solid ' + colors.line }} />未测</span>
        </div>
      </div>
      <div className="mat-main">
        <div className="mat-left">
          <div style={{ padding: '12px 16px' }}>
            <PixelMatrix apis={visible} onFocus={onFocus} />
          </div>
        </div>
        <div className="mat-right">
          <Card className="block" bordered={false} bodyStyle={{ padding: '14px 16px' }}>
            <div className="block-header">
              <div className="block-title">影响散点 <b>频次 × 对齐</b></div>
              <div className="block-meta">红色区=最需关注</div>
            </div>
            <ImpactScatter apis={filtered} onFocus={onFocus} />
          </Card>
          <Card className="block" bordered={false} bodyStyle={{ padding: '14px 16px' }}>
            <div className="block-header">
              <div className="block-title">dtype 精度对齐 <b>4 × 9</b></div>
              <div className="block-meta">单元格=对齐率 %</div>
            </div>
            <DtypeMatrix />
          </Card>
        </div>
      </div>
    </>
  );
}
