// 사용법: node tools/verify.js   (정답·표기·catalog.json·제출 코드 규칙을 점검한다)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const stub = new Proxy({}, { get: () => () => null });
const win = { SF: stub }; win.window = win;
vm.createContext(win);
fs.readdirSync(path.join(root, 'data')).filter(f => f.endsWith('.js')).sort((a, b) => a.length - b.length).forEach(f => vm.runInContext(fs.readFileSync(path.join(root, 'data', f), 'utf8'), win));
const grades = win.SOLVE_GRADES, lessons = grades.flatMap(g => g.units.flatMap(u => u.lessons.map(l => ({ ...l, unitName: u.name }))));
let bad = 0; const fail = m => { bad++; console.log('✗ ' + m); }, ok = m => console.log('✓ ' + m);
const eq = (a, b) => Math.abs(a - b) < 1e-9;
const gcd = (a, b) => b ? gcd(b, a % b) : a;

// 1) 정답을 문제 조건에서 독립적으로 다시 계산
const exp = {
  s06: [
    () => 6 * 10 / 4,                                   // EF: 4:10 = 6:EF
    () => 180 - 75 - 40,                                // ∠F = ∠C
    () => ['ABC'.indexOf('A'), 'ABC'.indexOf('C')].map(i => 'DEF'[i]).join(''),  // AC ↔ DF
    () => 9 * 20 / 12,                                  // FG
    () => 2 * (4 * 9 / 6),                              // 큰 원기둥 밑면 둘레 / π
    () => (6 + 7 + 8) * 9 / 6,                          // △DEF 둘레
    () => { const a = 2 * 8 * 72 / 360, b = 2 * 8 / 5; if (!eq(a, b)) throw new Error('호 길이 두 방법이 다름'); return a; },  // 호 / π
    [() => ['ABC'.indexOf('A'), 'ABC'.indexOf('B')].map(i => 'DEF'[i]).join(''),
     () => { const g = gcd(8, 12); return (8 / g) + ' : ' + (12 / g); },
     () => 'AB : DE = BC : EF',   // BC ↔ EF (B↔E, C↔F)
     () => 10 * 12 / 8,
     () => 180 - 70 - 50]
  ]
};

// ---- 교과서 생각 다지기 (s91, s92): 조건에서 독립적으로 다시 계산 ----
const R = (a, b) => { const g = gcd(a, b); return (a / g) + ' : ' + (b / g); };
const dd = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
// 접기: 정삼각형 한 변 s, AE=a, BF=b → AD. 좌표로 대칭 이동해 DF = DA, EF = EA 가 성립하는지 점검한다.
const foldAD = (s, a, b) => { const B = [0, 0], C = [s, 0], A = [s / 2, s * Math.sqrt(3) / 2], F = [b, 0], E = [A[0] + (C[0] - A[0]) * a / s, A[1] + (C[1] - A[1]) * a / s];
  if (!eq(dd(E, F), a)) throw new Error('접기: EF ≠ EA'); const d = a * b / (s - a), D = [A[0] + (B[0] - A[0]) * d / s, A[1] + (B[1] - A[1]) * d / s];
  if (!eq(dd(D, F), d)) throw new Error('접기: DF ≠ DA'); return d; };
const sqSide = (ab, bc) => { const x = ab * bc / (ab + bc); if (!eq((ab - x) / ab, x / bc)) throw new Error('정사각형 비례식'); return x; };
// 두 직선이 C에서 만나는 그림: 닮음 SAS 확인 / AB ∥ DE 에서 DE 계산
const para = (AD, AF, CF) => { const CE = CF * AD / AF; return CE; };
exp.s91 = [
  [() => R(4, 8), () => 6 * 4 / 8, () => 50],
  [() => R(12, 8), () => 15 * 8 / 12, () => 180 - 70 - 45],
  () => 52 * (12 / 8) ** 2,
  () => 75 * (6 / 10) ** 2,
  [() => '△ABC ∽ △DEC', () => { if (!(eq(3 / 6, 4 / 8))) throw 0; return 'SAS 닮음'; }],
  [() => '△ABC ∽ △DEC', () => 'AA 닮음', () => 5 * 8 / 4],
  [() => { const r = [3, 4]; return (r[0] ** 2 + ':' + r[1] ** 2) === '9:16' ? '9 : 16' : 0; }, () => '27 : 64'],
  [() => R(4, 10), () => 52 * (10 / 4) ** 2, () => 24 * (10 / 4) ** 3],
  [() => { if (!(eq(4 / 12, 5 / 15))) throw 0; return '△ADE ∽ △ACB (SAS 닮음)'; }, () => 6 * 12 / 4, () => '△ABC ∽ △DAC (AA 닮음)', () => { const bc = 8 * 8 / 6; return bc - 6; }],
  [() => { if (!(eq(3 / 6, 5 / 10))) throw 0; return '△ADE ∽ △ACB (SAS 닮음)'; }, () => 4 * 6 / 3, () => '△ABC ∽ △DAC (AA 닮음)', () => { const bc = 6 * 6 / 4; if (!eq(bc * 4, 36)) throw 0; return bc - 4; }]
];
exp.s92 = [
  [() => 2 ** 4 + ' : 1', () => Math.sqrt(16) + ' : 1'],
  [() => 2 ** 2 + ' : 1', () => Math.sqrt(4) + ' : 1', () => 10000 / 2 ** 3],
  [() => '△AFD ∽ △CFE', () => para(9, 6, 4), () => 9 - para(9, 6, 4)],
  [() => '△AFD ∽ △CFE', () => para(14, 8, 4), () => 14 - para(14, 8, 4)],
  [() => 2 ** 3 + ' : ' + 3 ** 3, () => 350 * 27 / 35],
  [() => 1 + ' : ' + 2 ** 3, () => 540 * 8 / 9],
  [() => '△ADF ∽ △ABC', () => '(10 − x) : 10 = x : 15', () => sqSide(10, 15), () => sqSide(10, 15) ** 2],
  [() => '△ADF ∽ △ABC', () => '(12 − x) : 12 = x : 24', () => sqSide(12, 24), () => sqSide(12, 24) ** 2],
  [() => 'AA 닮음', () => 24 - 8, () => 24 - 14, () => '(24 − x) : 16 = 8 : 10', () => foldAD(24, 14, 8)],
  [() => 'AA 닮음', () => 30 - 6, () => 30 - 21, () => '(30 − x) : 24 = 6 : 9', () => foldAD(30, 21, 6)]
];

