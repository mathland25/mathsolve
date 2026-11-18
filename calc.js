/* 계산기: 화면 오른쪽 아래 버튼 → 열고 닫기. 저장·제출과 무관. eval 미사용 */
(function () {
  'use strict';
  const OPS = { '+': [1, 'L'], '−': [1, 'L'], '×': [2, 'L'], '÷': [2, 'L'], '^': [4, 'R'] };
  function tokenize(s) {
    const t = []; let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/[0-9.]/.test(c)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; t.push({ n: parseFloat(s.slice(i, j)) }); i = j; }
      else if (c in OPS || c === '(' || c === ')' || c === '√') { t.push({ o: c }); i++; }
      else if (c === '%') { t.push({ o: '%' }); i++; }
      else i++;
    }
    return t;
  }
  function evaluate(src) {
    const tk = tokenize(src); let p = 0;
    const peek = () => tk[p], next = () => tk[p++];
    function expr(minP) {
      let l = unary();
      for (;;) {
        const t = peek(); if (!t || !t.o || !(t.o in OPS)) break;
        const [pr, as] = OPS[t.o]; if (pr < minP) break;
        next(); const r = expr(as === 'L' ? pr + 1 : pr);
        l = t.o === '+' ? l + r : t.o === '−' ? l - r : t.o === '×' ? l * r : t.o === '÷' ? l / r : Math.pow(l, r);
      }
      return l;
    }
    function unary() {
      const t = peek(); if (!t) throw 0;
      if (t.o === '−') { next(); return -expr(3); }
      if (t.o === '+') { next(); return expr(3); }
      if (t.o === '√') { next(); const v = unary(); if (v < 0) throw 0; return Math.sqrt(v); }
      return post();
    }
    function post() {
      let v = atom();
      while (peek() && peek().o === '%') { next(); v /= 100; }
      return v;
    }
    function atom() {
      const t = next(); if (!t) throw 0;
      if ('n' in t) { if (isNaN(t.n)) throw 0; return t.n; }
      if (t.o === '(') { const v = expr(1); const c = next(); if (!c || c.o !== ')') throw 0; return v; }
      throw 0;
    }
    const v = expr(1); if (p < tk.length) throw 0; return v;
  }
  function fmt(v) {
    if (!isFinite(v)) throw 0;
    const r = Math.round(v * 1e9) / 1e9;
    return String(r);
  }
  const KEYS = ['C', '(', ')', '⌫', '7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '^', '+', '√', '%', 'Ans', '='];
  function build() {
    const el = (tag, attrs, txt) => { const e = document.createElement(tag); Object.assign(e, attrs || {}); if (txt != null) e.textContent = txt; return e; };
    const fab = el('button', { type: 'button', className: 'calcfab', title: '계산기', ariaLabel: '계산기 열기' }, '🧮');
    const box = el('div', { className: 'calcbox', hidden: true });
    const head = el('div', { className: 'calchead' });
    const ttl = el('b', null, '계산기'); const x = el('button', { type: 'button', className: 'calcx', ariaLabel: '닫기' }, '✕');
    head.append(ttl, x);
    const disp = el('div', { className: 'calcdisp' }); const ex = el('div', { className: 'calcex' }, ''); const rs = el('div', { className: 'calcrs' }, '0');
    disp.append(ex, rs);
    const grid = el('div', { className: 'calcgrid' });
    let cur = '', ans = '', done = false;
    const show = () => { ex.textContent = cur; rs.textContent = cur || ans || '0'; };
    const press = k => {
      if (k === 'C') { cur = ''; ex.textContent = ''; rs.textContent = '0'; done = false; return; }
      if (k === '⌫') { cur = cur.slice(0, -1); done = false; return show(); }
      if (k === '=') {
        if (!cur) return;
        try { const r = fmt(evaluate(cur)); ex.textContent = cur + ' ='; rs.textContent = r; ans = r; cur = ''; done = true; }
        catch (e) { ex.textContent = cur; rs.textContent = '식을 확인하세요'; }
        return;
      }
      if (k === 'Ans') k = ans;
      if (!k) return;
      if (done && !/^[+−×÷^%]$/.test(k)) { cur = ''; }
      if (done && /^[+−×÷^%]$/.test(k) && !cur) cur = ans;
      done = false; cur += k; show();
    };
    KEYS.forEach(k => { const b = el('button', { type: 'button', className: 'ck' + (/^[0-9.]$/.test(k) ? ' num' : k === '=' ? ' eq' : k === 'C' || k === '⌫' ? ' clr' : ''), }, k); b.onclick = () => press(k); grid.append(b); });
    box.append(head, disp, grid);
    const toggle = open => { box.hidden = !open; fab.hidden = open; };
    fab.onclick = () => toggle(true); x.onclick = () => toggle(false);
    document.body.append(fab, box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  window.__calcEval = evaluate;
})();
