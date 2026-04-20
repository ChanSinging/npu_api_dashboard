import { mulberry32 } from './utils';
import { MODULES, DIMENSIONS } from './constants';

const API_NAMES_BY_MODULE = {
  'torch': ['abs','add','addbmm','addmm','arange','argmax','argmin','argsort','baddbmm','bernoulli','bincount','bitwise_and','bitwise_or','bitwise_xor','bmm','cat','ceil','clamp','clone','concat','cos','cosh','cumprod','cumsum','det','diag','diagonal','div','dot','einsum','empty','eq','erf','exp','expm1','eye','flatten','flip','floor','full','gather','ge','greater','gt','index_select','inverse','isclose','isfinite','isinf','isnan','lerp','linspace','log','log10','log1p','log2','logical_and','logical_or','matmul','matrix_exp','max','maximum'],
  'torch.Tensor': ['to','cuda','cpu','numpy','item','backward','detach','requires_grad_','grad','contiguous','view','reshape','transpose','permute','unsqueeze','squeeze','expand','expand_as','repeat','tile','chunk','split','unbind','unfold','clone','copy_','fill_','zero_','add_','sub_','mul_','div_','sum','mean','std','var','max','min','argmax','argmin','norm','abs','abs_','acos','asin','atan','atan2','bmm','matmul','masked_fill','masked_select','scatter','scatter_','gather','index_fill_','index_put_','nonzero','topk','sort','unique','flatten','reshape_as','view_as','byte','char','short'],
  'torch.nn': ['Linear','Conv1d','Conv2d','Conv3d','ConvTranspose1d','ConvTranspose2d','ConvTranspose3d','BatchNorm1d','BatchNorm2d','BatchNorm3d','LayerNorm','GroupNorm','InstanceNorm2d','Dropout','Dropout2d','ReLU','GELU','SiLU','Sigmoid','Tanh','LeakyReLU','PReLU','Softmax','LogSoftmax','Embedding','EmbeddingBag','LSTM','GRU','RNN','MultiheadAttention','TransformerEncoderLayer','TransformerDecoderLayer','Transformer','MaxPool1d','MaxPool2d','MaxPool3d','AvgPool2d','AdaptiveAvgPool2d','CrossEntropyLoss','MSELoss','L1Loss','BCELoss','BCEWithLogitsLoss','Sequential'],
  'torch.nn.functional': ['linear','conv1d','conv2d','conv3d','conv_transpose2d','relu','gelu','silu','sigmoid','softmax','log_softmax','dropout','batch_norm','layer_norm','group_norm','cross_entropy','mse_loss','l1_loss','nll_loss','binary_cross_entropy','max_pool2d','avg_pool2d','adaptive_avg_pool2d','interpolate','grid_sample','affine_grid','pad','embedding','one_hot','scaled_dot_product_attention','multi_head_attention_forward','pixel_shuffle','pixel_unshuffle','normalize','cosine_similarity','pairwise_distance','ctc_loss','kl_div','smooth_l1_loss','huber_loss'],
  'torch.linalg': ['norm','vector_norm','matrix_norm','det','slogdet','inv','pinv','solve','lstsq','cholesky','qr','svd','eig','eigh','eigvals','eigvalsh','matrix_rank','matmul','multi_dot','tensorsolve','tensorinv','cond'],
  'torch.fft': ['fft','ifft','fft2','ifft2','fftn','ifftn','rfft','irfft','rfft2','irfft2','rfftn','irfftn','hfft','ihfft'],
  'torch.distributions': ['Normal','Bernoulli','Beta','Binomial','Categorical','Cauchy','Chi2','Dirichlet','Exponential','Gamma','Geometric','Gumbel','LogNormal','MultivariateNormal','Multinomial','Poisson','StudentT','Uniform'],
  'torch.cuda': ['is_available','device_count','current_device','set_device','synchronize','Stream','Event','memory_allocated','memory_reserved','max_memory_allocated','empty_cache','get_device_name','get_device_properties','get_rng_state','set_rng_state','manual_seed','manual_seed_all'],
};