// ---- 닮은 도형의 성질(s93, s94), 경우의 수와 확률(s95~s101): 조건에서 독립적으로 다시 계산 ----
const range = (a, z) => Array.from({ length: z - a + 1 }, (_, i) => a + i);
const cnt = (A, B, f) => A.flatMap(a => B.map(b => [a, b])).filter(([a, b]) => f(a, b)).length;
const isP2 = n => n > 1 && (() => { while (n % 2 === 0) n /= 2; return n === 1; })();
const d6 = range(1, 6);
exp.s93 = [
  [() => '△ADE', () => 'AE', () => 'BD'],
  [() => (6 + 3) * 8 / 6, () => 3 * 10 / 6],
  [() => 6 * 3 / 2, () => 4 * 9 / 6],
  [() => 8 * 6 / 4, () => 5 * 12 / 10],
  [() => 2 * 8, () => 12 / 2],
  [() => 2 * 7, () => 2 * 5],
  [() => 45, () => 7 * 3],
  [() => 50, () => 6 * 4],
  [() => 9 * 6 / (15 - 6), () => 15 * 6 / 9],
  [() => 3 * 8 / (12 - 8), () => 12 * 6 / 3]
];
exp.s94 = [
  [() => '3 : 2', () => 15 * 3 / (3 + 2)],
  [() => '4 : 1', () => 20 * 4 / (4 + 1)],
  [() => '1/' + (6 / 2), () => 60 * 3],
  [() => '1/' + (6 / 2), () => 25 * 3],
  [() => 18 / 3, () => { const gm = 18 / 3; return gm - gm / 3; }, () => { const abc = 90 * 2, gbm = abc / 6; return gbm / 3; }],
  [() => 27 / 3, () => { const gm = 27 / 3; return gm - gm / 3; }, () => { const abc = 54 * 2, gbm = abc / 6; return gbm / 3; }]
];
exp.s95 = [
  [() => 4, () => range(1, 4).filter(d => 4 % d === 0).length],
  [() => 8, () => range(1, 8).filter(d => 6 % d === 0).length],
  () => 3 + 3, () => 3 + 5,
  [() => 4, () => 5 + 6], [() => 3, () => 5 + 7],
  () => 2 * 6, () => 2 * 2 * 6,
  [() => 2 + 3, () => 3 + 4], [() => 2 + 5, () => 3 + 2]
];
const two = (W, Bk) => { const all = W.concat(Bk); const n1 = cnt(all, all, (a, b) => a !== b), n2 = cnt(W, Bk, () => true) + cnt(Bk, W, () => true); return [n1, n2]; };
exp.s96 = [
  () => cnt(d6, d6, (a, b) => a + 2 * b === 10), () => cnt(d6, d6, (a, b) => a + 3 * b === 12),
  [() => '둘 다 짝수', () => cnt(range(1, 9), range(1, 9), (m, n) => (m + n) % 2 === 0 && (m * n) % 2 === 0)],
  [() => '둘 다 짝수', () => cnt(range(1, 7), range(1, 7), (m, n) => (m + n) % 2 === 0 && (m * n) % 2 === 0)],
  () => (3 + 2) * 4, () => (3 + 2) * 5,
  [() => two([1, 2, 3], [4, 5, 6, 7])[0], () => two([1, 2, 3], [4, 5, 6, 7])[1]],
  [() => two([1, 2], [3, 4, 5])[0], () => two([1, 2], [3, 4, 5])[1]]
];
exp.s97 = [
  () => d6.filter(x => x >= 5).length / 6, () => d6.filter(x => 6 % x === 0).length / 6,
  () => 2 / 6 + 2 / 6, () => (4 + 5) / 12, () => 4 / 5 * 7 / 8, () => 3 / 4 * 2 / 5,
  () => range(1, 25).filter(n => n % 5 === 0 || n % 6 === 0).length / 25,
  () => range(1, 30).filter(n => n % 4 === 0 || n % 9 === 0).length / 30,
  () => 1 - (1 / 2) ** 2, () => 1 - (1 / 2) ** 3
];
exp.s98 = [
  () => 1 - (4 / 7) * (2 / 3), () => 1 - (3 / 5) * (3 / 4),
  [() => 6 / (1 / 6), () => 36 - (7 + 12 + 4 + 2), () => (7 + (36 - 25)) / 36],
  [() => 5 / (1 / 5), () => 25 - (6 + 7 + 3 + 2), () => (6 + 7) / 25],
  () => (1 / 3) * (2 / 4), () => (1 / 5) * (2 / 3)
];
const sq = (n, tgt) => cnt(d6, d6, (a, b) => (((a - b) % 4) + 4) % 4 === tgt);
const pw2 = N => cnt(range(1, N), range(1, N), (a, b) => isP2(a * b));
exp.s99 = [
  () => range(1, 10).filter(d => 10 % d === 0).length, () => range(1, 12).filter(d => 12 % d === 0).length,
  () => range(1, 12).filter(n => n > 1 && range(2, n - 1).every(k => n % k)).length / 12,
  () => range(1, 20).filter(n => n > 1 && range(2, n - 1).every(k => n % k)).length / 20,
  () => 12 + 2, () => 8 + 3, () => 1 - 13 / 100, () => 1 - 7 / 50, () => (3 + 3) / 8, () => (4 + 3) / 12
];
exp.s100 = [
  () => 3 / 25, () => 12 / 30, () => 6 + 4, () => 5 + 4,
  () => cnt(range(1, 9), range(1, 9), (a, b) => a !== b) / 81, () => cnt(d6, d6, (a, b) => a !== b) / 36,
  () => cnt(range(0, 5), range(0, 15), (a, b) => 500 * a + 100 * b === 1500),
  () => cnt(range(0, 4), range(0, 12), (a, b) => 500 * a + 100 * b === 1200),
  [() => '2의 거듭제곱 수(1, 2, 4, 8, 16)', () => pw2(16), () => pw2(16) / 256],
  [() => '1, 2, 4, 8', () => pw2(12), () => pw2(12) / 144]
];
exp.s101 = [
  () => cnt(d6, d6, (a, b) => a <= b && a + b <= 3) / 36, () => cnt(d6, d6, (a, b) => a <= b && a + b <= 4) / 36,
  () => cnt(range(5, 10), [15, 17, 19, 21, 23, 25], (a, b) => (a * b) % 10 === 0) / 36, () => cnt(d6, [5, 7, 9, 11, 13, 15], (a, b) => (a * b) % 10 === 0) / 36,
  [() => '1/10³ × 1/10³', () => 3 + 3], [() => '1/10⁴ × 1/10⁴ × 1/10⁴', () => 4 + 4 + 4],
  [() => (1 / 4) ** 2 * 2 + (2 / 4) ** 2, () => 1 - ((1 / 4) ** 2 * 2 + (2 / 4) ** 2)],
  [() => ((1 / 6) ** 2 + (2 / 6) ** 2 + (3 / 6) ** 2), () => 1 - ((1 / 6) ** 2 + (2 / 6) ** 2 + (3 / 6) ** 2)],
  [() => 36, () => sq(6, 2), () => sq(6, 2) / 36], [() => 36, () => sq(6, 0), () => sq(6, 0) / 36]
];

