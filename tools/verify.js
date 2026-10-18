// 사용법: node tools/verify.js   (정답·표기·catalog.json·제출 코드 규칙을 점검한다)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const stub = new Proxy({}, { get: () => () => null });
const win = { SF: stub }; win.window = win;
vm.createContext(win);
fs.readdirSync(path.join(root, 'data')).filter(f => f.endsWith('.js')).forEach(f => vm.runInContext(fs.readFileSync(path.join(root, 'data', f), 'utf8'), win));
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
if (fs.existsSync(cp)) { const cc = JSON.parse(fs.readFileSync(cp, 'utf8')); lessons.forEach(l => { const c = cc.lessons.find(x => x.id === l.concept.id); c && c.el === l.el ? ok(`${l.id} el = 개념 노트 ${l.concept.id} ("${l.el}")`) : fail(`${l.id} el이 개념 노트와 다름`); }); }

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
