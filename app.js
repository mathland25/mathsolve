/* 문제해결 플랫폼 — 개념 탐구 노트에서 개념을 익힌 뒤 적용·응용 문제를 푸는 앱
   서버·로그인 없이 기기(localStorage)에 저장하고, 구글 폼으로 제출한다. */
(() => {
'use strict';
const { h } = window.SF;
const GRADES = window.SOLVE_GRADES || [], CAUSES = window.SOLVE_CAUSES || [];
const TEACHER_ONLY = !!window.__TEACHER_ONLY;
const KEY = 'solve-v1', TKEY = 'solve-teacher-v1';
const APP = 'solve';
const CONCEPT_URL = 'https://mathland25.github.io/mathconcept/';
/* 구글 폼 / 응답 시트: 개념 탐구 노트와 같은 것을 공유한다 */
const FORM = { action: 'https://docs.google.com/forms/d/e/1FAIpQLSfAkQAEwjacgFf4YnDSVAsvu6KTlMedfOyeA4vDSFv3-7luBQ/formResponse', entry: 'entry.1381249599' };
const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyOJTJaDyblGIOZwX4RYLuB9S9DDGTJkszb-Kz7tVMbLt_6-SDL8XY2_kAk3oPToZRu6sZVddAVKz4/pub?gid=93813440&single=true&output=csv';
const STAGES = ['핵심 정리', '문제 풀이', '마무리'];
const CONF = ['잘 모르겠어요', '조금 헷갈려요', '대체로 알아요', '자신 있어요'];
const LVN = { 1: '기본', 2: '적용', 3: '응용', 4: '서술형' };

const LESSONS = [];
GRADES.forEach(g => g.units.forEach(u => u.lessons.forEach(l => { Object.assign(l, { grade: g.id, gradeLabel: g.label, unitId: u.id, unitName: u.name }); LESSONS.push(l); })));
const lessonOf = id => LESSONS.find(l => l.id === id);

let DB = { v: 1, cur: null, profiles: [], grade: null }, TD = { v: 1, students: {} };
let view = 'home', vparam = null, tsel = null, tcls = '전체', toastT = null;
const $ = (s, r = document) => r.querySelector(s);
const pct = v => Math.round(v * 100);
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/* ---------- 학생 식별 (개념 탐구 노트와 같은 규칙): 이름 + 반이 같으면 같은 학생 ---------- */
const skey = r => String(r.name || '').replace(/\s+/g, '').toLowerCase() + '|' + String(r.cls || '').replace(/\s+/g, '').replace(/[학년반]/g, '').replace(/[-–—.]/g, '-').toLowerCase();
function mergeLs(oldR, newR) {
  const out = {}, ids = new Set([...Object.keys(oldR.ls || {}), ...Object.keys(newR.ls || {})]), newer = newR.at >= oldR.at ? newR : oldR;
  ids.forEach(id => { const x = (oldR.ls || {})[id], y = (newR.ls || {})[id]; if (!x || !y) { out[id] = x || y; return; }
    if ((x.d || 0) !== (y.d || 0)) out[id] = x.d ? x : y; else if ((x.s || 0) !== (y.s || 0) || (x.k || 0) !== (y.k || 0)) out[id] = ((x.s || 0) * 100 + (x.k || 0)) > ((y.s || 0) * 100 + (y.k || 0)) ? x : y; else out[id] = newer.ls[id]; });
  return out;
}
function addRep(rep) {
  rep.name = String(rep.name).replace(/\s+/g, ''); rep.cls = String(rep.cls || '').replace(/\s+/g, '');
  let k = skey(rep); const mv = TD.moves && TD.moves[k]; if (mv && TD.students[mv]) { k = mv; rep.cls = TD.students[mv].rep.cls; }
  const ex = TD.students[k];
  if (!ex) { TD.students[k] = { rep, fb: '' }; return 'add'; }
  const nl = mergeLs(ex.rep, rep), newer = rep.at >= ex.rep.at ? rep : ex.rep, merged = { ...newer, ls: nl, at: Math.max(ex.rep.at, rep.at) };
  if (JSON.stringify(nl) === JSON.stringify(ex.rep.ls) && merged.at === ex.rep.at) return null;
  if (JSON.stringify(nl) === JSON.stringify(ex.rep.ls)) { ex.rep.at = merged.at; return null; }
  ex.rep = merged; return 'upd';
}
function moveStudent(key, cls) {
  const x = TD.students[key]; cls = normCls(cls); if (!x || !cls) return null;
  const rep = { ...x.rep, cls }, nk = skey(rep); if (nk === key) return key;
  delete TD.students[key]; (TD.moves = TD.moves || {})[key] = nk;
  const ex = TD.students[nk]; if (!ex) TD.students[nk] = { rep, fb: x.fb }; else { addRep(rep); if (x.fb && !ex.fb) ex.fb = x.fb; }
  tsave(); return nk;
}
function rekeyTD() { const old = TD.students; TD.students = {}; Object.values(old).forEach(x => { const k = skey(x.rep), ex = TD.students[k]; if (!ex) TD.students[k] = x; else { addRep(x.rep); if (x.fb && !TD.students[k].fb) TD.students[k].fb = x.fb; } }); }
function load() { try { const o = JSON.parse(localStorage.getItem(KEY)); if (o && o.profiles) DB = Object.assign(DB, o); } catch (e) { } try { const o = JSON.parse(localStorage.getItem(TKEY)); if (o && o.students) TD = o; } catch (e) { } rekeyTD(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { } }
function tsave() { try { localStorage.setItem(TKEY, JSON.stringify(TD)); } catch (e) { } }
const me = () => DB.profiles.find(p => p.id === DB.cur) || null;

/* ---------- 입력 정리 ---------- */
const normName = s => String(s || '').replace(/\s+/g, '');
function normCls(s) {
  let t = String(s || '').replace(/\s+/g, '').replace(/[.／/–—~]/g, '-'); const m = /^(\d)학년(\d{1,2})반$/.exec(t); if (m) t = m[1] + '-' + m[2];
  return /^[1-3]-\d{1,2}$/.test(t) ? t : '';
}

/* ---------- 학습 상태 ---------- */
const newX = () => ({ tries: 0, hl: 0, hu: false, ok: false, first: false, show: false, cause: null, val: '', pick: null, sub: {} });
function lst(p, id) { return p.ls[id] || (p.ls[id] = { st: 0, qi: 0, q: {}, conf: null, refl: ['', ''], done: false, upd: 0 }); }
const qst = (s, i) => s.q[i] || (s.q[i] = newX());
const started = s => !!s && (s.st > 0 || Object.keys(s.q).length > 0);
const status = (p, l) => { const s = p.ls[l.id]; if (!started(s)) return 'new'; return s.done ? 'done' : 'doing'; };
const solved = (l, s) => l.qs.filter((_, i) => s.q[i] && s.q[i].ok).length;
const firstScore = (l, s) => [l.qs.filter((_, i) => s.q[i] && s.q[i].first).length, l.qs.length];
const hintList = sp => sp.hints || (sp.hint ? [sp.hint] : []);
const lno = l => l.label;

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400); }
function copyText(text, ok) { try { navigator.clipboard.writeText(text).then(() => toast(ok || '복사했어요'), () => toast('복사하지 못했어요. 직접 선택해 복사해 주세요.')); } catch (e) { toast('복사하지 못했어요. 직접 선택해 복사해 주세요.'); } }
const turtle = (n = 34) => h('span', { html: '<svg viewBox="0 0 40 40" width="' + n + '" height="' + n + '" aria-hidden="true"><ellipse cx="20" cy="22" rx="14" ry="10" fill="var(--green)"/><path d="M12 22l4-6h8l4 6-4 6h-8z" fill="none" stroke="var(--paper)" stroke-width="1.6"/><circle cx="35" cy="19" r="4.5" fill="var(--green)"/><circle cx="36.4" cy="17.8" r="1" fill="var(--paper)"/><rect x="9" y="29" width="5" height="6" rx="2" fill="var(--green)"/><rect x="24" y="29" width="5" height="6" rx="2" fill="var(--green)"/><path d="M6 24l-4 3" stroke="var(--green)" stroke-width="3" stroke-linecap="round"/></svg>' });
const brand = () => h('div', { class: 'brand' }, turtle(), h('span', { text: '문제해결 플랫폼' }));

/* ---------- 보고서 / 제출 코드 (통합 교사용 화면과의 약속) ----------
   GN2z.<base64url(deflate-raw(JSON))>   JSON: {v:2, app:'solve', id, name, cls, at, day, ls:{ 항목id:{s,d,c:[첫시도정답수,문항수],p,r,u, k,w,hn,ss} }} */
function makeReport(p) {
  const ls = {};
  Object.keys(p.ls).forEach(id => { const l = lessonOf(id), s = p.ls[id]; if (!l || !started(s)) return;
    const [c, n] = firstScore(l, s), w = {}; let hn = 0;
    l.qs.forEach((_, i) => { const x = s.q[i]; if (!x) return; if (x.cause != null) w[x.cause] = (w[x.cause] || 0) + 1; if (x.hl > 0 || x.hu) hn++; });
    const st = l.qs.map((q, i) => q.steps ? { q, x: s.q[i] } : null).filter(Boolean);
    const ss = st.length ? [st.reduce((a, o) => a + (o.x ? o.q.steps.filter((_, k) => o.x.sub[k] && o.x.sub[k].first).length : 0), 0), st.reduce((a, o) => a + o.q.steps.length, 0)] : undefined;
    ls[id] = { s: s.st, d: s.done ? 1 : 0, c: [c, n], p: s.conf != null ? CONF[s.conf] : '', r: s.refl, u: s.upd, k: solved(l, s), w, hn, ss }; });
  return { v: 2, app: APP, id: p.id, name: p.name, cls: p.cls || '', at: Date.now(), day: today(), ls };
}
const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = str => { const s = atob(str.replace(/-/g, '+').replace(/_/g, '/')), b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; };
async function packReport(p) {
  const bytes = new TextEncoder().encode(JSON.stringify(makeReport(p)));
  if (typeof CompressionStream !== 'undefined') { try { const cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(bytes); w.close(); return 'GN2z.' + b64u(new Uint8Array(await new Response(cs.readable).arrayBuffer())); } catch (e) { } }
  return 'GN2.' + b64u(bytes);
}
async function unpackReport(code) {
  const m = /^GN2(z?)\.([A-Za-z0-9_-]+)$/.exec(code.trim()); if (!m) throw new Error('형식');
  let bytes = unb64u(m[2]);
  if (m[1] === 'z') { const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(bytes); w.close(); bytes = new Uint8Array(await new Response(ds.readable).arrayBuffer()); }
  const rep = JSON.parse(new TextDecoder().decode(bytes));
  if (rep && rep.app !== APP) throw new Error('다른 앱');           // solve가 아닌 코드는 무시
  if (!rep || rep.v !== 2 || !rep.id || !rep.name || typeof rep.ls !== 'object') throw new Error('내용');
  return rep;
}
let sheetBusy = false, sheetAt = 0;
async function importCodes(text) {
  const codes = text.match(/GN2z?\.[A-Za-z0-9_-]+/g) || []; let n = 0, add = 0, upd = 0, bad = 0;
  for (const c of codes) { try { const r = addRep(await unpackReport(c)); n++; if (r === 'add') add++; else if (r === 'upd') upd++; } catch (e) { if (e.message !== '다른 앱') { n++; bad++; } } }
  if (add || upd) tsave(); return { n, add, upd, bad };
}
async function sheetPull(manual) {
  if (!SHEET_CSV || sheetBusy) return; sheetBusy = true;
  try { const r = await fetch(SHEET_CSV + (SHEET_CSV.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
    const res = await importCodes(await r.text()); sheetAt = Date.now();
    if (view === 'teacher' && !tsel && (res.add || res.upd || manual)) render();
    if (manual) toast('시트에서 ' + res.n + '건 확인 · 추가 ' + res.add + '명 · 갱신 ' + res.upd + '명');
  } catch (e) { if (manual) toast('시트를 읽지 못했어요. 게시 설정을 확인해 주세요'); }
  sheetBusy = false;
}
async function formSend(p, quiet) {
  if (!FORM.action || !FORM.entry) return false;
  try {
    const code = await packReport(p), body = new URLSearchParams(); body.append(FORM.entry, code);
    await fetch(FORM.action, { method: 'POST', mode: 'no-cors', body });
    p.sent = Date.now(); save(); if (!quiet) toast('선생님께 제출했어요'); return true;
  } catch (e) { if (!quiet) toast('제출하지 못했어요. 인터넷을 확인하고 다시 눌러 주세요'); return false; }
}

/* ---------- 라우터 ---------- */
function go(v, param) { view = v; vparam = param; render(); window.scrollTo(0, 0); }
function render() {
  const app = $('#app'); app.replaceChildren();
  const p = me();
  if (TEACHER_ONLY) view = 'teacher';
  if (view === 'teacher' && !TEACHER_ONLY) view = DB.cur ? 'home' : 'welcome';
  if (view === 'teacher') return app.append(viewTeacher());
  if (!p) view = 'welcome';
  if (view === 'welcome') return app.append(viewWelcome());
  if (view === 'lesson' && vparam && lessonOf(vparam.id)) return app.append(viewLesson(p, lessonOf(vparam.id)));
  view = 'home'; app.append(viewHome(p));
}

/* ---------- 시작 ---------- */
function viewWelcome() {
  const name = h('input', { class: 'in', id: 'nm', placeholder: '예: 홍길동', maxlength: '12', autocomplete: 'off', 'aria-describedby': 'nmh' });
  const cls = h('input', { class: 'in', id: 'cl', placeholder: '예: 2-1', maxlength: '6', autocomplete: 'off', inputmode: 'text', 'aria-describedby': 'nmh' });
  const go1 = () => { const nm = normName(name.value); if (!nm) { toast('이름을 입력해 주세요'); name.focus(); return; }
    const c = normCls(cls.value); if (!c) { toast('반을 2-1 형식으로 써 주세요 (2학년 1반 → 2-1)'); cls.focus(); return; }
    const old = DB.profiles.find(x => skey(x) === skey({ name: nm, cls: c })); if (old) { DB.cur = old.id; save(); go('home'); return; }
    const p = { id: 'p' + Date.now().toString(36) + Math.floor(Math.random() * 900 + 100), name: nm, cls: c, ls: {}, created: today() };
    DB.profiles.push(p); DB.cur = p.id; save(); go('home'); };
  [name, cls].forEach(el => el.addEventListener('keydown', e => { if (e.key === 'Enter') go1(); }));
  const list = DB.profiles.length ? h('section', { class: 'card' }, h('h2', { class: 'h2', text: '이어서 하기' }), h('div', { class: 'pcards' }, DB.profiles.map(p =>
    h('button', { class: 'btn pcard', onclick: () => { DB.cur = p.id; save(); go('home'); } }, h('b', { text: p.name }), h('span', { class: 'chip gray', text: p.cls || '반 없음' }))))) : null;
  return h('div', { class: 'welcome' }, h('div', { class: 'top' }, brand()),
    h('section', { class: 'card' }, h('h1', { class: 'h1', text: '문제로 개념을 단단하게' }), h('p', { class: 'note', text: '개념 탐구 노트에서 배운 내용을 적용·응용 문제로 확인하고, 틀린 까닭까지 짚어 보는 앱이에요.' }),
      h('div', { class: 'fieldrow' }, h('div', {}, h('label', { class: 'l', for: 'nm', text: '이름' }), name), h('div', {}, h('label', { class: 'l', for: 'cl', text: '반' }), cls)),
      h('p', { class: 'note', id: 'nmh', text: '이름은 띄어쓰기 없이 쓰고, 반은 2-1 형식으로 써 주세요. (2학년 1반 → 2-1) 같은 이름과 반이면 기록이 이어져요.' }),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', text: '시작하기', onclick: go1 }))),
    list, h('p', { class: 'note', text: '학습 기록은 이 기기에만 저장돼요. 다른 기기에서 하면 기록이 따로 쌓여요.' }),
    null);
}

/* ---------- 홈: 학년·단원 선택 ---------- */
function viewHome(p) {
  if (!DB.grade || !GRADES.some(g => g.id === DB.grade)) DB.grade = GRADES[0] && GRADES[0].id;
  const g = GRADES.find(x => x.id === DB.grade) || GRADES[0];
  const mine = LESSONS.filter(l => l.grade === g.id), done = mine.filter(l => status(p, l) === 'done').length;
  const next = mine.find(l => status(p, l) !== 'done');
  const gchips = ['중1', '중2-1', '중2-2', '중3'].map(lab => { const gg = GRADES.find(x => x.label === lab);
    return h('button', { class: 'btn sm' + (gg && gg.id === g.id ? ' primary' : ''), type: 'button', disabled: !gg, text: gg ? lab : lab + ' · 준비 중', onclick: () => { DB.grade = gg.id; save(); render(); } }); });
  return h('div', {}, h('header', { class: 'top' }, brand(), h('div', { class: 'row', style: 'margin:0' },
    h('span', { class: 'chip', text: p.name + ' · ' + p.cls }), h('button', { class: 'btn sm ghost', onclick: () => { DB.cur = null; save(); go('welcome'); }, text: '학생 바꾸기' }))),
    h('section', { class: 'card hero' }, h('div', {}, h('h1', { class: 'h1', text: '오늘은 어떤 문제를 풀어 볼까요?' }),
      h('p', { class: 'note', text: g.label + ' 열린 차시 ' + mine.length + '개 중 ' + done + '개를 끝냈어요. 나머지 차시는 순서대로 열려요.' }),
      h('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': pct(done / (mine.length || 1)), 'aria-valuemin': '0', 'aria-valuemax': '100' }, h('i', { style: 'width:' + pct(done / (mine.length || 1)) + '%' }))),
      next ? h('button', { class: 'btn primary', onclick: () => go('lesson', { id: next.id }), text: (status(p, next) === 'new' ? '시작: ' : '이어서: ') + lno(next) + ' ' + next.title }) : null),
    h('div', { class: 'gradechips', role: 'group', 'aria-label': '학년·학기' }, gchips),
    h('div', { class: 'units' }, g.units.map(u => h('section', { class: 'unit' }, h('h2', { text: u.name }), h('p', { class: 'sub', text: u.sub }),
      h('div', { class: 'lgrid' }, u.lessons.map(l => lcard(p, l)), (u.planned || []).map(pl => h('div', { class: 'lcard soon' }, h('div', { class: 'row', style: 'margin:0;justify-content:space-between' }, h('span', { class: 'no', text: pl[0] }), h('span', { class: 'chip gray', text: '준비 중' })), h('div', { class: 't', text: pl[1] }))))))),
    submitCard(p),
    h('div', { class: 'row' }, h('a', { class: 'btn ghost', href: CONCEPT_URL, target: '_blank', rel: 'noopener', text: '개념 탐구 노트 열기 ↗' }), h('button', { class: 'link', onclick: () => go('teacher'), text: '교사용 화면' })));
}
function lcard(p, l) {
  const st = status(p, l), s = p.ls[l.id];
  const chip = st === 'done' ? h('span', { class: 'chip green', text: '완료 · 첫 시도 ' + firstScore(l, s)[0] + '/' + l.qs.length }) : st === 'doing' ? h('span', { class: 'chip gold', text: '진행 중 ' + solved(l, s) + '/' + l.qs.length }) : h('span', { class: 'chip', text: '시작하기' });
  return h('button', { class: 'lcard' + (st === 'done' ? ' done' : ''), onclick: () => go('lesson', { id: l.id }) },
    h('div', { class: 'row', style: 'margin:0;justify-content:space-between' }, h('span', { class: 'no', text: lno(l) }), chip), h('div', { class: 't', text: l.title }),
    h('div', { class: 'note', style: 'margin:6px 0 0;font-size:12px', text: '시험 범위 · ' + l.el }));
}
function submitCard(p) {
  const out = h('textarea', { class: 'in', rows: '3', readonly: true, hidden: true, 'aria-label': '제출 코드' });
  const copy = h('button', { class: 'btn', type: 'button', hidden: true, text: '코드 복사', onclick: () => { out.select(); copyText(out.value, '복사했어요. 선생님께 보내 주세요'); } });
  const mk = h('button', { class: 'btn', type: 'button', text: '제출 코드 만들기', onclick: async () => { mk.disabled = true; try { out.value = await packReport(p); out.hidden = false; copy.hidden = false; out.select(); } catch (e) { toast('코드를 만들지 못했어요'); } mk.disabled = false; } });
  const last = h('p', { class: 'note', style: 'margin:6px 0 0', text: p.sent ? '마지막 제출: ' + new Date(p.sent).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '아직 제출하지 않았어요.' });
  const send = h('button', { class: 'btn primary', type: 'button', text: '선생님께 제출하기', onclick: async () => { send.disabled = true; const ok = await formSend(p); if (ok) last.textContent = '방금 제출했어요. (차시를 끝낼 때도 자동으로 제출돼요)'; send.disabled = false; } });
  const det = h('details', { style: 'margin-top:10px' }, h('summary', { class: 'note', text: '제출이 안 될 때: 코드로 직접 보내기' }), h('div', { class: 'row', style: 'margin:8px 0 0' }, mk, copy), out);
  return h('section', { class: 'card', style: 'margin-top:14px' }, h('h2', { class: 'h2', text: '선생님께 진도 보내기' }), h('p', { class: 'note', text: '버튼을 한 번 누르면 이름과 풀이 기록이 선생님께 전달돼요. 차시를 끝낼 때도 자동으로 보내요.' }), h('div', { class: 'row', style: 'margin:0' }, send), last, det);
}

/* ---------- 차시 ---------- */
function viewLesson(p, l) {
  const s = lst(p, l.id), box = h('div'), stepper = h('div', { class: 'stepper', role: 'tablist' });
  const touch = () => { s.upd = Date.now(); save(); };
  const unlocked = i => i === 0 || (i === 1 && s.st >= 1) || (i === 2 && s.st >= 2);
  const to = i => { if (i > s.st) s.st = i; s.view = i; touch(); paint(); window.scrollTo(0, 0); };
  const cur = () => (s.view != null ? s.view : s.st);
  function paint() {
    stepper.replaceChildren(...STAGES.map((n, i) => h('button', { type: 'button', role: 'tab', class: (i === cur() ? 'on ' : '') + (i < s.st || s.done ? 'ok' : ''), disabled: !unlocked(i), 'aria-selected': i === cur() ? 'true' : 'false', onclick: () => { s.view = i; paint(); }, text: (i + 1) + ' ' + n })));
    box.replaceChildren([stageCore, stageQs, stageEnd][cur()](p, l, s, to, touch, paint));
  }
  s.view = Math.min(s.st, 2); paint();
  return h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, h('button', { class: 'btn sm ghost', onclick: () => go('home'), text: '← 차시 목록' }), h('b', { text: lno(l) + ' · ' + l.title })), brand()), stepper, box);
}
const cLabel = (l, q) => (q && q.concept !== undefined ? q.concept : l.concept && l.concept.label) || null;
const conceptLink = (l, q) => cLabel(l, q) ? h('a', { class: 'btn sm', href: CONCEPT_URL, target: '_blank', rel: 'noopener', text: '개념 탐구 노트 ' + cLabel(l, q) + ' 다시 보기 ↗' }) : null;
function stageCore(p, l, s, to) {
  return h('div', {}, h('section', { class: 'card sumcard' }, h('span', { class: 'chip', text: '시험 범위 · ' + l.el }), h('h2', { class: 'h2', style: 'margin-top:8px', text: '핵심 정리: ' + l.title }),
    l.core.defs.map(([a, b]) => h('div', { class: 'def' }, h('b', { text: a }), ' — ' + b)),
    h('ul', { class: 'points' }, l.core.points.map(t => h('li', { text: t }))), h('div', { class: 'fb hint', text: '주의: ' + l.core.note }),
    (l.concepts || [cLabel(l)]).filter(Boolean).length ? h('div', { class: 'row' }, (l.concepts || [cLabel(l)]).filter(Boolean).map(c => conceptLink(l, { concept: c }))) : null),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', text: '문제 풀기', onclick: () => to(1) })));
}

/* 숫자 답 읽기: 15, 3.2, 16/5, "15 cm", "12π" 모두 허용 */
function normNum(str) {
  const t = String(str).replace(/[−–]/g, '-').replace(/[,\s]/g, '').trim(); const f = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/.exec(t);
  if (f) return parseFloat(f[1]) / parseFloat(f[2]);
  const m = /^-?\d+(\.\d+)?/.exec(t); return m ? parseFloat(m[0]) : NaN;
}
const judge = (sp, v) => { if (sp.opts) return v === sp.ans; const n = normNum(v); return isNaN(n) ? null : Math.abs(n - sp.ans) < 1e-9; };
function attempt(x, sp, v) {
  if (x.ok) return null; const g = judge(sp, v); if (g === null) { toast('숫자로 답을 써 주세요'); return null; }
  if (sp.opts) x.pick = v; else x.val = String(v);
  if (g) { if (x.tries === 0 && !x.hu) x.first = true; x.ok = true; } else { x.tries++; x.hl = Math.max(x.hl, Math.min(x.tries, hintList(sp).length)); }
  return g;
}
/* 답 입력 + 힌트 + 풀이 보기 한 덩어리 (일반 문제와 서술형 단계가 함께 쓴다) */
function answerBlock(sp, x, rp, after) {
  let ctrl; const hs = hintList(sp), done = x.ok || x.show;
  const fire = v => { attempt(x, sp, v); after && after(); rp(); };
  if (sp.opts) ctrl = h('div', { class: 'opts' }, sp.opts.map((o, j) => h('button', { type: 'button', class: 'opt' + (x.ok && j === sp.ans ? ' good' : x.pick === j && !x.ok ? ' bad' : ''), disabled: done, text: o, onclick: () => fire(j) })));
  else { const inp = h('input', { class: 'in', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '답', value: x.val || '', disabled: done });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') fire(inp.value); });
    ctrl = h('div', { class: 'ans' }, inp, sp.unit ? h('span', { text: sp.unit }) : null, h('button', { class: 'btn', type: 'button', disabled: done, text: '확인', onclick: () => fire(inp.value) })); }
  return h('div', {}, ctrl,
    hs.slice(0, x.hl).map((t, i) => h('div', { class: 'fb hint', text: '힌트 ' + (i + 1) + ' · ' + t })),
    x.ok ? h('div', { class: 'fb good', text: (x.show ? '정답 확인: ' : '정답! ') + sp.why }) : x.tries ? h('div', { class: 'fb bad', text: '아쉬워요. 다시 생각해 볼까요?' }) : null,
    !done ? h('div', { class: 'row', style: 'margin-top:8px' },
      x.hl < hs.length ? h('button', { class: 'btn sm', type: 'button', text: '힌트 보기', onclick: () => { x.hl++; x.hu = true; rp(); } }) : null,
      x.tries >= 2 ? h('button', { class: 'btn sm', type: 'button', text: '풀이 보기', onclick: () => { x.show = true; x.ok = true; after && after(); rp(); } }) : null) : null);
}
function stageQs(p, l, s, to, touch, paintAll) {
  const i = Math.min(s.qi || 0, l.qs.length - 1), q = l.qs[i], x = qst(s, i);
  const wrap = h('div'), dots = h('div', { class: 'pdots', role: 'group', 'aria-label': '문제 번호' });
  const allOk = () => l.qs.every((_, k) => s.q[k] && s.q[k].ok);
  const rp = () => { touch(); paintAll(); };
  const syncSteps = () => { if (!q.steps) return; q.steps.forEach((_, k) => { x.sub[k] = x.sub[k] || newX(); }); const subs = q.steps.map((_, k) => x.sub[k]);
    x.tries = subs.reduce((a, o) => a + o.tries, 0); x.ok = subs.every(o => o.ok); x.first = x.ok && subs.every(o => o.first); };
  dots.append(...l.qs.map((_, k) => h('button', { type: 'button', class: (k === i ? 'on ' : '') + (s.q[k] && s.q[k].ok ? 'ok' : ''), 'aria-label': (k + 1) + '번 문제' + (s.q[k] && s.q[k].ok ? ' 완료' : ''), 'aria-current': k === i ? 'true' : 'false', text: k + 1, onclick: () => { s.qi = k; touch(); paintAll(); } })));
  let body;
  if (q.steps) {
    q.steps.forEach((_, k) => { x.sub[k] = x.sub[k] || newX(); });
    body = h('div', {}, q.steps.map((st, k) => (k === 0 || x.sub[k - 1].ok) ? h('div', { class: 'stepq' }, h('p', { style: 'font-weight:600;margin:0 0 8px', text: st.q }), answerBlock(st, x.sub[k], rp, syncSteps)) : null));
  } else body = answerBlock(q, x, rp);
  const wrong = x.tries > 0 && !x.ok;
  const cause = wrong ? h('div', { class: 'card', style: 'margin-top:10px' }, h('b', { text: '왜 틀렸을까요?' }), h('p', { class: 'note', style: 'margin:2px 0 0', text: '골라 두면 선생님이 어디를 도와줄지 알 수 있어요. (선택)' }),
    h('div', { class: 'causes' }, CAUSES.map((c, j) => h('button', { type: 'button', class: 'opt' + (x.cause === j ? ' sel' : ''), 'aria-pressed': x.cause === j ? 'true' : 'false', text: c, onclick: () => { x.cause = j; rp(); } })))) : null;
  const link = x.cause === 0 && x.tries > 0 && cLabel(l, q) ? h('div', { class: 'fb hint' }, '개념부터 다시 확인해 봐요. ', conceptLink(l, q)) : null;
  const last = i === l.qs.length - 1;
  const nav = h('div', { class: 'row' },
    i > 0 ? h('button', { class: 'btn', type: 'button', text: '← 이전', onclick: () => { s.qi = i - 1; touch(); paintAll(); window.scrollTo(0, 0); } }) : null,
    !last ? h('button', { class: 'btn primary', type: 'button', disabled: !x.ok, text: '다음 문제', onclick: () => { s.qi = i + 1; touch(); paintAll(); window.scrollTo(0, 0); } })
      : h('button', { class: 'btn primary', type: 'button', disabled: !allOk(), text: '마무리하러 가기', onclick: () => to(2) }),
    last && !allOk() ? h('span', { class: 'note', style: 'margin:0', text: '아직 풀지 않은 문제가 있어요.' }) : null);
  wrap.append(dots, h('section', { class: 'card' }, h('div', { class: 'row', style: 'margin:0 0 8px' }, h('span', { class: 'lv lv' + q.lv, text: 'Lv' + q.lv + ' ' + (q.lvn || LVN[q.lv]) }), q.tag ? h('span', { class: 'chip gray', text: q.tag }) : null, h('span', { class: 'note', style: 'margin:0', text: (i + 1) + ' / ' + l.qs.length })),
    h('div', { class: 'qt', style: 'font-weight:600;margin-bottom:4px', text: q.q }), q.fig ? q.fig() : null, body, link), ...(cause ? [cause] : []), nav);
  return wrap;
}
function stageEnd(p, l, s, to, touch, paintAll) {
  const [c, n] = firstScore(l, s), box = h('div'), nb = h('div');
  const wrongs = l.qs.map((q, i) => ({ q, i, x: s.q[i] })).filter(o => o.x && !o.x.first);
  const finish = () => { s.done = true; touch(); formSend(p, true); paintAll(); };
  const summary = h('section', { class: 'card' }, h('h2', { class: 'h2', text: '오늘 푼 결과' }),
    h('p', { style: 'margin:0', text: '첫 시도 정답 ' + c + ' / ' + n + '문항' }),
    wrongs.length ? h('div', {}, h('p', { class: 'note', text: '다시 보면 좋은 문제: ' + wrongs.map(o => (o.i + 1) + '번').join(', ') }), h('div', { class: 'row' }, [...new Set(wrongs.map(o => cLabel(l, o.q)))].filter(Boolean).map(c => conceptLink(l, { concept: c })))) : h('p', { class: 'note', text: '모두 첫 시도에 맞혔어요!' }));
  const conf = h('section', { class: 'card', style: 'margin-top:12px' }, h('b', { text: '이 차시의 문제, 얼마나 자신 있나요?' }),
    h('div', { class: 'opts', style: 'margin-top:8px' }, CONF.map((o, j) => h('button', { type: 'button', class: 'opt' + (s.conf === j ? ' sel' : ''), 'aria-pressed': s.conf === j ? 'true' : 'false', disabled: s.done, text: o, onclick: () => { s.conf = j; touch(); paintAll(); } }))));
  const mk = (idx, lab, ph) => { const ta = h('textarea', { class: 'in', id: 'r' + idx, placeholder: ph, 'aria-label': lab, disabled: s.done }); ta.value = s.refl[idx] || '';
    ta.addEventListener('input', () => { s.refl[idx] = ta.value; s.upd = Date.now(); save(); }); return h('div', { class: 'card', style: 'margin-top:12px' }, h('label', { class: 'l', for: 'r' + idx, style: 'font-size:1rem;color:var(--ink)', text: lab }), ta); };
  box.append(mk(0, '오늘 새로 알게 된 점 한 줄 (선택)', '예: 닮음비를 구할 때는 대응변을 먼저 찾아야 한다'), mk(1, '아직 헷갈리는 점 (선택)', '없으면 비워 두어도 돼요'));
  nb.append(s.done ? h('div', { class: 'card done-box', style: 'margin-top:12px' }, h('div', { class: 'stamp', text: '○' }), h('div', {}, h('b', { text: lno(l) + ' 문제 풀이를 끝냈어요!' }), h('p', { class: 'note', style: 'margin:2px 0 0', text: '선생님께 자동으로 제출했어요. (홈 화면에서 다시 제출할 수 있어요)' })), h('button', { class: 'btn primary', onclick: () => go('home'), text: '차시 목록으로' }))
    : h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', disabled: s.conf == null, text: '이 차시 끝내기', onclick: finish }), s.conf == null ? h('span', { class: 'note', style: 'margin:0', text: '자신 있는 정도를 골라 주세요.' }) : null));
  return h('div', {}, summary, conf, box, nb);
}

/* ---------- 교사용 ---------- */
const readyLessons = () => LESSONS;
function analyze(rep) {
  const rows = readyLessons().map(l => ({ l, r: rep.ls[l.id] })), done = rows.filter(x => x.r && x.r.d).length;
  const tot = rows.reduce((a, x) => a + (x.r && x.r.d ? x.r.c[1] : 0), 0), ok = rows.reduce((a, x) => a + (x.r && x.r.d ? x.r.c[0] : 0), 0);
  return { rows, done, tot, ok };
}
const cell = (x) => !x.r ? h('span', { class: 'cell n', text: '–' }) : x.r.d ? h('span', { class: 'cell d', text: '✓ ' + x.r.c[0] + '/' + x.r.c[1] }) : h('span', { class: 'cell p', text: (x.r.k || 0) + '/' + x.r.c[1] });
function elTable(list) {
  const els = readyLessons().filter(l => l.el); if (!els.length || !list.length) return null;
  return h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '평가 요소별 현황' }), h('div', { class: 'tscroll' }, h('table', { class: 'mx' },
    h('thead', {}, h('tr', {}, h('th', { text: '평가 요소' }), h('th', { text: '차시' }), h('th', { text: '완료' }), h('th', { text: '첫 시도 정답률' }))),
    h('tbody', {}, els.map(l => { let d = 0, ok = 0, n = 0; list.forEach(a => { const x = a.rows.find(y => y.l.id === l.id); if (x && x.r && x.r.d) { d++; ok += x.r.c[0]; n += x.r.c[1]; } });
      const rate = n ? ok / n : null;
      return h('tr', {}, h('td', { text: l.el }), h('td', { text: lno(l) }), h('td', { text: d + '/' + list.length }), h('td', {}, rate == null ? '–' : h('span', { class: 'cell ' + (rate < .6 ? 'p' : 'd'), text: pct(rate) + '%' }))); })))));
}
function causeTally(rows) {
  const t = {}; rows.forEach(x => { if (x.r && x.r.w) Object.entries(x.r.w).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; }); });
  return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => (CAUSES[k] || '기타') + ' ' + v);
}
function essayText(list) {
  const out = [];
  list.forEach(r => readyLessons().forEach(l => { const x = r.rep.ls[l.id]; if (!x) return; const a = (x.r && x.r[0] || '').trim(), b = (x.r && x.r[1] || '').trim(); if (!a && !b) return;
    out.push('[' + (r.rep.cls || '반 없음') + ' ' + r.rep.name + ' · ' + lno(l) + ']' + (a ? '\n한 줄 정리: ' + a : '') + (b ? '\n헷갈리는 점: ' + b : '')); }));
  return out.join('\n\n');
}
function viewTeacher() {
  const rec = tsel && TD.students[tsel];
  const wrap = h('div', {}, h('header', { class: 'top' }, h('div', { class: 'row', style: 'margin:0' }, (rec || !TEACHER_ONLY) ? h('button', { class: 'btn sm ghost', onclick: () => { if (rec) { tsel = null; render(); } else go(DB.cur ? 'home' : 'welcome'); }, text: rec ? '← 학급 목록' : '← 학생 화면' }) : null, h('b', { text: rec ? rec.rep.name + ' 학생' : '교사용 · 문제해결 학급 진도' })), brand()));
  if (SHEET_CSV && !rec) wrap.append(h('div', { class: 'row' }, h('button', { class: 'btn sm', type: 'button', text: '시트에서 새로고침', onclick: () => sheetPull(true) }), h('span', { class: 'note', style: 'margin:0', text: '열 때 자동으로 가져와요 (이 앱의 기록만 읽어요)' })));
  if (rec) { wrap.append(...teacherDetail(rec)); return wrap; }
  const rows = Object.keys(TD.students).map(k => ({ key: k, rep: TD.students[k].rep, a: analyze(TD.students[k].rep) })).sort((a, b) => ((a.rep.cls ? 0 : 1) - (b.rep.cls ? 0 : 1)) || (a.rep.cls || '').localeCompare(b.rep.cls || '', 'ko', { numeric: true }) || a.rep.name.localeCompare(b.rep.name, 'ko'));
  const ready = readyLessons();
  const ta = h('textarea', { class: 'in', id: 't-in', rows: '3', placeholder: '학생이 보낸 제출 코드를 붙여 넣으세요. 여러 명이면 줄을 바꿔 한꺼번에 붙여도 돼요.', 'aria-label': '제출 코드' });
  const imp = h('button', { class: 'btn primary', type: 'button', text: '불러오기', onclick: async () => {
    const res = await importCodes(ta.value); if (!res.n) { toast('이 앱의 제출 코드를 찾지 못했어요'); return; } const { add, upd, bad } = res;
    render(); toast('추가 ' + add + '명 · 갱신 ' + upd + '명' + (bad ? ' · 읽지 못함 ' + bad : '')); } });
  if (SHEET_CSV && !sheetAt) setTimeout(() => sheetPull(false), 0);
  const importCard = h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '제출 코드 불러오기' }), h('p', { class: 'note', text: '자동 제출이 안 되는 학생은 홈 화면에서 만든 코드를 보내면 돼요.' }), ta, h('div', { class: 'row' }, imp));
  if (!rows.length) return (wrap.append(h('section', { class: 'card' }, h('p', { text: '아직 불러온 학생이 없어요. 학생이 차시를 끝내거나 제출하면 이곳에 나타나요.' })), importCard), wrap);
  const clsList = [...new Set(rows.map(r => r.rep.cls || '반 없음'))].sort((x, y) => (x === '반 없음') - (y === '반 없음') || x.localeCompare(y, 'ko', { numeric: true }));
  if (tcls !== '전체' && !clsList.includes(tcls)) tcls = '전체';
  const shown = rows.filter(r => tcls === '전체' || (r.rep.cls || '반 없음') === tcls);
  wrap.append(h('div', { class: 'row', style: 'flex-wrap:wrap;gap:6px' }, ['전체', ...clsList].map(c => h('button', { class: 'btn sm' + (c === tcls ? ' primary' : ''), type: 'button', text: c === '전체' ? '전체 ' + rows.length + '명' : c + ' · ' + rows.filter(r => (r.rep.cls || '반 없음') === c).length + '명', onclick: () => { tcls = c; render(); } }))));
  (tcls === '전체' ? clsList : [tcls]).forEach(c => { const g = shown.filter(r => (r.rep.cls || '반 없음') === c); if (!g.length) return;
    const done = g.reduce((s, r) => s + r.a.done, 0), tot = g.reduce((s, r) => s + r.a.tot, 0), ok = g.reduce((s, r) => s + r.a.ok, 0);
    wrap.append(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0 0 8px;justify-content:space-between' }, h('b', { text: c + ' (' + g.length + '명)' }), h('span', { class: 'note', style: 'margin:0', text: '완료 ' + done + '/' + g.length * ready.length + ' 차시 · 첫 시도 ' + (tot ? pct(ok / tot) + '%' : '–') })),
      h('div', { class: 'tscroll' }, h('table', { class: 'mx' }, h('thead', {}, h('tr', {}, h('th', { text: '학생' }), ready.map(l => h('th', { title: l.title, text: lno(l) })), h('th', { text: '첫 시도 정답률' }))),
        h('tbody', {}, g.map(r => h('tr', { onclick: () => { tsel = r.key; render(); } }, h('td', {}, h('b', { text: r.rep.name })), r.a.rows.map(x => h('td', {}, cell(x))), h('td', { text: r.a.tot ? pct(r.a.ok / r.a.tot) + '%' : '–' }))))))));
  });
  const tally = causeTally(shown.flatMap(r => r.a.rows));
  wrap.append(elTable(shown.map(r => r.a)),
    tally.length ? h('section', { class: 'card', style: 'margin-top:12px' }, h('h2', { class: 'h2', text: '틀린 까닭 (학생이 고른 것)' }), h('p', { style: 'margin:0', text: tally.join(' · ') })) : null,
    h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', text: '서술 답 모아 복사', onclick: () => { const t = essayText(shown); if (!t) { toast('복사할 서술 답이 아직 없어요'); return; } copyText(t, '서술 답을 복사했어요'); } })),
    h('p', { class: 'note', text: '이름과 반이 같으면 같은 학생으로 보고 기록을 이어서 쌓아요. ✓는 차시 완료(첫 시도 정답 수), 노란 칸은 푼 문제 수예요.' }), importCard);
  return wrap;
}
function teacherDetail(rec) {
  const rep = rec.rep, a = analyze(rep), out = [];
  out.push(h('section', { class: 'card' }, h('div', { class: 'row', style: 'margin:0' }, h('span', { class: 'chip gray', text: rep.cls || '반 없음' }), h('span', { class: 'note', style: 'margin:0', text: '완료 ' + a.done + '/' + a.rows.length + ' · 첫 시도 ' + (a.tot ? pct(a.ok / a.tot) + '%' : '–') }))));
  const mvIn = h('input', { class: 'in', placeholder: '예: 2-1', maxlength: '6', style: 'max-width:110px', 'aria-label': '옮길 반' });
  out.push(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0;gap:8px;flex-wrap:wrap' }, h('b', { text: '반 옮기기' }), mvIn, h('button', { class: 'btn sm', type: 'button', text: '옮기기', onclick: () => { const nk = moveStudent(tsel, mvIn.value); if (!nk) { toast('옮길 반을 2-1 형식으로 입력해 주세요'); return; } tsel = nk; render(); toast('반을 옮겼어요. 이 학생이 이전 반으로 다시 제출해도 새 반에 합쳐져요'); } })),
    h('p', { class: 'note', text: '학생이 다음에 2-1반으로 접속해 제출해도 같은 이름이면 이 기록과 합쳐져요.' })));
  a.rows.forEach(x => { const r = x.r, ex = r && r.ss ? ' · 서술형 단계 ' + r.ss[0] + '/' + r.ss[1] : '';
    out.push(h('section', { class: 'card', style: 'margin-top:12px' }, h('div', { class: 'row', style: 'margin:0;justify-content:space-between' }, h('div', {}, h('b', { text: lno(x.l) + ' · ' + x.l.title }), h('div', { class: 'note', style: 'margin:2px 0 0;font-size:12px', text: '평가 요소 · ' + x.l.el })),
      !r ? h('span', { class: 'chip gray', text: '미시작' }) : r.d ? h('span', { class: 'chip green', text: '완료 · 첫 시도 ' + r.c[0] + '/' + r.c[1] }) : h('span', { class: 'chip gold', text: '푼 문제 ' + (r.k || 0) + '/' + r.c[1] })),
      r ? h('div', { class: 'refl note', text: '자신감: ' + (r.p || '–') + ' · 힌트 본 문항 ' + (r.hn || 0) + ex }) : null,
      r && r.w && Object.keys(r.w).length ? h('div', { class: 'refl' }, h('small', { text: '틀린 까닭 ' }), Object.entries(r.w).map(([k, v]) => (CAUSES[k] || '기타') + ' ' + v).join(' · ')) : null,
      r && r.r && r.r[0] ? h('div', { class: 'refl' }, h('small', { text: '한 줄 정리 ' }), r.r[0]) : null,
      r && r.r && r.r[1] ? h('div', { class: 'refl' }, h('small', { text: '헷갈리는 점 ' }), r.r[1]) : null)); });
  return out;
}

/* ---------- 시작 ---------- */
load();
if (DB.profiles.length && !DB.profiles.some(p => p.id === DB.cur)) DB.cur = DB.profiles.length === 1 ? DB.profiles[0].id : null;
const route = () => { view = TEACHER_ONLY ? 'teacher' : (DB.cur ? 'home' : 'welcome'); tsel = null; render(); };
window.addEventListener('hashchange', route);
route();
window.__app = { DB: () => DB, TD: () => TD, go, render, makeReport, packReport, unpackReport, importCodes, addRep, LESSONS, normNum, normCls };
})();