// ---- 중3 Ⅴ. 통계 대푯값 (s111~s114): 원자료에서 평균·중앙값·최빈값을 독립적으로 다시 계산 ----
const sum = a => a.reduce((x, y) => x + y, 0), mean = a => sum(a) / a.length;
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const modes = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); const m = Math.max(...Object.values(c)); return Object.keys(c).filter(k => c[k] === m).map(Number); };
const mode1 = a => { const m = modes(a); if (m.length !== 1) throw new Error('최빈값이 하나가 아님: ' + a); return m[0]; };
const stem = rows => rows.flatMap(([st, lv]) => lv.split(' ').map(l => Number(st) * 10 + Number(l)));
// 줄기 29, 잎 0 → 290 처럼 줄기가 두 자리인 경우
const stem2 = rows => rows.flatMap(([st, lv]) => lv.split(' ').map(l => Number(st) * 10 + Number(l)));
// 최소 이동 개수 (동전 한 개씩 옮기기, BFS)
const minMoves = (a, t) => { let fr = [a], seen = new Set([a.join()]); for (let d = 0; d <= 12; d++) { if (fr.some(s => med(s) === t)) return d; const nx = []; for (const s of fr) for (let i = 0; i < s.length; i++) if (s[i] > 0) for (let j = 0; j < s.length; j++) if (i !== j) { const c = [...s]; c[i]--; c[j]++; const k = c.join(); if (!seen.has(k)) { seen.add(k); nx.push(c); } } fr = nx; } return -1; };
const MIDN = '중앙값', MOD = '최빈값';
const three = a => [() => mean(a), () => med(a), () => mode1(a)];
// 평균 ≠ 중앙값, 극단값이 있을 때 중앙값이 더 적절한지 (평균이 중앙값보다 자료 대부분에서 벗어나는지)
const rice1 = [102.4, 99.2, 96.9, 93.6, 88.9, 87.0, 83.2, 82.0, 80.7, 78.8], rice2 = [76.9, 75.8, 74.0, 72.8, 71.2, 69.8, 67.2, 65.1, 62.9, 61.9];
if (!eq(sum(rice1), 892.7) || !eq(sum(rice2), 697.6)) fail('쌀 소비량 합계가 표와 다름');
const blood = [4.1, 4.4, 4.6, 4.5, 4.3, 4.2, 4.5, 4.4, 4.3, 4.3];
const cake = stem2([['29', '0 1 1 3 4 5 9'], ['30', '1 3 3 3'], ['31', '2 4'], ['32', '1']]);
const lf12 = stem([['1', '2 4 4 8'], ['2', '1 3 6 6 6'], ['3', '0 5 8']]);
exp.s111 = [
  three([3, 7, 2, 4, 5, 1, 5, 8, 5, 2]), three([30, 80, 20, 50, 60, 10, 60, 90, 60, 40]),
  [() => med(blood), () => mode1(blood)], [() => med([8.2, 7.8, 8.0, 8.2, 7.9, 8.1, 8.2, 7.8]), () => mode1([8.2, 7.8, 8.0, 8.2, 7.9, 8.1, 8.2, 7.8])],
  () => mean([67, 74, 68, 71, 75]), () => mean([14, 18, 20, 16, 12, 19]),
  [() => med(cake), () => mode1(cake)], [() => med(lf12), () => mode1(lf12)],
  [() => mean(rice1), () => mean(rice2), () => mean(rice1) > mean(rice2) ? '쌀 소비량이 줄고 있다' : '쌀 소비량이 늘고 있다'],
  [() => mean([12, 15, 9, 14, 10]), () => mean([18, 16, 20, 13, 23]), () => mean([18, 16, 20, 13, 23]) > mean([12, 15, 9, 14, 10]) ? '2학기에 대출이 더 많았다' : '1학기에 대출이 더 많았다'],
  three([5, 4, 4, 6, 2, 1, 6, 1, 3, 1]), three([3, 5, 2, 5, 6, 1, 5, 4, 2, 3])
];
// 극단값 때문에 평균이 대푯값으로 부적절한지: 평균보다 작은 자료가 과반(또는 과소)이면 중앙값
const pick = a => { const m = mean(a), lo = a.filter(x => x < m).length, hi = a.filter(x => x > m).length; return (lo > 2 * hi || hi > 2 * lo) ? MIDN : '평균'; };
const four = a => [() => mean(a), () => med(a), () => mode1(a), () => pick(a)];
const fish = [49, 52, 47, 49, 119, 51, 45, 52], fish2 = [22, 25, 21, 24, 23, 26, 22, 77];
exp.s112 = [
  [() => mean([124, 153, 172, 537, 189]), () => med([124, 153, 172, 537, 189]), () => pick([124, 153, 172, 537, 189])],
  [() => mean([30, 35, 40, 45, 250]), () => med([30, 35, 40, 45, 250]), () => pick([30, 35, 40, 45, 250])],
  four([12, 2, 15, 13, 18, 2, 11, 105, 2, 15, 70, 1, 82, 16]), four([4, 6, 6, 8, 9, 10, 12, 13, 14, 118]),
  four([4, 7, 13, 14, 17, 16, 135, 2, 4, 21]), four([2, 5, 3, 3, 9, 10, 4, 11, 3, 150]),
  [() => { if (!eq(mean(fish), 58)) throw new Error('평균 58 아님'); return fish.filter(x => x < 58).length; }, () => med(fish), () => pick(fish)],
  [() => mean(fish2), () => med(fish2), () => pick(fish2)],
  [() => MOD, () => { const t = { 컬링: 4, 축구: 5, 야구: 8, 농구: 5, 탁구: 3 }; if (sum(Object.values(t)) !== 25) throw new Error('25명 아님'); return Object.keys(t).reduce((p, k) => t[k] > t[p] ? k : p); }],
  [() => MOD, () => { const t = { 사과: 6, 귤: 4, 딸기: 9, 포도: 3, 바나나: 3 }; if (sum(Object.values(t)) !== 25) throw new Error('25명 아님'); return Object.keys(t).reduce((p, k) => t[k] > t[p] ? k : p); }]
];
// x를 구하는 문제: 후보를 모두 시험해 조건을 만족하는 값이 하나뿐인지 확인한다
const sol = (f, lo = -50, hi = 200, step = 1) => { const r = []; for (let x = lo; x <= hi; x += step) if (f(x)) r.push(x); if (r.length !== 1) throw new Error('해가 하나가 아님: ' + r); return r[0]; };
const avgMode = base => sol(x => { const a = [...base, x]; const m = modes(a); return m.length === 1 && eq(mean(a), m[0]); });
const medX = (before, after, t) => sol(x => eq(med([...before, x, ...after]), t) && x >= before[before.length - 1] && x <= after[0]);
const win10 = [14, 19, 25, 20, 30, 17, 22, 24, 17, 22], jump10 = [11, 16, 14, 20, 18, 12, 16, 13, 15, 25];
// 자료 4개 중앙값: a가 어디에 있든 조건을 만족하는 a를 모두 찾는다
const med4 = (base, t) => sol(a => eq(med([...base, a]), t), -50, 100, 1);
exp.s113 = [
  () => medX([3, 5], [9, 11, 12], 8), () => medX([2, 4], [10, 12, 13], 9),
  [() => '90, 84, 76, 86 중 하나', () => avgMode([90, 84, 76, 86])], [() => '11, 6, 10, 13 중 하나', () => avgMode([11, 6, 10, 13])],
  [() => mean(win10), () => med(win10), () => mean(win10) + med(win10)], [() => mean(jump10), () => med(jump10), () => mean(jump10) + med(jump10)],
  [() => '11과 a', () => med4([5, 11, 15], 12)], [() => '8과 a', () => med4([3, 8, 14], 10)],
  () => sol(x => eq(mean([4, 8, 12, x, 1, 2, 4, 9]), 6)), () => sol(x => eq(mean([2, 7, 10, x, 5, 3, 9]), 6))
];
const coin1 = [6, 3, 10, 4, 7, 1, 3, 8, 3], coin2 = [7, 2, 9, 2, 1, 6, 2, 4, 3];
const l25 = stem([['2', '2 2 3 5'], ['3', '5 5 5 7'], ['4', '0 4 4 5 5 6 7'], ['5', '2 2 3 5 6'], ['6', '1 2 2 2 3']]);
const l13 = stem([['1', '0 2 2 5'], ['2', '1 3 3 3 7'], ['3', '2 4 6'], ['4', '1']]);
if (l25.length !== 25 || l13.length !== 13 || sum(coin1) !== 45 || sum(coin2) !== 36) fail('s114 자료 개수 확인');
const wt = (mean0, mode0, mean1, newW) => { const total0 = mean0 * 5, total1 = mean1 * 5, out = total0 + newW - total1; return out; };
// 서술형: 가능한 모든 구성(나머지 4명 몸무게)을 시험해 새 5명의 중앙값이 항상 같은지 확인한다
const medAll = (mean0, mode0, mean1, newW, outW) => { const rest = mean0 * 5 - outW, res = new Set(); for (let a = 40; a <= 110; a++) for (let b = a; b <= 110; b++) for (let c = b; c <= 110; c++) { const d = rest - a - b - c; if (d < c || d > 110) continue; const old = [a, b, c, d, outW]; const m = modes(old); if (m.length !== 1 || m[0] !== mode0) continue; res.add(med([a, b, c, d, newW])); } if (res.size !== 1) throw new Error('중앙값이 하나로 정해지지 않음: ' + [...res]); return [...res][0]; };
exp.s114 = [
  [() => mean(coin1), () => med(coin1), () => mode1(coin1), () => '평균', () => minMoves(coin1, 6)],
  [() => mean(coin2), () => med(coin2), () => mode1(coin2), () => '평균', () => minMoves(coin2, 5)],
  [() => med(l25), () => modes(l25).map(x => x + '회').join('와 ')], [() => med(l13), () => mode1(l13)],
  [() => mode1([6, 7, 9, 6, 3, 6, 5]), () => avgMode([6, 7, 9, 6, 5, 6]) ], [() => mode1([8, 5, 7, 8, 14, 8, 6]), () => avgMode([8, 5, 7, 8, 8, 6])],
  [() => 76 * 5, () => wt(76, 74, 75, 74), () => medAll(76, 74, 75, 74, 79)], [() => 66 * 5, () => wt(66, 64, 65, 64), () => medAll(66, 64, 65, 64, 69)]
];

