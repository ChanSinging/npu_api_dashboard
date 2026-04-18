export default function TweaksPanel({ tweaksOn, tweaks, setTweak }) {
  return (
    <div className={`tweaks ${tweaksOn ? 'on' : ''}`}>
      <h4>Tweaks</h4>
      <div className="row">
        <span>矩阵密度</span>
        <select value={tweaks.matrixDensity} onChange={e => setTweak('matrixDensity', e.target.value)}>
          <option value="dense">极密</option>
          <option value="normal">普通</option>
        </select>
      </div>
      <div className="row">
        <label className="chk">
          <input type="checkbox" checked={tweaks.showCudaBaseline} onChange={e => setTweak('showCudaBaseline', e.target.checked)} />
          CUDA 基准线
        </label>
      </div>
    </div>
  );
}