const FREQ_OVERRIDES = {
  'torch.matmul': 9_820_000, 'Tensor.to': 8_740_000, 'Tensor.view': 7_200_000,
  'Tensor.reshape': 6_900_000, 'Tensor.contiguous': 6_100_000, 'torch.cat': 5_800_000,
  'Tensor.transpose': 5_000_000, 'torch.nn.Linear': 4_700_000, 'torch.nn.functional.linear': 4_600_000,
  'torch.nn.functional.softmax': 4_300_000, 'torch.nn.LayerNorm': 4_100_000,
  'torch.nn.functional.scaled_dot_product_attention': 3_900_000, 'torch.nn.functional.gelu': 3_600_000,
  'torch.nn.functional.relu': 3_400_000, 'torch.nn.Conv2d': 3_100_000, 'torch.bmm': 2_900_000,
  'torch.nn.Embedding': 2_700_000, 'torch.nn.MultiheadAttention': 2_500_000,
  'Tensor.permute': 2_400_000, 'Tensor.mean': 2_200_000, 'Tensor.sum': 2_100_000,
  'torch.nn.functional.dropout': 2_000_000, 'torch.arange': 1_800_000, 'torch.clamp': 1_600_000,
  'torch.stack': 1_500_000, 'torch.nn.functional.cross_entropy': 1_400_000,
  'torch.nn.BatchNorm2d': 1_200_000, 'torch.einsum': 1_100_000, 'torch.nn.functional.interpolate': 980_000,
  'torch.nn.functional.conv2d': 900_000, 'torch.nn.GELU': 850_000, 'torch.nn.functional.layer_norm': 810_000,
};

const rand = mulberry32(42);

function sampleStatus(dimKey, moduleKey) {
  const r = rand();
  const profile = {
    func: [0.64, 0.14, 0.10, 0.04, 0.08],
    prec: [0.46, 0.22, 0.14, 0.04, 0.14],
    mem:  [0.40, 0.10, 0.12, 0.05, 0.33],
    det:  [0.60, 0.12, 0.08, 0.04, 0.16],
  }[dimKey];
  let adj = [...profile];
  if (moduleKey === 'torch.fft' || moduleKey === 'torch.linalg')
    adj = [profile[0]*0.7, profile[1]*1.2, profile[2]*1.4, profile[3]*1.1, profile[4]*1.3];
  if (moduleKey === 'torch.distributions')
    adj = [profile[0]*0.8, profile[1]*1.1, profile[2]*1.3, profile[3]*1.0, profile[4]*1.4];
  const sum = adj.reduce((a, b) => a + b, 0);
  adj = adj.map(x => x / sum);
  let acc = 0;
  const keys = ['aligned', 'reviewed', 'fixing', 'unsupported', 'untested'];
  for (let i = 0; i < keys.length; i++) {
    acc += adj[i];
    if (r < acc) return keys[i];
  }
  return 'untested';
}

export const APIS = [];
MODULES.forEach(mod => {
  const list = API_NAMES_BY_MODULE[mod.key] || [];
  list.forEach(name => {
    const fullName = mod.key === 'torch.Tensor' ? `Tensor.${name}` : `${mod.key}.${name}`;
    const level = rand() < 0.22 ? 'L0' : rand() < 0.55 ? 'L1' : 'L2';
    const dims = {};
    DIMENSIONS.forEach(d => { dims[d.key] = sampleStatus(d.key, mod.key); });
    const caseTotal = 4 + Math.floor(rand() * 48);
    const casePass  = Math.floor(caseTotal * (0.55 + rand() * 0.45));
    let freq = FREQ_OVERRIDES[fullName];
    if (!freq) freq = Math.floor(Math.pow(10, 2 + rand() * 4.5));
    APIS.push({
      name: fullName, short: name, module: mod.key, level, dims,
      caseTotal, casePass, freq,
      updatedAt: `2026-04-${String(1 + Math.floor(rand() * 11)).padStart(2, '0')}`,
      updatedBy: ['zhangsan','lihua','wangwei','chenyu','liumei','zhaogang'][Math.floor(rand() * 6)],
    });
  });
});