// ---- 중3 산포도(s115~s118)·산점도와 상관관계(s119~s121) ----
const vr = a => mean(a.map(x => (x - mean(a)) ** 2)), sdv = a => Math.sqrt(vr(a));
const rd = (v, d) => Math.round(v * 10 ** d + 1e-9) / 10 ** d;
const zero = dv => { if (Math.abs(sum(dv)) > 1e-9) throw new Error('편차 합이 0이 아님: ' + dv); return dv; };
const ssq = a => sum(a.map(x => (x - mean(a)) ** 2));
const xfind = d => -sum(d.filter(v => v !== null));
const small = (a, b, na, nb) => vr(a) < vr(b) ? na : nb;
const hd = [8, 5, 3, 7, 5, 2], hd2 = [9, 4, 6, 8, 3, 6];
const dev3 = a => [() => a[0] - mean(a), () => a[2] - mean(a), () => sum(a.map(x => x - mean(a)))];
const four2 = a => [() => mean(a), () => ssq(a), () => vr(a), () => sdv(a)];
exp.s115 = [dev3(hd), [() => hd2[0] - mean(hd2), () => hd2[1] - mean(hd2), () => sum(hd2.map(x => x - mean(hd2)))],
  [() => mean([1, 0, 3, 3, 5, 3, 4, 4, 2, 3]), () => ssq([1, 0, 3, 3, 5, 3, 4, 4, 2, 3]), () => vr([1, 0, 3, 3, 5, 3, 4, 4, 2, 3]), () => sdv([1, 0, 3, 3, 5, 3, 4, 4, 2, 3])],
  four2([8, 5, 11, 9, 7]),
  [() => mean([25, 24, 26, 28, 27, 22, 23]), () => vr([25, 24, 26, 28, 27, 22, 23])], [() => mean([12, 15, 11, 14, 13]), () => vr([12, 15, 11, 14, 13])],
  [() => mean([6, 9, 5, 8, 7]), () => vr([6, 9, 5, 8, 7]), () => rd(sdv([6, 9, 5, 8, 7]), 1)], [() => mean([10, 14, 12, 15, 9]), () => vr([10, 14, 12, 15, 9]), () => rd(sdv([10, 14, 12, 15, 9]), 1)]
];
exp.s116 = [
  () => -(-4 + 2 - 3 + 6), () => -(2 - 3 + 1 + 4), () => -(5 - 2 + 3 - 4 - 1), () => -(-3 + 4 - 2 - 1 + 0),
  [() => -(1 + 2 - 1 + 0), () => 72 + -(1 + 2 - 1 + 0)], [() => -(4 - 3 + 3 - 1), () => 78 + -(4 - 3 + 3 - 1)],
  [() => 3, () => vr(zero([1, -1, 3, -3, 0])), () => sdv([1, -1, 3, -3, 0])], [() => 1, () => vr(zero([2, -2, -1, 1, 0])), () => rd(sdv([2, -2, -1, 1, 0]), 2)],
  [() => vr(zero([-3, 1, -6, 5, 3])), () => sdv([-3, 1, -6, 5, 3])], [() => vr(zero([-3, -1, 0, 1, 3])), () => sdv([-3, -1, 0, 1, 3])]
];
const jin = [9, 7, 6, 6, 9, 6, 7, 6, 6, 8], hyun = [6, 7, 7, 6, 8, 7, 7, 7, 7, 8];
const cmp = (a, b, na, nb) => [() => mean(a), () => mean(b), () => vr(a), () => vr(b), () => small(a, b, na, nb)];
const eA = [60, 62, 61, 58, 58, 59, 63, 59], eB = [59, 64, 62, 63, 56, 57, 61, 58], eC = [15, 17, 16, 19, 13, 14, 18, 16], eD = [12, 18, 17, 15, 19, 14, 16, 17];
const skA = [34.42, 34.77, 34.86, 35.08, 34.62], skB = [34.74, 35.01, 34.42, 34.45, 35.13], swC = [50.1, 50.3, 50.2, 50.4, 50.0], swD = [50.0, 50.6, 50.1, 50.5, 49.8];
const best = (m, n) => n[m.indexOf(Math.max(...m))], tight = (s, n) => n[s.indexOf(Math.min(...s))];
exp.s117 = [cmp(jin, hyun, '진수', '현지'), cmp([7, 9, 8, 6, 10], [8, 8, 7, 9, 8], '소라', '지우'),
  [() => rd(sdv(eA), 2), () => rd(sdv(eB), 2), () => small(eA, eB, 'A 상자', 'B 상자')], [() => rd(sdv(eC), 2), () => rd(sdv(eD), 2), () => small(eC, eD, 'C 상자', 'D 상자')],
  [() => rd(sdv(skA), 2), () => rd(sdv(skB), 2), () => small(skA, skB, '선수 A', '선수 B')], [() => rd(sdv(swC), 2), () => rd(sdv(swD), 2), () => small(swC, swD, '선수 C', '선수 D')],
  [() => vr([6, 7, 7, 10, 10]), () => vr([5, 5, 5, 7, 8]), () => small([6, 7, 7, 10, 10], [5, 5, 5, 7, 8], 'A 모둠', 'B 모둠')], [() => vr([4, 6, 7, 8, 10]), () => vr([6, 6, 7, 8, 8]), () => small([4, 6, 7, 8, 10], [6, 6, 7, 8, 8], 'C 모둠', 'D 모둠')],
  [() => best([75, 67, 66], ['A반', 'B반', 'C반']), () => tight([7.5, 9.8, 5.3], ['A반', 'B반', 'C반'])], [() => best([70, 74, 72], ['가반', '나반', '다반']), () => tight([6.2, 8.8, 4.1], ['가반', '나반', '다반'])]
];
if (!eq(mean(eA), 60) || !eq(mean(eB), 60) || !eq(mean(eC), 16) || !eq(mean(eD), 16)) fail('달걀·귤 상자 평균이 같지 않음');
if (!eq(mean(skA), mean(skB)) || !eq(mean(swC), mean(swD))) fail('기록 평균이 같지 않음');
const rainOk = (known, mo, tot) => tot - sum(known);
const solve2ab = (fixed, m) => { const r = []; for (let a = -30; a <= 60; a++) for (let b2 = a + 1; b2 <= 60; b2++) { const arr = [...fixed, a, b2]; if (eq(mean(arr), m) && eq(med(arr), m)) r.push([a, b2]); } if (r.length !== 1) throw new Error('(a, b)가 하나로 정해지지 않음: ' + JSON.stringify(r)); return r[0]; };
const truthIdx = (dv, stm) => { const f = stm.map((s, i) => s(dv) ? null : i).filter(i => i !== null); if (f.length !== 1) throw new Error('옳지 않은 것이 하나가 아님: ' + f); return f[0]; };
const names = ['A', 'B', 'C', 'D'], order = dv => dv.map((d, i) => [d, names[i]]).sort((p, q) => p[0] - q[0]).map(p => p[1]).join(',');
const stm1 = [d => d[0] === Math.max(...d), d => d[1] < 0, d => d[0] - d[3] === 7, d => d[2] === 0, d => order(d) === 'B,C,D,A'];
const stm2 = [d => d[0] === Math.min(...d), d => d[1] > 0, d => d[2] === d[3], d => d[1] - d[0] === 6, d => d.includes(0)];
const o1 = ['① A의 점수가 가장 높다.', '② B는 평균보다 낮은 점수를 받았다.', '③ A는 D보다 점수가 7점 높다.', '④ C는 평균 점수를 받았다.', '⑤ 점수가 낮은 학생부터 차례대로 나열하면 B, C, D, A이다.'];
const o2 = ['① A의 점수가 가장 낮다.', '② B는 평균보다 높은 점수를 받았다.', '③ C와 D의 점수는 같다.', '④ B는 A보다 점수가 6점 높다.', '⑤ 평균 점수를 받은 학생이 있다.'];
const mt = (m, v) => { const sq = 3 * (v + m * m); if ((3 * m) ** 2 / 3 > sq + 1e-9) throw new Error('직육면체 조건 불가능'); return [3 * m, sq]; };
exp.s118 = [
  [() => rainOk([11, 7, 10, 8, 11], 0, 60), () => vr([11, 7, 10, 8, 13, 11]), () => sdv([11, 7, 10, 8, 13, 11])], [() => rainOk([6, 9, 8, 5], 0, 35), () => vr([6, 9, 7, 8, 5]), () => rd(sdv([6, 9, 7, 8, 5]), 2)],
  [() => solve2ab([2, 1, 8], 5).reduce((x, y) => x + y), () => solve2ab([2, 1, 8], 5)[0], () => vr([2, ...solve2ab([2, 1, 8], 5), 1, 8])],
  [() => solve2ab([1, 3, 7], 5).reduce((x, y) => x + y), () => solve2ab([1, 3, 7], 5)[0], () => vr([1, 3, 7, ...solve2ab([1, 3, 7], 5)])],
  [() => -sum([5, -3, -2]), () => o1[truthIdx([5, -3, 0, -2], stm1)]], [() => -sum([-4, 2, 1]), () => o2[truthIdx([-4, 2, 1, 1], stm2)]],
  [() => mt(10, 4)[0], () => mt(10, 4)[1]], [() => mt(8, 3)[0], () => mt(8, 3)[1]]
];

