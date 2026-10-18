/* mathconcept(개념 탐구 노트)와 같은 그림 도우미 */
(()=>{'use strict';
const NS = 'http://www.w3.org/2000/svg';
function h(tag, a, ...k) {
  const svg = tag.startsWith('s:');
  const el = svg ? document.createElementNS(NS, tag.slice(2)) : document.createElement(tag);
  for (const [key, v] of Object.entries(a || {})) {
    if (v == null || v === false) continue;
    if (key === 'class') el.setAttribute('class', v);
    else if (key === 'text') el.textContent = v;
    else if (key === 'html') el.innerHTML = v;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), v);
    else el.setAttribute(key, v === true ? '' : v);
  }
  el.append(...k.flat(Infinity).filter(x => x != null && x !== false));
  return el;
}
const deg = r => r * 180 / Math.PI;
const r1 = v => (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, '');
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const angleAt = (p, a, b) => { // p에서 a, b가 이루는 각(도)
  const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
  return deg(Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))));
};
function slider(label, min, max, step, val, fmt, onInput) {
  const out = h('output', { text: fmt(val) });
  const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
  inp.addEventListener('input', () => { const v = +inp.value; out.textContent = fmt(v); onInput(v); });
  return [h('span', { text: label }), inp, out];
}
const tabs = (items, cur, onPick) => h('div', { class: 'wtabs', role: 'group' }, items.map(([k, l]) =>
  h('button', { type: 'button', class: k === cur ? 'on' : '', 'aria-pressed': k === cur ? 'true' : 'false', text: l, onclick: () => onPick(k) })));
