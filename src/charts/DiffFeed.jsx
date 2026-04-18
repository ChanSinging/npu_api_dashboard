import { DIFF_FEED, STATUS_META } from '../data';

const DIM_NAMES = { func: '功能', prec: '精度', mem: '内存', det: '确定性' };

export default function DiffFeed() {
  const shortS = s => STATUS_META[s]?.short || s;
  return (
    <div className="diff">
      {DIFF_FEED.map((d, i) => (
        <div key={i} className={`diff-row ${d.type}`}>
          <span className="sign">{d.type === 'add' ? '+' : d.type === 'del' ? '−' : '~'}</span>
          <span className="t">{d.t}</span>
          <span>
            <span className="api">{d.api}</span>
            <span className="tag">{DIM_NAMES[d.dim]}</span>
            <span className="dim2">{shortS(d.from)}</span> <span className="arrow">→</span> <span className="new">{shortS(d.to)}</span>
          </span>
          <span className="usr">{d.usr}</span>
        </div>
      ))}
    </div>
  );
}