// ---- 산점도와 상관관계: 점 좌표(pts)에서 상관계수·개수를 다시 계산 ----
const pear = p => { const n = p.length, mx = mean(p.map(a => a[0])), my = mean(p.map(a => a[1])); return sum(p.map(a => (a[0] - mx) * (a[1] - my))) / Math.sqrt(sum(p.map(a => (a[0] - mx) ** 2)) * sum(p.map(a => (a[1] - my) ** 2))); };
const KINDS = ['양의 상관관계', '음의 상관관계', '상관관계가 없다'];
const kindOf = p => { const r = pear(p); return r > 0.5 ? KINDS[0] : r < -0.5 ? KINDS[1] : Math.abs(r) < 0.3 ? KINDS[2] : (() => { throw new Error('상관관계가 애매함 r=' + r); })(); };
const trendOf = (p, pos, neg) => pear(p) > 0.5 ? pos : pear(p) < -0.5 ? neg : '?';
const yAt = (p, x) => { const r = p.filter(a => Math.abs(a[0] - x) < 1e-9).map(a => a[1]); if (r.length !== 1) throw new Error('x=' + x + '인 점이 하나가 아님'); return r[0]; };
const yMax = (p, x) => Math.max(...p.filter(a => Math.abs(a[0] - x) < 1e-9).map(a => a[1]));
const PQ = id => lessons.find(l => l.id === id).qs.map(q => q.pts);
const [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11] = PQ('s119');
const HL = ['높다', '낮다', '관계가 없다'], UD = ['증가하는 경향이 있다', '감소하는 경향이 있다', '변화가 없다'];
exp.s119 = [
  [() => yAt(p0, 30), () => trendOf(p0, '높다', '낮다')], [() => yAt(p1, 1500), () => trendOf(p1, '높다', '낮다')],
  [() => yAt(p2, 54), () => trendOf(p2, UD[0], UD[1])], [() => yAt(p3, 14), () => trendOf(p3, UD[0], UD[1])],
  [() => yMax(p4, 5), () => trendOf(p4, UD[0], UD[1])], [() => yAt(p5, 160), () => trendOf(p5, UD[0], UD[1])],
  [() => yAt(p6, 500), () => kindOf(p6)], [() => yAt(p7, 30), () => kindOf(p7)], [() => yAt(p8, 58), () => kindOf(p8)],
  [() => yAt(p9, 3), () => kindOf(p9)], [() => yAt(p10, 0.4), () => kindOf(p10)], [() => yAt(p11, 2.0), () => kindOf(p11)]
];
const [q0, q1, q2, q3, q4, q5, q6] = PQ('s120');
const both = (p, t) => p.filter(a => a[0] >= t && a[1] >= t).length;
exp.s120 = [
  [() => kindOf(q0), () => both(q0, 60)], [() => kindOf(q1), () => both(q1, 70)],
  [() => q2.filter(a => a[1] > a[0]).length, () => q2.filter(a => a[1] === a[0]).length / q2.length * 100], [() => q3.filter(a => a[1] > a[0]).length, () => q3.filter(a => a[1] === a[0]).length / q3.length * 100],
  [() => yMax(q4, Math.max(...q4.map(a => a[0]))), () => kindOf(q4)], [() => yAt(q5, 300), () => kindOf(q5)], [() => yMax(q6, 35), () => kindOf(q6)]
];
const strength = p => Math.abs(pear(p)) >= 0.9 ? '강하다' : '약하다';
const [r0, r1, r2, r3, r4, r5] = PQ('s121');
exp.s121 = [[() => kindOf(r0), () => strength(r0)], [() => kindOf(r1), () => strength(r1)], [() => kindOf(r2), () => strength(r2)], [() => kindOf(r3), () => strength(r3)], [() => kindOf(r4)], [() => kindOf(r5)],
  [() => '아이스크림 판매량이 물놀이 사고의 원인이라고 단정했다.', () => '두 변량이 모두 최고 기온과 양의 상관관계가 있기 때문이다.'], [() => '상관관계가 있다고 해서 에어컨 판매가 식중독의 원인이라고 단정했다.']];