const label = (x, y, t, cls = 'svgt', anchor) => h('s:text', { x, y, class: cls, 'text-anchor': anchor || 'middle', text: t });
const poly = (pts, attrs) => h('s:polygon', Object.assign({ points: pts.map(p => p.join(',')).join(' '), fill: 'var(--blue-soft)', stroke: 'var(--blue)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, attrs));
const seg = (p, q, attrs) => h('s:line', Object.assign({ x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: 'var(--ink2)', 'stroke-width': 1.8 }, attrs));
const dot = (p, rr = 4.5, fill = 'var(--blue)') => h('s:circle', { cx: p[0], cy: p[1], r: rr, fill });
const tick = (p, q, n = 1) => { // 선분 pq의 같은 길이 표시
  const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], d = [q[0] - p[0], q[1] - p[1]], L = Math.hypot(...d) || 1, nx = -d[1] / L, ny = d[0] / L;
  return h('s:g', {}, Array.from({ length: n }, (_, i) => { const o = (i - (n - 1) / 2) * 5; return seg([m[0] + d[0] / L * o + nx * 6, m[1] + d[1] / L * o + ny * 6], [m[0] + d[0] / L * o - nx * 6, m[1] + d[1] / L * o - ny * 6], { stroke: 'var(--red)', 'stroke-width': 2.5 }); }));
};
function F(o) {
  const w = o.w || 260, hh = o.h || 160, P = o.P || {};
  const svg = h('s:svg', { viewBox: '-22 -14 ' + (w + 44) + ' ' + (hh + 28), role: 'img', 'aria-label': o.alt || '문제 그림', class: 'qfig' });
  const pt = n => P[n];
  const base = (o.poly && o.poly[0] ? o.poly[0] : Object.keys(P).filter(k => k[0] !== '_')).map(pt);
  const cen = [base.reduce((s, p) => s + p[0], 0) / base.length, base.reduce((s, p) => s + p[1], 0) / base.length];
  const away = (p, d) => { const v = [p[0] - cen[0], p[1] - cen[1]], L = Math.hypot(...v) || 1; return [p[0] + v[0] / L * d, p[1] + v[1] / L * d]; };
  (o.fill || []).forEach(([ns, c]) => svg.append(poly(ns.map(pt), { fill: c, stroke: 'none' })));
  (o.poly || []).forEach(ns => svg.append(poly(ns.map(pt), { fill: o.nofill ? 'none' : 'var(--blue-soft)', 'fill-opacity': .55, 'stroke-width': 2 })));
  (o.circ || []).forEach(([cx, cy, r, c]) => svg.append(h('s:circle', { cx, cy, r, fill: c || 'var(--blue-soft)', 'fill-opacity': .6, stroke: 'var(--blue)', 'stroke-width': 2 })));
  (o.raw || []).forEach(n => svg.append(n));
  (o.seg || []).forEach(([a, b, st]) => svg.append(seg(pt(a), pt(b), st === 'r' ? { stroke: 'var(--red)', 'stroke-width': 2.2 } : st === 'd' ? { stroke: 'var(--red)', 'stroke-dasharray': '5 4', 'stroke-width': 2 } : st === 't' ? { stroke: 'var(--blue)', 'stroke-width': 2.4 } : { stroke: 'var(--blue)', 'stroke-width': 2 })));
  (o.tk || []).forEach(([a, b, n]) => svg.append(tick(pt(a), pt(b), n || 1)));
  (o.par || []).forEach(([a, b]) => { const m = [(pt(a)[0] + pt(b)[0]) / 2, (pt(a)[1] + pt(b)[1]) / 2], d = [pt(b)[0] - pt(a)[0], pt(b)[1] - pt(a)[1]], L = Math.hypot(...d) || 1, u = [d[0] / L, d[1] / L], n = [-u[1], u[0]];
    svg.append(h('s:path', { d: 'M' + (m[0] - u[0] * 6 + n[0] * 4) + ' ' + (m[1] - u[1] * 6 + n[1] * 4) + ' L' + (m[0] + u[0] * 2) + ' ' + m[1] + ' L' + (m[0] - u[0] * 6 - n[0] * 4) + ' ' + (m[1] - u[1] * 6 - n[1] * 4), fill: 'none', stroke: 'var(--red)', 'stroke-width': 1.8 })); });
  (o.rt || []).forEach(([v, a, b]) => { const V = pt(v), u = [pt(a)[0] - V[0], pt(a)[1] - V[1]], w2 = [pt(b)[0] - V[0], pt(b)[1] - V[1]], lu = Math.hypot(...u), lw = Math.hypot(...w2), s = 10, uu = [u[0] / lu * s, u[1] / lu * s], ww = [w2[0] / lw * s, w2[1] / lw * s];
    svg.append(h('s:path', { d: 'M' + (V[0] + uu[0]) + ' ' + (V[1] + uu[1]) + ' l' + ww[0] + ' ' + ww[1] + ' l' + (-uu[0]) + ' ' + (-uu[1]), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.5 })); });
  (o.ang || []).forEach(([v, a, b, t]) => { const V = pt(v), A = pt(a), B = pt(b), a1 = Math.atan2(A[1] - V[1], A[0] - V[0]), a2 = Math.atan2(B[1] - V[1], B[0] - V[0]); let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    const r = 15, p1 = [V[0] + r * Math.cos(a1), V[1] + r * Math.sin(a1)], p2 = [V[0] + r * Math.cos(a2), V[1] + r * Math.sin(a2)], mid = a1 + d / 2;
    svg.append(h('s:path', { d: 'M' + p1[0] + ' ' + p1[1] + ' A' + r + ' ' + r + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + p2[0] + ' ' + p2[1], fill: 'none', stroke: 'var(--red)', 'stroke-width': 1.8 }), label(V[0] + 31 * Math.cos(mid), V[1] + 31 * Math.sin(mid) + 4, t, 'svgm')); });
  Object.keys(P).forEach(n => { if (n[0] === '_') return; const q = away(pt(n), 13); svg.append(label(q[0], q[1] + 5, n.replace(/'/g, '′'), 'svgt')); });
  Object.keys(P).forEach(n => { if (n[0] !== '_' && !(o.nodot || []).includes(n)) svg.append(dot(pt(n), 3.2)); });
  (o.txt || []).forEach(t => { if (typeof t[0] === 'string') { const [a, b, s, off] = t, m = [(pt(a)[0] + pt(b)[0]) / 2, (pt(a)[1] + pt(b)[1]) / 2], q = away(m, off == null ? 13 : off); svg.append(label(q[0], q[1] + 4, s, 'svgm')); } else svg.append(label(t[0], t[1], t[2], 'svgm')); });
  return h('div', { class: 'figbox' }, svg, h('div', { class: 'figcap', text: '※ 그림은 실제 크기와 다를 수 있어요.' }));
}
const onLn = (p, q, y) => { const t = (y - p[1]) / (q[1] - p[1]); return [p[0] + (q[0] - p[0]) * t, y]; };
window.SF = { h, F, label, poly, seg, dot, tick, onLn, dist };
})();
