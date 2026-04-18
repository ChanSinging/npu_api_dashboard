import { PixelMatrix, ImpactScatter, DtypeMatrix } from '../charts';

export default function MatrixSection({ filtered, onFocus }) {
  return (
    <>
      <div className="sec-head">
        <span className="idx">§2</span>
        <div>
          <span className="title">全量 API × 维度矩阵</span>
          <span className="sub">每格 4 象限 = 功能↖ 精度↗ 内存↙ 确定性↘</span>
        </div>
        <div className="pxmat-legend">
          <span><span className="swatch" style={{ background: 'var(--s-aligned)' }} />完全对齐</span>
          <span><span className="swatch" style={{ background: 'var(--s-reviewed)' }} />已评审</span>
          <span><span className="swatch" style={{ background: 'var(--s-fixing)' }} />待修复</span>
          <span><span className="swatch" style={{ background: 'var(--s-unsupported)' }} />不支持</span>
          <span><span className="swatch" style={{ background: 'var(--s-untested)', border: '1px solid var(--line)' }} />未测</span>
        </div>
      </div>
      <section className="mat-main">
        <div className="mat-left">
          <div style={{ padding: '12px 16px' }}>
            <PixelMatrix apis={filtered} onFocus={onFocus} />
          </div>
        </div>
        <div className="mat-right">
          <div className="block">
            <div className="block-header">
              <div className="block-title">影响散点 <b>频次 × 对齐</b></div>
              <div className="block-meta">红色区=最需关注</div>
            </div>
            <ImpactScatter apis={filtered} onFocus={onFocus} />
          </div>
          <div className="block">
            <div className="block-header">
              <div className="block-title">dtype 精度对齐 <b>4 × 9</b></div>
              <div className="block-meta">单元格=对齐率 %</div>
            </div>
            <DtypeMatrix />
          </div>
        </div>
      </section>
    </>
  );
}