const val = (sp, i, k) => sp.opts ? sp.opts[sp.ans] : sp.ans;
lessons.forEach(l => {
  const E = exp[l.id]; if (!E) return fail(l.id + ': 검증식 없음');
  if (E.length !== l.qs.length) fail(l.id + ': 문항 수 불일치');
  l.qs.forEach((q, i) => {
    const e = E[i];
    if (q.steps) q.steps.forEach((s, k) => { const r = e[k](), got = val(s, i, k); (typeof r === 'number' ? eq(r, got) : r === got) ? ok(`${l.id} ${i + 1}번 ${k + 1}단계 = ${got}`) : fail(`${l.id} ${i + 1}번 ${k + 1}단계 기대 ${r} / 데이터 ${got}`); });
    else { const r = e(), got = val(q, i); (typeof r === 'number' ? eq(r, got) : r === got) ? ok(`${l.id} ${i + 1}번 = ${got}`) : fail(`${l.id} ${i + 1}번 기대 ${r} / 데이터 ${got}`); }
    const specs = q.steps ? q.steps : [q];
    specs.forEach(s => { if (s.opts && new Set(s.opts).size !== s.opts.length) fail(`${l.id} ${i + 1}번 보기 중복`); if (!(s.hints || s.hint)) fail(`${l.id} ${i + 1}번 힌트 없음`); if (!s.why) fail(`${l.id} ${i + 1}번 풀이 없음`); });
  });
});