export const API_REUSE_MAP = {
  'torch.isnan': ['Tensor.isnan'],
  'torch.isfinite': ['Tensor.isfinite'],
  'torch.isinf': ['Tensor.isinf'],
  'torch.abs': ['Tensor.abs'],
  'torch.acos': ['Tensor.acos'],
  'torch.asin': ['Tensor.asin'],
  'torch.atan': ['Tensor.atan'],
  'torch.ceil': ['Tensor.ceil'],
  'torch.clone': ['Tensor.clone'],
  'torch.cos': ['Tensor.cos'],
  'torch.cosh': ['Tensor.cosh'],
  'torch.cumsum': ['Tensor.cumsum'],
  'torch.diag': ['Tensor.diag'],
  'torch.erf': ['Tensor.erf'],
  'torch.exp': ['Tensor.exp'],
  'torch.expm1': ['Tensor.expm1'],
  'torch.flatten': ['Tensor.flatten'],
  'torch.flip': ['Tensor.flip'],
  'torch.floor': ['Tensor.floor'],
  'torch.log': ['Tensor.log'],
  'torch.log10': ['Tensor.log10'],
  'torch.log1p': ['Tensor.log1p'],
  'torch.log2': ['Tensor.log2'],
  'torch.argmax': ['Tensor.argmax'],
  'torch.argmin': ['Tensor.argmin'],
  'torch.argsort': ['Tensor.argsort'],
  'torch.max': ['Tensor.max'],
  'torch.min': ['Tensor.min'],
  'torch.mean': ['Tensor.mean'],
  'torch.norm': ['Tensor.norm'],
  'torch.sort': ['Tensor.sort'],
  'torch.sqrt': ['Tensor.sqrt'],
  'torch.sum': ['Tensor.sum'],
  'torch.transpose': ['Tensor.transpose'],
  'torch.unsqueeze': ['Tensor.unsqueeze'],
  'torch.squeeze': ['Tensor.squeeze'],
  'torch.matmul': ['Tensor.matmul'],
  'torch.bmm': ['Tensor.bmm'],
  'torch.nn.functional.relu': ['torch.nn.ReLU'],
  'torch.nn.functional.gelu': ['torch.nn.GELU'],
  'torch.nn.functional.silu': ['torch.nn.SiLU'],
  'torch.nn.functional.sigmoid': ['torch.nn.Sigmoid'],
  'torch.nn.functional.softmax': ['torch.nn.Softmax'],
  'torch.nn.functional.cross_entropy': ['torch.nn.CrossEntropyLoss'],
  'torch.nn.functional.mse_loss': ['torch.nn.MSELoss'],
  'torch.nn.functional.l1_loss': ['torch.nn.L1Loss'],
  'torch.nn.functional.binary_cross_entropy': ['torch.nn.BCELoss'],
  'torch.nn.functional.linear': ['torch.nn.Linear'],
  'torch.nn.functional.embedding': ['torch.nn.Embedding'],
  'torch.nn.functional.dropout': ['torch.nn.Dropout'],
  'torch.nn.functional.layer_norm': ['torch.nn.LayerNorm'],
  'torch.nn.functional.batch_norm': ['torch.nn.BatchNorm2d'],
  'torch.nn.functional.max_pool2d': ['torch.nn.MaxPool2d'],
  'torch.nn.functional.avg_pool2d': ['torch.nn.AvgPool2d'],
  'torch.nn.functional.interpolate': ['torch.nn.Upsample'],
  'Tensor.abs': ['torch.abs'],
  'Tensor.acos': ['torch.acos'],
  'Tensor.asin': ['torch.asin'],
  'Tensor.atan': ['torch.atan'],
  'Tensor.ceil': ['torch.ceil'],
  'Tensor.clone': ['torch.clone'],
  'Tensor.cos': ['torch.cos'],
  'Tensor.cosh': ['torch.cosh'],
  'Tensor.cumsum': ['torch.cumsum'],
  'Tensor.diag': ['torch.diag'],
  'Tensor.erf': ['torch.erf'],
  'Tensor.exp': ['torch.exp'],
  'Tensor.flatten': ['torch.flatten'],
  'Tensor.flip': ['torch.flip'],
  'Tensor.floor': ['torch.floor'],
  'Tensor.log': ['torch.log'],
  'Tensor.log10': ['torch.log10'],
  'Tensor.log1p': ['torch.log1p'],
  'Tensor.log2': ['torch.log2'],
  'Tensor.argmax': ['torch.argmax'],
  'Tensor.argmin': ['torch.argmin'],
  'Tensor.argsort': ['torch.argsort'],
  'Tensor.max': ['torch.max'],
  'Tensor.min': ['torch.min'],
  'Tensor.mean': ['torch.mean'],
  'Tensor.norm': ['torch.norm'],
  'Tensor.sort': ['torch.sort'],
  'Tensor.sqrt': ['torch.sqrt'],
  'Tensor.sum': ['torch.sum'],
  'Tensor.transpose': ['torch.transpose'],
  'Tensor.unsqueeze': ['torch.unsqueeze'],
  'Tensor.squeeze': ['torch.squeeze'],
  'Tensor.matmul': ['torch.matmul'],
  'Tensor.bmm': ['torch.bmm'],
  'Tensor.isnan': ['torch.isnan'],
  'Tensor.isfinite': ['torch.isfinite'],
  'Tensor.isinf': ['torch.isinf'],
};
