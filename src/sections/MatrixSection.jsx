import { PixelMatrix } from '../charts';

export default function MatrixSection({ filtered, onFocus }) {
  return (
    <>
      <div className="sec-head">
        <span className="idx">§2</span>
        <div>
          <span className="title">全量 API 对齐矩阵</span>
          <span className="sub">每格 1 API · 悬停查看四维度详情</span>
        </div>
        <div className="pxmat-legend">
          <span><span className="swatch" style={{ background: 'var(--s-aligned)' }} />完全对齐</span>
          <span><span className="swatch" style={{ background: 'var(--s-reviewed)' }} />部分对齐</span>
          <span><span className="swatch" style={{ background: 'var(--s-fixing)' }} />待修复</span>
          <span><span className="swatch" style={{ background: 'var(--s-untested)', border: '1px solid var(--line)' }} />未测试</span>
        </div>
      </div>
      <section>
        <div style={{ padding: '12px 16px' }}>
          <PixelMatrix apis={filtered} onFocus={onFocus} />
        </div>
      </section>
    </>
  );
}