// 2) 선분 표기는 알파벳순 (HB, CA 같은 표기 금지). 두 글자 대문자 연속은 선분/각 이름이므로 정렬 확인
const texts = [];
const walk = o => { if (typeof o === 'string') texts.push(o); else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => k !== 'fig' && walk(v)); };
walk(lessons);
const segRe = /(?<![A-Z])([A-Z])([A-Z])(?![A-Z])/g; let n = 0;
texts.forEach(t => { for (const m of t.matchAll(segRe)) { n++; if (m[1] > m[2]) fail(`선분 표기 알파벳순 위반: "${m[0]}" in "${t.slice(0, 40)}"`); } });
ok(`선분 표기 ${n}곳 점검`);

// 3) catalog.json = 데이터와 일치
const cat = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const nz = s => String(s).replace(/\./g, '').replace(/\s+/g, ' ').trim();
cat.app === 'solve' ? ok('catalog.app = solve') : fail('catalog.app');
if (cat.lessons.length !== lessons.length) fail('catalog 항목 수가 데이터와 다름');
lessons.forEach(l => { const c = cat.lessons.find(x => x.id === l.id); if (!c) return fail(`catalog에 ${l.id} 없음`);
  ['label', 'title', 'el'].forEach(k => c[k] !== l[k] && fail(`catalog ${l.id}.${k}: "${c[k]}" ≠ "${l[k]}"`)); nz(c.unit) !== nz(l.unitName) && fail(`catalog ${l.id}.unit: "${c.unit}" ≠ "${l.unitName}"`); });
