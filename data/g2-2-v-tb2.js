/* 중2-2 Ⅴ. 닮은 도형의 성질 — 교과서 '도담도담 생각 다지기'(224~225쪽) 8문항 + 유사 문제
   ③ 01~05 (평행선과 선분의 길이의 비, 평행선 사이의 선분, 무게중심 기본), ④ 06~08 */
(() => {
  const { F, h, label } = window.SF;
  const grade = window.SOLVE_GRADES.find(g => g.id === 'g2-2'), unit = grade.units.find(u => u.id === 'vtb');
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const CAP = () => h('div', { class: 'figcap', text: '※ 그림은 실제 크기와 다를 수 있어요.' });
  const C34 = 'Ⅴ-3·4차시 평행선과 선분의 길이의 비', C5 = 'Ⅴ-5차시 평행선 사이의 선분의 길이의 비', C6 = 'Ⅴ-6차시 삼각형의 무게중심';
  const T = n => '교과서 ' + n + '번', U = n => '유사 ' + n;
  const b = { lv: 1 }, ap = { lv: 3, lvn: '응용' };
  const N = (o, e) => Object.assign({}, o, e);
  const R = (a, bb) => ({ t: 'num', ans: a, hint: bb });

  /* ---- 그림 ---- */
  const tri = (ad, ab, ae, ac) => { const A = [140, 10], B = [20, 125], C = [250, 125]; return { A, B, C, D: lerp(A, B, ad / ab), E: lerp(A, C, ae / ac) }; };
  const fig01 = (tl) => F({ w: 270, P: tri(1, 2, 1, 2), poly: [['A', 'B', 'C']], seg: [['D', 'E']], par: [['D', 'E'], ['B', 'C']], txt: tl || [], alt: '삼각형 ABC. 변 AB 위의 점 D, 변 AC 위의 점 E. DE ∥ BC' });
  /* 평행선 l, m, n 과 두 직선 */
  const lines3 = (g1, g2, T1, T2, tl, alt) => { const yl = 12, ym = 12 + g1, yn = 12 + g1 + g2, kids = [];
    ['l', 'm', 'n'].forEach((nm, i) => { const y = [yl, ym, yn][i]; kids.push(h('s:line', { x1: 8, y1: y, x2: 262, y2: y, stroke: 'var(--blue)', 'stroke-width': 2 }), label(274, y + 4, nm, 'svgt')); });
    [T1, T2].forEach(t => { const P = [[t[0], yl], [t[1], yn]], M = lerp(P[0], P[1], g1 / (g1 + g2)), ex = [(P[0][0] - P[1][0]) * .08, (P[0][1] - P[1][1]) * .08];
      kids.push(h('s:line', { x1: P[0][0] + ex[0], y1: P[0][1] + ex[1], x2: P[1][0] - ex[0], y2: P[1][1] - ex[1], stroke: 'var(--ink)', 'stroke-width': 2 }));
      [P[0], M, P[1]].forEach(q => kids.push(h('s:circle', { cx: q[0], cy: q[1], r: 3, fill: 'var(--blue)' }))); t.M = M; t.P = P; });
    tl.forEach(([ti, seg, txt, dx]) => { const t = ti ? T2 : T1, a = seg === 0 ? t.P[0] : t.M, c = seg === 0 ? t.M : t.P[1]; kids.push(label((a[0] + c[0]) / 2 + (dx || -16), (a[1] + c[1]) / 2 + 4, txt, 'svgm')); });
    return h('div', { class: 'figbox' }, h('s:svg', { viewBox: '-10 -4 300 ' + (yn + 18), class: 'qfig', role: 'img', 'aria-label': alt }, ...kids), CAP()); };
  const fig02a = () => lines3(30, 90, [95, 35], [140, 235], [[0, 0, '2 cm'], [0, 1, '6 cm'], [1, 0, '3 cm', 14], [1, 1, 'x cm', 14]], '평행한 세 직선 l, m, n과 두 직선. 2 cm, 6 cm, 3 cm, x cm');
  const fig02b = () => lines3(48, 32, [120, 170], [195, 120], [[0, 0, '6 cm', -20], [0, 1, '4 cm', 20], [1, 0, '9 cm', 20], [1, 1, 'y cm', -20]], '평행한 세 직선 l, m, n과 한 점에서 만나는 두 직선. 6 cm, 4 cm, 9 cm, y cm');
  const figU02a = () => lines3(30, 60, [95, 40], [135, 235], [[0, 0, '4 cm'], [0, 1, '8 cm'], [1, 0, '6 cm', 14], [1, 1, 'x cm', 14]], '평행한 세 직선 l, m, n과 두 직선. 4 cm, 8 cm, 6 cm, x cm');
  const figU02b = () => lines3(48, 24, [120, 165], [195, 127], [[0, 0, '10 cm', -24], [0, 1, '5 cm', 20], [1, 0, '12 cm', 26], [1, 1, 'y cm', -20]], '평행한 세 직선 l, m, n과 한 점에서 만나는 두 직선. 10 cm, 5 cm, 12 cm, y cm');
  /* 무게중심 */
  const cent = () => { const A = [140, 8], B = [15, 128], C = [255, 128]; const D = lerp(B, C, .5), E = lerp(A, B, .5), Fm = lerp(A, C, .5), G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]; return { A, B, C, D, E, F: Fm, G }; };
  const fig03 = tl => F({ w: 270, P: (({ A, B, C, D, E, G }) => ({ A, B, C, D, E, G }))(cent()), poly: [['A', 'B', 'C']], seg: [['A', 'D'], ['C', 'E']], txt: tl, alt: '삼각형 ABC의 무게중심 G. 중선 AD, CE' });
  const fig03a = () => fig03([['B', 'D', '8', 14], ['B', 'C', 'x', 18], ['G', 'C', '12', 10], ['E', 'G', 'y', 12]]);
  const fig03b = () => fig03([['B', 'D', '7', 14], ['B', 'C', 'x', 18], ['E', 'G', '5', 12], ['G', 'C', 'y', 10]]);
  /* 삼등분 / 사등분 그림 */
  const quad = (n, tl, angTxt) => { const A = [20, 125], B = [250, 125], C = [150, 10], Pp = lerp(A, B, 1 / n), Q = lerp(A, C, 1 / n), P = { A, B, C, P: Pp, Q }, ex = {}, tk = [];
    for (let i = 1; i < n; i++) { P['_a' + i] = lerp(A, B, i / n); P['_c' + i] = lerp(A, C, i / n); }
    P._a0 = A; P._c0 = A; P._an = B; P._cn = C;
    for (let i = 0; i < n; i++) { tk.push([i === 0 ? '_a0' : '_a' + i, i === n - 1 ? '_an' : '_a' + (i + 1), 1], [i === 0 ? '_c0' : '_c' + i, i === n - 1 ? '_cn' : '_c' + (i + 1), 2]); }
    return F({ w: 270, P, poly: [['A', 'B', 'C']], seg: [['P', 'Q']], tk, txt: tl, ang: [['B', 'C', 'A', angTxt]], nodot: ['_a0'], alt: `삼각형 ABC의 두 변 AB, AC를 각각 ${n}등분한 점을 이은 선분 PQ` }); };
  const fig04a = () => quad(3, [['P', 'Q', '7', 12]], '45°');
  const figU04 = () => quad(4, [['P', 'Q', '6', 12]], '50°');
  /* 05: AB ∥ CD ∥ EF */
  const f05 = (ab, ef, ae, x, cd, tl) => { const A = [10, 125], C = [10 + (ae + x) * 11, 125], BA = [50, -112]; const B = [A[0] + BA[0], A[1] + BA[1]], E = lerp(A, C, ae / (ae + x)), Fp = [E[0] + BA[0] * ef / ab, E[1] + BA[1] * ef / ab], D = [C[0] + BA[0] * cd / ab, C[1] + BA[1] * cd / ab];
    return F({ w: 270, P: { A, B, C, D, E, F: Fp }, seg: [['A', 'B'], ['C', 'D'], ['E', 'F'], ['A', 'D'], ['B', 'C'], ['A', 'C']], par: [['A', 'B'], ['C', 'D'], ['E', 'F']], txt: tl, alt: 'AB, CD, EF가 서로 평행하고 AD와 BC가 점 F에서 만나는 그림' }); };
  const fig05 = () => f05(15, 6, 9, 6, 10, [['A', 'B', '15', 12], ['E', 'F', '6', 12], ['A', 'E', '9', 14], ['C', 'E', 'x', 14], ['C', 'D', 'y', 12]]);
  const figU05 = () => f05(12, 8, 3, 6, 24, [['A', 'B', '12', 12], ['E', 'F', '8', 12], ['A', 'E', '3', 14], ['C', 'E', 'x', 14], ['C', 'D', 'y', 12]]);
  /* 06 */
  const f06 = (ad, bd, tl) => { const A = [130, 8], B = [10, 128], C = [215, 128], ab = ad + bd, D = lerp(A, B, ad / ab), E = lerp(A, C, ad / ab), Fp = lerp(A, D, ad / ab);
    return F({ w: 270, P: { A, B, C, D, E, F: Fp }, poly: [['A', 'B', 'C']], seg: [['D', 'E'], ['D', 'C'], ['F', 'E']], par: [['B', 'C'], ['D', 'E'], ['D', 'C'], ['F', 'E']], txt: tl, alt: 'BC ∥ DE, CD ∥ EF인 삼각형 ABC' }); };
  const fig06 = () => f06(15, 10, [['A', 'D', '15', 14], ['B', 'D', '10', 14]]);
  const figU06 = () => f06(20, 5, [['A', 'D', '20', 14], ['B', 'D', '5', 14]]);
  /* 07, 08 */
  const f07 = (tx, shade) => { const { A, B, C, D, E, F: Fm, G } = cent(); return F({ w: 270, P: { A, B, C, D, E, F: Fm, G }, poly: [['A', 'B', 'C']], seg: [['A', 'D'], ['B', 'E'], ['C', 'F']], fill: [[shade, 'var(--green-soft)']], txt: tx, alt: '삼각형 ABC의 무게중심 G와 색칠한 부분' }); };
  const fig07 = () => f07([], ['G', 'D', 'C', 'E']);
  const figU07 = () => f07([], ['G', 'B', 'C']);
  const f08 = (am, tx) => { const A = [150, 6], B = [15, 195], C = [255, 195], M = lerp(B, C, .5), G = lerp(A, M, 2 / 3), Gp = lerp(G, M, 2 / 3);
    return F({ w: 270, h: 205, P: { A, B, C, M, G, "G'": Gp }, poly: [['A', 'B', 'C']], seg: [['A', 'M'], ['B', 'G'], ['C', 'G'], ['B', "G'"], ['C', "G'"]], txt: tx, alt: '삼각형 ABC의 무게중심 G와 삼각형 GBC의 무게중심 G′' }); };
  const fig08 = () => f08(18, [[112, 80, '18 cm']]);
  const figU08 = () => f08(27, [[112, 80, '27 cm']]);

  /* ---- 핵심 정리 ---- */
  const coreA = { defs: [['평행선과 선분의 길이의 비', '△ABC에서 DE ∥ BC이면 AD : AB = AE : AC = DE : BC, AD : BD = AE : CE'], ['평행선 사이의 선분', '세 직선 l ∥ m ∥ n이면 a : b = c : d'], ['삼각형의 무게중심', '세 중선의 교점 G. 꼭짓점에서 G까지 : G에서 변의 중점까지 = 2 : 1. 세 중선으로 나뉜 6개의 삼각형의 넓이는 모두 같다.']],
    points: ['비례식은 대응하는 선분끼리 세워요.', '삼등분·사등분 점이 나오면 AP : AB가 같은 두 변을 찾아 평행을 확인해요.', '무게중심: AG : DG = 2 : 1 (G는 꼭짓점에서 2/3 지점)'], note: '평행선을 찾으면 닮음비와 같은 비가 여기저기 나와요. 어느 삼각형과 어느 삼각형이 닮았는지 먼저 정해요.' };

  /* ---- 문항 ---- */
  const L3 = { id: 's93', label: '닮은 도형의 성질 ①', title: '평행선·무게중심 기본·응용 + 유사', el: '삼각형에서 평행선과 선분의 길이의 비 · 중점연결정리 · 평행선 사이의 선분의 길이의 비 · 삼각형의 무게중심',
    concept: { id: null, label: C34 }, concepts: [C34, C5, C6], core: coreA, qs: [
      N(b, { tag: T('01'), concept: C34, t: 'steps', q: '오른쪽 그림에서 DE ∥ BC일 때 알맞은 것을 고르세요. (1) △ABC ∽ □ (2) AB : AD = AC : □ = BC : DE (3) AD : □ = AE : CE', fig: () => fig01(), steps: [
        { q: '① (1) △ABC ∽ □', opts: ['△ADE', '△AED', '△DAE'], ans: 0, hint: '평행선의 동위각이 같아요. ∠A는 공통이므로 A ↔ A, B ↔ D, C ↔ E', why: '∠ABC = ∠ADE, ∠A는 공통이므로 △ABC ∽ △ADE (AA 닮음)' },
        { q: '② (2) AB : AD = AC : □', opts: ['AE', 'CE', 'DE'], ans: 0, hint: '대응변: AB ↔ AD, AC ↔ AE', why: '닮음비가 같으므로 AB : AD = AC : AE = BC : DE' },
        { q: '③ (3) AD : □ = AE : CE', opts: ['AB', 'BD', 'BC'], ans: 1, hint: 'AE : CE의 대응은 점 D에서 B까지의 선분이에요.', why: '평행선과 선분의 길이의 비에서 AD : BD = AE : CE' }] }),
      N(b, { tag: U('01'), concept: C34, t: 'steps', q: '△ABC에서 DE ∥ BC이고 AD = 6 cm, BD = 3 cm, DE = 8 cm, AE = 10 cm입니다. BC와 CE의 길이를 구하세요.', fig: () => fig01([['A', 'D', '6', 14], ['B', 'D', '3', 14], ['D', 'E', '8', 12], ['A', 'E', '10', 14], ['B', 'C', '?', 14], ['C', 'E', '?', 14]]), steps: [
        { q: '① BC의 길이는? (AB : AD = BC : DE)', t: 'num', unit: 'cm', ans: 12, hint: 'AB = 6 + 3 = 9 cm', why: 'AB : AD = 9 : 6 = 3 : 2이므로 BC : 8 = 3 : 2, BC = 12 cm' },
        { q: '② CE의 길이는?', t: 'num', unit: 'cm', ans: 5, hint: 'AD : BD = AE : CE', why: '6 : 3 = 10 : CE이므로 CE = 3 × 10 ÷ 6 = 5 cm' }] }),
      N(b, { tag: T('02'), concept: C5, t: 'steps', q: 'l ∥ m ∥ n일 때 x, y의 값을 각각 구하세요.', fig: () => h('div', {}, fig02a(), fig02b()), steps: [
        { q: '① (1) x의 값은?', t: 'num', ans: 9, hint: '2 : 6 = 3 : x', why: '2 : 6 = 3 : x이므로 x = 6 × 3 ÷ 2 = 9' },
        { q: '② (2) y의 값은?', t: 'num', ans: 6, hint: '6 : 4 = 9 : y (같은 직선 위의 선분끼리 비를 세워요)', why: '6 : 4 = 9 : y이므로 y = 4 × 9 ÷ 6 = 6' }] }),
      N(b, { tag: U('02'), concept: C5, t: 'steps', q: 'l ∥ m ∥ n일 때 x, y의 값을 각각 구하세요.', fig: () => h('div', {}, figU02a(), figU02b()), steps: [
        { q: '① (1) x의 값은?', t: 'num', ans: 12, hint: '4 : 8 = 6 : x', why: '4 : 8 = 6 : x이므로 x = 8 × 6 ÷ 4 = 12' },
        { q: '② (2) y의 값은?', t: 'num', ans: 6, hint: '10 : 5 = 12 : y', why: '10 : 5 = 12 : y이므로 y = 5 × 12 ÷ 10 = 6' }] }),
      N(b, { tag: T('03'), concept: C6, t: 'steps', q: '점 G가 △ABC의 무게중심일 때 x, y의 값을 각각 구하세요. (BD = 8 cm, CG = 12 cm)', fig: fig03a, steps: [
        { q: '① x의 값은? (x = BC)', t: 'num', ans: 16, hint: 'AD는 중선이에요. D는 BC의 중점이에요.', why: 'D가 BC의 중점이므로 BC = 2 × BD = 16' },
        { q: '② y의 값은? (y = EG)', t: 'num', ans: 6, hint: 'CE도 중선이에요. CG : EG = 2 : 1', why: 'CG : EG = 2 : 1이므로 12 : y = 2 : 1, y = 6' }] }),
      N(b, { tag: U('03'), concept: C6, t: 'steps', q: '점 G가 △ABC의 무게중심일 때 x, y의 값을 각각 구하세요. (BD = 7 cm, EG = 5 cm)', fig: fig03b, steps: [
        { q: '① x의 값은? (x = BC)', t: 'num', ans: 14, hint: 'D는 BC의 중점이에요.', why: 'BC = 2 × BD = 14' },
        { q: '② y의 값은? (y = CG)', t: 'num', ans: 10, hint: 'CG : EG = 2 : 1', why: 'CG = 2 × EG = 10' }] }),
      N(ap, { tag: T('04'), concept: C34, t: 'steps', q: '△ABC에서 두 변 AB, AC를 각각 삼등분했을 때 (1) ∠APQ의 크기 (2) BC의 길이를 구하세요. (PQ = 7 cm, ∠B = 45°)', fig: fig04a, steps: [
        { q: '① (1) ∠APQ의 크기는?', t: 'num', unit: '°', ans: 45, hint: 'AP : AB = AQ : AC = 1 : 3이므로 PQ ∥ BC예요. 같은 위치의 각은?', why: 'AP : AB = AQ : AC이므로 PQ ∥ BC이고, 동위각이므로 ∠APQ = ∠B = 45°' },
        { q: '② (2) BC의 길이는?', t: 'num', unit: 'cm', ans: 21, hint: 'PQ : BC = AP : AB = 1 : 3', why: '7 : BC = 1 : 3이므로 BC = 21 cm' }] }),
      N(ap, { tag: U('04'), concept: C34, t: 'steps', q: '△ABC에서 두 변 AB, AC를 각각 사등분했을 때 (1) ∠APQ의 크기 (2) BC의 길이를 구하세요. (PQ = 6 cm, ∠B = 50°)', fig: figU04, steps: [
        { q: '① (1) ∠APQ의 크기는?', t: 'num', unit: '°', ans: 50, hint: 'AP : AB = AQ : AC = 1 : 4이므로 PQ ∥ BC', why: 'PQ ∥ BC이므로 동위각 ∠APQ = ∠B = 50°' },
        { q: '② (2) BC의 길이는?', t: 'num', unit: 'cm', ans: 24, hint: 'PQ : BC = 1 : 4', why: '6 : BC = 1 : 4이므로 BC = 24 cm' }] }),
      N(ap, { tag: T('05'), concept: C34, t: 'steps', q: 'AB ∥ CD ∥ EF이고 AB = 15 cm, EF = 6 cm, AE = 9 cm입니다. x, y의 값을 각각 구하세요.', fig: fig05, steps: [
        { q: '① x의 값은? (x = CE)', t: 'num', ans: 6, hint: '△CEF ∽ △CAB이에요. EF : AB = CE : AC', why: '6 : 15 = x : (9 + x)이므로 54 + 6x = 15x, x = 6' },
        { q: '② y의 값은? (y = CD)', t: 'num', ans: 10, hint: 'AB ∥ CD이므로 AB : CD = AE : CE', why: '15 : y = 9 : 6이므로 y = 15 × 6 ÷ 9 = 10' }] }),
      N(ap, { tag: U('05'), concept: C34, t: 'steps', q: 'AB ∥ CD ∥ EF이고 AB = 12 cm, EF = 8 cm, AE = 3 cm입니다. x, y의 값을 각각 구하세요.', fig: figU05, steps: [
        { q: '① x의 값은? (x = CE)', t: 'num', ans: 6, hint: 'EF : AB = CE : AC', why: '8 : 12 = x : (3 + x)이므로 24 + 8x = 12x, x = 6' },
        { q: '② y의 값은? (y = CD)', t: 'num', ans: 24, hint: 'AB : CD = AE : CE', why: '12 : y = 3 : 6이므로 y = 24' }] })
    ] };

  const L4 = { id: 's94', label: '닮은 도형의 성질 ②', title: '평행선·무게중심 응용 + 유사', el: '삼각형에서 평행선과 선분의 길이의 비 · 중점연결정리 · 삼각형의 무게중심',
    concept: { id: null, label: C34 }, concepts: [C34, C6], core: coreA, qs: [
      N(ap, { tag: T('06'), concept: C34, t: 'steps', q: '△ABC에서 BC ∥ DE, CD ∥ EF이고 AD = 15 cm, BD = 10 cm입니다. AF의 길이를 구하세요.', fig: fig06, steps: [
        { q: '① BC ∥ DE에서 AE : CE는? (가장 간단한 자연수의 비)', opts: ['3 : 2', '3 : 5', '2 : 3'], ans: 0, hint: 'AE : CE = AD : BD', why: 'AE : CE = AD : BD = 15 : 10 = 3 : 2' },
        { q: '② AF의 길이는?', t: 'num', unit: 'cm', ans: 9, hint: 'CD ∥ EF이므로 AF : DF = AE : CE = 3 : 2', why: 'AF : DF = 3 : 2이므로 AF = 15 × 3 ÷ 5 = 9 cm' }] }),
      N(ap, { tag: U('06'), concept: C34, t: 'steps', q: '△ABC에서 BC ∥ DE, CD ∥ EF이고 AD = 20 cm, BD = 5 cm입니다. AF의 길이를 구하세요.', fig: figU06, steps: [
        { q: '① BC ∥ DE에서 AE : CE는? (가장 간단한 자연수의 비)', opts: ['4 : 1', '4 : 5', '5 : 4'], ans: 0, hint: 'AE : CE = AD : BD', why: 'AE : CE = 20 : 5 = 4 : 1' },
        { q: '② AF의 길이는?', t: 'num', unit: 'cm', ans: 16, hint: 'CD ∥ EF이므로 AF : DF = AE : CE = 4 : 1', why: 'AF = 20 × 4 ÷ 5 = 16 cm' }] }),
      N(ap, { tag: T('07'), concept: C6, t: 'steps', q: '점 G는 △ABC의 무게중심이고 □GDCE의 넓이가 60 cm²일 때 △ABC의 넓이를 구하세요.', fig: fig07, steps: [
        { q: '① □GDCE는 △ABC의 몇 분의 몇일까요?', opts: ['1/6', '1/3', '1/2'], ans: 1, hint: '세 중선으로 나뉜 6개의 삼각형은 넓이가 같아요. □GDCE는 그중 몇 개?', why: '△GDC와 △GCE로 이루어져 있어요. 각각 △ABC의 1/6이므로 합은 1/3' },
        { q: '② △ABC의 넓이는?', t: 'num', unit: 'cm²', ans: 180, hint: '60이 전체의 1/3이에요.', why: '60 × 3 = 180 cm²' }] }),
      N(ap, { tag: U('07'), concept: C6, t: 'steps', q: '점 G는 △ABC의 무게중심이고 △GBC의 넓이가 25 cm²일 때 △ABC의 넓이를 구하세요.', fig: figU07, steps: [
        { q: '① △GBC는 △ABC의 몇 분의 몇일까요?', opts: ['1/6', '1/3', '1/2'], ans: 1, hint: '세 개의 삼각형 GAB, GBC, GCA의 넓이는 같아요.', why: '△GAB = △GBC = △GCA이므로 △GBC는 △ABC의 1/3' },
        { q: '② △ABC의 넓이는?', t: 'num', unit: 'cm²', ans: 75, hint: '25가 전체의 1/3이에요.', why: '25 × 3 = 75 cm²' }] }),
      N(ap, { tag: T('08'), concept: C6, t: 'steps', q: '점 G는 △ABC의 무게중심이고 점 G′은 △GBC의 무게중심입니다. AM = 18 cm이고 △AMC의 넓이가 90 cm²일 때 (1) GG′의 길이 (2) △G′BM의 넓이를 구하세요.', fig: fig08, steps: [
        { q: '① GM의 길이는?', t: 'num', unit: 'cm', ans: 6, hint: 'AG : GM = 2 : 1', why: 'GM = 18 × 1/3 = 6 cm' },
        { q: '② GG′의 길이는? (G′은 △GBC의 중선 GM 위에 있어요)', t: 'num', unit: 'cm', ans: 4, hint: 'GG′ : G′M = 2 : 1이므로 G′M = GM × 1/3', why: 'G′M = 6 × 1/3 = 2, GG′ = 6 − 2 = 4 cm' },
        { q: '③ △G′BM의 넓이는?', t: 'num', unit: 'cm²', ans: 10, hint: '△ABC = 180, △GBM = △ABC의 1/6, △G′BM = △GBM의 1/3', why: '△ABC = 90 × 2 = 180, △GBM = 30, △G′BM = 30 × 1/3 = 10 cm²' }] }),
      N(ap, { tag: U('08'), concept: C6, t: 'steps', q: '점 G는 △ABC의 무게중심이고 점 G′은 △GBC의 무게중심입니다. AM = 27 cm이고 △AMC의 넓이가 54 cm²일 때 (1) GG′의 길이 (2) △G′BM의 넓이를 구하세요.', fig: figU08, steps: [
        { q: '① GM의 길이는?', t: 'num', unit: 'cm', ans: 9, hint: 'AG : GM = 2 : 1', why: 'GM = 27 × 1/3 = 9 cm' },
        { q: '② GG′의 길이는?', t: 'num', unit: 'cm', ans: 6, hint: 'G′M = GM × 1/3', why: 'G′M = 3, GG′ = 9 − 3 = 6 cm' },
        { q: '③ △G′BM의 넓이는?', t: 'num', unit: 'cm²', ans: 6, hint: '△ABC = 108, △GBM = 18', why: '△ABC = 54 × 2 = 108, △GBM = 18, △G′BM = 18 × 1/3 = 6 cm²' }] })
    ] };
  unit.lessons.push(L3, L4);
})();