ok('catalog.json ↔ 데이터 점검');

// 4) 개념 탐구 노트와 평가 요소(el) 공유 확인 (저장소가 옆에 있을 때)
const cp = '/home/claude/mathland25/mathconcept/catalog.json';
if (fs.existsSync(cp)) { const cc = JSON.parse(fs.readFileSync(cp, 'utf8')); lessons.forEach(l => { if (!l.concept.id) return; const c = cc.lessons.find(x => x.id === l.concept.id); c && c.el === l.el ? ok(`${l.id} el = 개념 노트 ${l.concept.id} ("${l.el}")`) : fail(`${l.id} el이 개념 노트와 다름`); }); }

// 5) 제출 코드 왕복: GN2z.<base64url(deflate-raw(JSON))>
(async () => {
  const rep = { v: 2, app: 'solve', id: 'p1', name: '홍길동', cls: '2-1', at: Date.now(), day: '2026-10-19', ls: { s06: { s: 2, d: 1, c: [7, 8], p: '대체로 알아요', r: ['한 줄', ''], u: 1, k: 8, w: { 1: 2 }, hn: 1, ss: [4, 5] } } };
  const bytes = new TextEncoder().encode(JSON.stringify(rep)), cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(bytes); w.close();
  const z = new Uint8Array(await new Response(cs.readable).arrayBuffer()), code = 'GN2z.' + Buffer.from(z).toString('base64url');
  const m = /^GN2(z?)\.([A-Za-z0-9_-]+)$/.exec(code); const ds = new DecompressionStream('deflate-raw'), w2 = ds.writable.getWriter(); w2.write(Buffer.from(m[2], 'base64url')); w2.close();
  const back = JSON.parse(new TextDecoder().decode(new Uint8Array(await new Response(ds.readable).arrayBuffer())));
  JSON.stringify(back) === JSON.stringify(rep) && back.app === 'solve' && back.ls.s06.d === 1 && back.ls.s06.c.length === 2 ? ok(`제출 코드 왕복 (${code.length}자)`) : fail('제출 코드 왕복');
  console.log(bad ? `\n실패 ${bad}건` : '\n모두 통과'); process.exit(bad ? 1 : 0);
})();
