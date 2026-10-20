/* 중2-2 Ⅴ. 도형의 닮음 — 교과서 '생각 다지기'(수준별) 문제 + 유사 문제
   차시 ① 기본(01·02·03·05·06), 차시 ② 응용·도전(04·07·09 / 08·10). 각 교과서 문항 바로 뒤에 같은 유형의 유사 문제를 붙였다.
   정답은 tools/verify.js 가 조건에서 다시 계산해 확인한다. */
(() => {
  const { F, h, label } = window.SF;
  const grade = window.SOLVE_GRADES.find(g => g.id === 'g2-2');
  const CAP = () => h('div', { class: 'figcap', text: '※ 그림은 실제 크기와 다를 수 있어요.' });
  const svgBox = (vb, alt, ...kids) => h('div', { class: 'figbox' }, h('s:svg', { viewBox: vb, class: 'qfig', role: 'img', 'aria-label': alt }, ...kids), CAP());
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const SC = ['SSS 닮음', 'SAS 닮음', 'AA 닮음'];
  const C1 = 'Ⅴ-1차시 닮은 도형', C2 = 'Ⅴ-2차시 삼각형의 닮음 조건', C7 = 'Ⅴ-7차시 닮은 도형의 넓이와 부피';

  /* ---- 그림 ---- */
  const tri2 = { A: [70, 55], B: [10, 125], C: [90, 125], D: [200, 130], E: [255, 35], F: [125, 35] };
  const fig01 = () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], txt: [['B', 'C', '4', 16], ['E', 'F', '8'], ['D', 'E', '6']], ang: [['A', 'B', 'C', '80°'], ['B', 'C', 'A', '50°']], alt: '닮은 두 삼각형 ABC, DEF. BC = 4, EF = 8, DE = 6, ∠A = 80°, ∠B = 50°' });
  const t2b = { A: [70, 40], B: [10, 125], C: [95, 125], D: [185, 60], E: [150, 125], F: [255, 125] };
  const figU01 = () => F({ w: 270, P: t2b, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], txt: [['A', 'C', '12'], ['B', 'C', '15', 16], ['D', 'F', '8']], ang: [['A', 'B', 'C', '70°'], ['B', 'C', 'A', '45°']], alt: '닮은 두 삼각형 ABC, DEF. AC = 12, BC = 15, DF = 8, ∠A = 70°, ∠B = 45°' });
  const quad = { A: [35, 45], B: [10, 125], C: [95, 125], D: [80, 55], E: [130, 15], F: [115, 125], G: [255, 125], H: [235, 35] };
  const fig02 = () => F({ w: 270, P: quad, poly: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']], txt: [['B', 'C', '8', 16], ['F', 'G', '12', 16], ['E', 'H', '6']], alt: '닮은 두 사각형 ABCD, EFGH. BC = 8, FG = 12, EH = 6' });
  const figU02 = () => F({ w: 270, P: quad, poly: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']], txt: [['A', 'B', '6'], ['E', 'F', '10']], alt: '닮은 두 사각형 ABCD, EFGH. AB = 6, EF = 10' });
  /* 두 직선 AD, BE가 점 C에서 만나는 그림 */
  const cross = (pA, pB, kA, kB, o) => { const C = [115, 105], u = 15, dA = [-.9, -.436], dB = [-.55, .84];
    const A = [C[0] + dA[0] * pA * u, C[1] + dA[1] * pA * u], B = [C[0] + dB[0] * pB * u, C[1] + dB[1] * pB * u];
    return Object.assign({ A, B, C, D: [C[0] - (A[0] - C[0]) * kA, C[1] - (A[1] - C[1]) * kA], E: [C[0] - (B[0] - C[0]) * kB, C[1] - (B[1] - C[1]) * kB] }, o); };
  const fig03 = () => F({ w: 270, P: cross(3, 4, 2, 2), seg: [['A', 'D'], ['B', 'E'], ['A', 'B'], ['D', 'E']], txt: [['A', 'C', '3', 12], ['C', 'D', '6', 12], ['B', 'C', '4', 12], ['C', 'E', '8', 12]], alt: '두 직선 AD, BE가 점 C에서 만난다. AC = 3, CD = 6, BC = 4, CE = 8' });
  const figU03 = () => F({ w: 270, P: cross(4, 4.2, 2, 2), seg: [['A', 'D'], ['B', 'E'], ['A', 'B'], ['D', 'E']], par: [['A', 'B'], ['D', 'E']], txt: [['A', 'C', '4', 12], ['C', 'D', '8', 12], ['A', 'B', '5', 12], ['D', 'E', '?', 12]], alt: '두 직선 AD, BE가 점 C에서 만나고 AB와 DE는 평행하다. AC = 4, CD = 8, AB = 5' });
  /* 직육면체 */
  const box3 = (x, y, w, hh, dx, dy, fill) => { const s = { fill, 'fill-opacity': .55, stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-linejoin': 'round' };
    return h('s:g', {}, h('s:path', Object.assign({ d: `M${x} ${y} h${w} l${dx} ${dy} h${-w} Z` }, s)), h('s:path', Object.assign({ d: `M${x + w} ${y} l${dx} ${dy} v${hh} l${-dx} ${-dy} Z` }, s)), h('s:rect', Object.assign({ x, y, width: w, height: hh }, s))); };
  const fig05 = () => svgBox('-10 -10 300 200', '닮은 두 직육면체. DH와 LP가 대응하는 모서리. DH = 6 cm, LP = 8 cm',
    box3(20, 90, 50, 56, 22, -16, 'var(--blue-soft)'), box3(140, 56, 67, 75, 29, -21, 'var(--green-soft)'),
    h('s:line', { x1: 92, y1: 74, x2: 92, y2: 130, stroke: 'var(--red)', 'stroke-width': 3 }), h('s:line', { x1: 236, y1: 35, x2: 236, y2: 110, stroke: 'var(--red)', 'stroke-width': 3 }),
    label(98, 68, 'D', 'svgt'), label(98, 144, 'H', 'svgt'), label(243, 28, 'L', 'svgt'), label(243, 124, 'P', 'svgt'),
    label(122, 104, '6 cm', 'svgm'), label(272, 82, '8 cm', 'svgm'));
  const figU05 = () => svgBox('-10 -10 300 200', '닮은 두 직육면체. 대응하는 모서리의 길이가 4 cm, 10 cm',
    box3(15, 100, 44, 34, 20, -14, 'var(--blue-soft)'), box3(120, 50, 110, 85, 50, -34, 'var(--green-soft)'),
    label(37, 156, '4 cm', 'svgm'), label(175, 156, '10 cm', 'svgm'), label(37, 176, '작은 직육면체', 'svgm'), label(175, 176, '큰 직육면체', 'svgm'));
  /* 삼각형 ABC 안의 점 D(AB 위), E(AC 위) */
  const T6 = { A: [180, 20], B: [10, 125], C: [255, 125] };
  const mk61 = (ad, ab, ae, ac, tx) => Object.assign({}, T6, { D: lerp(T6.A, T6.B, ad / ab), E: lerp(T6.A, T6.C, ae / ac) });
  const fig06a = () => F({ w: 270, P: mk61(4, 15, 5, 12), poly: [['A', 'B', 'C']], seg: [['D', 'E']], txt: [['A', 'D', '4'], ['B', 'D', '11'], ['A', 'E', '5'], ['C', 'E', '7'], ['D', 'E', '6', 10], ['B', 'C', 'x', 16]], alt: '삼각형 ABC. AD = 4, BD = 11, AE = 5, CE = 7, DE = 6, BC = x' });
  const figU06a = () => F({ w: 270, P: mk61(3, 10, 5, 6), poly: [['A', 'B', 'C']], seg: [['D', 'E']], txt: [['A', 'D', '3'], ['B', 'D', '7'], ['A', 'E', '5'], ['C', 'E', '1'], ['D', 'E', '4', 10], ['B', 'C', 'x', 16]], alt: '삼각형 ABC. AD = 3, BD = 7, AE = 5, CE = 1, DE = 4, BC = x' });
  const fig06b = (bx, ax, ay, cx, t) => F({ w: 270, P: { A: [ax, ay], B: [bx, 125], C: [cx, 125], D: [ax, 125] }, poly: [['A', 'B', 'C']], seg: [['A', 'D']], rt: [['D', 'A', 'C']], ang: [['B', 'C', 'A', '●'], ['A', 'C', 'D', '●']], txt: t, alt: '삼각형 ABC, AD ⊥ BC, ∠B = ∠DAC' });
  const f06b = () => fig06b(73, 120, 72, 180, [['C', 'D', '6', 16], ['A', 'C', '8', 10], ['B', 'D', 'y', 16]]);
  const fU06b = () => fig06b(40, 110, 62, 166, [['C', 'D', '4', 16], ['A', 'C', '6', 10], ['B', 'D', 'y', 16]]);
  /* A0 용지 */
  const fig04 = alt => svgBox('-10 -10 300 200', alt,
    ...[[0, 0, 140, 190], [140, 95, 140, 95], [140, 0, 70, 95], [210, 0, 70, 47.5]].map(r => h('s:rect', { x: r[0], y: r[1], width: r[2], height: r[3], fill: 'var(--blue-soft)', 'fill-opacity': .45, stroke: 'var(--blue)', 'stroke-width': 2 })),
    h('s:rect', { x: 210, y: 47.5, width: 70, height: 47.5, fill: 'none', stroke: 'var(--blue)', 'stroke-dasharray': '4 3' }),
    label(70, 100, 'A1', 'svgt'), label(210, 148, 'A2', 'svgt'), label(175, 52, 'A3', 'svgt'), label(245, 28, 'A4', 'svgt'), label(245, 74, '…', 'svgt'),
    h('s:text', { x: 70, y: 150, 'text-anchor': 'middle', 'font-size': 26, fill: 'var(--muted)', opacity: .6, text: 'A0' }));
  const para = ceFrac => { const A = [75, 20], D = [255, 20], B = [10, 125], C = [190, 125], E = lerp(B, C, 1 - ceFrac);
    const d1 = [C[0] - A[0], C[1] - A[1]], d2 = [E[0] - D[0], E[1] - D[1]], t = ((D[0] - A[0]) * d2[1] - (D[1] - A[1]) * d2[0]) / (d1[0] * d2[1] - d1[1] * d2[0]);
    return { A, B, C, D, E, F: [A[0] + d1[0] * t, A[1] + d1[1] * t] }; };
  const figPara = (ceFrac, a) => F({ w: 270, P: para(ceFrac), poly: [['A', 'B', 'C', 'D']], seg: [['A', 'C'], ['D', 'E']], txt: a, alt: '평행사변형 ABCD에서 점 E는 변 BC 위의 점, AC와 DE의 교점이 F' });
  const fig07 = () => figPara(6 / 9, [['A', 'D', '9', 12], ['A', 'F', '6', 10], ['C', 'F', '4', 10]]);
  const figU07 = () => figPara(7 / 14, [['A', 'D', '14', 12], ['A', 'F', '8', 10], ['C', 'F', '4', 10]]);
  const fig09 = (n1, n2, t) => svgBox('-10 -10 300 200', t, h('s:circle', { cx: 100, cy: 45, r: 32, fill: 'var(--blue-soft)', 'fill-opacity': .6, stroke: 'var(--blue)', 'stroke-width': 2 }), h('s:circle', { cx: 100, cy: 135, r: 48, fill: 'var(--green-soft)', 'fill-opacity': .6, stroke: 'var(--blue)', 'stroke-width': 2 }), label(205, 49, n1, 'svgt'), label(205, 139, n2, 'svgt'));
  const T8 = (ab, bc, k) => { const B = [10, 125], A = [10, 125 - ab * k], C = [10 + bc * k, 125]; return { A, B, C }; };
  const sq8 = (ab, bc, x, k) => { const P = T8(ab, bc, k); return Object.assign(P, { D: [10, 125 - x * k], E: [10 + x * k, 125], F: [10 + x * k, 125 - x * k] }); };
  const f08 = (ab, bc, x, k, tl) => F({ w: 270, P: sq8(ab, bc, x, k), poly: [['A', 'B', 'C'], ['D', 'B', 'E', 'F']], rt: [['B', 'A', 'C']], tk: [['D', 'B'], ['B', 'E'], ['E', 'F'], ['D', 'F']], txt: tl, alt: '직각삼각형 ABC 안의 정사각형 DBEF' });
  const fig08 = () => f08(10, 15, 6, 10, [['A', 'B', '10', 14], ['B', 'C', '15', 16]]);
  const figU08 = () => f08(12, 24, 8, 8, [['A', 'B', '12', 14], ['B', 'C', '24', 16]]);
  const fold = (s, k, ad, ae, bf) => { const x0 = (270 - s * k) / 2, B = [x0, 160], C = [x0 + s * k, 160], A = [x0 + s * k / 2, 160 - s * k * Math.sqrt(3) / 2];
    return { A, B, C, D: lerp(A, B, ad / s), E: lerp(A, C, ae / s), F: lerp(B, C, bf / s) }; };
  const figFold = (s, k, ad, ae, bf, tl) => F({ w: 270, h: 175, P: fold(s, k, ad, ae, bf), poly: [['A', 'B', 'C']], nofill: true, fill: [[['D', 'F', 'E'], 'var(--red-soft)'], [['B', 'F', 'D'], 'var(--blue-soft)'], [['F', 'C', 'E'], 'var(--blue-soft)']], seg: [['D', 'F'], ['E', 'F'], ['D', 'E', 'd']], txt: tl, alt: '정삼각형 ABC를 DE를 접는 선으로 꼭짓점 A가 변 BC 위의 점 F에 오도록 접었다' });
  const fig10 = () => figFold(24, 7, 11.2, 14, 8, [['A', 'E', '14', 12], ['A', 'D', '?', 12], ['B', 'F', '8', 14]]);
  const figU10 = () => figFold(30, 5.6, 14, 21, 6, [['A', 'E', '21', 12], ['A', 'D', '?', 12], ['B', 'F', '6', 14]]);

  /* ---- 핵심 정리 ---- */
  const core1 = {
    defs: [['닮은 도형의 성질', '대응하는 변의 길이의 비는 일정하고(닮음비), 대응하는 각의 크기는 각각 같다.'], ['삼각형의 닮음 조건', 'SSS: 세 쌍의 변의 길이의 비가 같다 / SAS: 두 쌍의 변의 길이의 비가 같고 그 끼인각의 크기가 같다 / AA: 두 쌍의 각의 크기가 각각 같다.'], ['넓이·부피의 비', '닮음비가 m : n이면 넓이의 비(겉넓이의 비)는 m² : n², 부피의 비는 m³ : n³']],
    points: ['닮음 기호는 대응하는 꼭짓점의 순서대로 써요. △ABC ∽ △DEF이면 A↔D, B↔E, C↔F', '두 직선이 한 점에서 만나면 맞꼭지각이 같아요. 평행선에서는 엇각·동위각이 같아요.', '비례식을 세울 때는 먼저 대응변을 찾아요.'],
    note: '넓이의 비는 닮음비를 제곱, 부피의 비는 닮음비를 세제곱해요. 닮음비 자체와 헷갈리지 않게 주의!' };
  const core2 = {
    defs: [['닮은 도형의 넓이와 부피', '닮음비 m : n → 넓이의 비 m² : n², 부피의 비 m³ : n³'], ['닮음을 찾는 방법', '그림에서 공통인 각, 맞꼭지각, 평행선의 엇각·동위각, 직각을 찾아 AA 닮음을 먼저 확인해요.'], ['접은 도형', '접으면 접은 부분과 겹친 부분은 합동이라 변의 길이와 각의 크기가 같아요.']],
    points: ['정사각형이나 접은 도형 문제는 길이를 x로 놓고 닮음비로 식을 세워요.', '평행사변형에서는 마주 보는 변이 평행하고 길이가 같아요.', '구하는 값이 소수나 분수여도 괜찮아요. 식이 맞으면 답도 맞아요.'],
    note: '도전 문제는 단계가 나뉘어 있어요. 앞 단계를 맞혀야 다음 단계가 열려요.' };

  /* ---- 문항 ---- */
  const T = n => '교과서 ' + n + '번', U = n => '유사 ' + n;
  const b = { lv: 1 }, ap = { lv: 3, lvn: '응용' }, ch = { lv: 4, lvn: '도전' };
  const N = (o, extra) => Object.assign({}, o, extra);

  const L1 = {
    id: 's91', label: '생각 다지기 ①', title: '교과서 기본 문제 + 유사', el: '닮은 도형의 성질 · 삼각형의 닮음 조건 · 닮은 도형의 넓이와 부피의 비',
    concept: { id: null, label: C1 }, concepts: [C1, C2, C7], core: core1,
    qs: [
      N(b, { tag: T('01'), concept: C1, t: 'steps', q: '△ABC ∽ △DEF입니다. BC = 4 cm, EF = 8 cm, DE = 6 cm, ∠A = 80°, ∠B = 50°일 때 (1) 닮음비 (2) AB의 길이 (3) ∠E의 크기를 단계에 따라 구하세요.', fig: fig01, steps: [
        { q: '① 닮음비 BC : EF는? (가장 간단한 자연수의 비)', opts: ['1 : 2', '2 : 1', '1 : 3'], ans: 0, hint: 'B ↔ E, C ↔ F이므로 BC의 대응변은 EF예요. 4 : 8을 간단히 해요.', why: 'BC : EF = 4 : 8 = 1 : 2' },
        { q: '② AB의 길이는?', t: 'num', unit: 'cm', ans: 3, hint: 'AB의 대응변은 DE(= 6 cm)예요.', why: 'AB : DE = 1 : 2이므로 AB = 6 × 1/2 = 3 cm' },
        { q: '③ ∠E의 크기는?', t: 'num', unit: '°', ans: 50, hint: '∠E의 대응각을 찾아요.', why: '닮은 도형에서 대응각의 크기는 같으므로 ∠E = ∠B = 50°' }] }),
      N(b, { tag: U('01'), concept: C1, t: 'steps', q: '△ABC ∽ △DEF입니다. AC = 12 cm, BC = 15 cm, DF = 8 cm, ∠A = 70°, ∠B = 45°일 때 닮음비, EF의 길이, ∠F의 크기를 단계에 따라 구하세요.', fig: figU01, steps: [
        { q: '① 닮음비 AC : DF는? (가장 간단한 자연수의 비)', opts: ['2 : 3', '3 : 2', '3 : 1'], ans: 1, hint: 'A ↔ D, C ↔ F이므로 AC의 대응변은 DF예요.', why: 'AC : DF = 12 : 8 = 3 : 2' },
        { q: '② EF의 길이는?', t: 'num', unit: 'cm', ans: 10, hint: 'BC의 대응변이 EF예요. BC : EF = 3 : 2', why: '15 : EF = 3 : 2이므로 EF = 15 × 2 ÷ 3 = 10 cm' },
        { q: '③ ∠F의 크기는?', t: 'num', unit: '°', ans: 65, hint: '∠F의 대응각은 ∠C예요. 삼각형의 세 각의 합은 180°', why: '∠C = 180° − 70° − 45° = 65°이고 ∠F = ∠C = 65°' }] }),
      N(b, { tag: T('02'), concept: C7, t: 'num', unit: 'cm²', ans: 117, q: '□ABCD ∽ □EFGH이고 □ABCD의 넓이가 52 cm²입니다. BC = 8 cm, FG = 12 cm일 때 □EFGH의 넓이는?', fig: fig02,
        hints: ['닮음비는 대응변 BC : FG예요.', '넓이의 비는 닮음비의 제곱이에요.'], why: '닮음비 8 : 12 = 2 : 3, 넓이의 비 4 : 9이므로 52 : (□EFGH) = 4 : 9, □EFGH = 52 × 9 ÷ 4 = 117 cm²' }),
      N(b, { tag: U('02'), concept: C7, t: 'num', unit: 'cm²', ans: 27, q: '□ABCD ∽ □EFGH이고 AB = 6 cm, EF = 10 cm입니다. □EFGH의 넓이가 75 cm²일 때 □ABCD의 넓이는?', fig: figU02,
        hints: ['닮음비는 AB : EF예요.', '작은 도형의 넓이를 구하는 거예요. 넓이의 비는 닮음비의 제곱이에요.'], why: '닮음비 6 : 10 = 3 : 5, 넓이의 비 9 : 25이므로 (□ABCD) : 75 = 9 : 25, □ABCD = 75 × 9 ÷ 25 = 27 cm²' }),
      N(b, { tag: T('03'), concept: C2, t: 'steps', q: '두 직선 AD, BE가 점 C에서 만납니다. AC = 3 cm, CD = 6 cm, BC = 4 cm, CE = 8 cm일 때, 서로 닮은 삼각형을 찾아 기호 ∽로 나타내고 닮음 조건을 쓰세요.', fig: fig03, steps: [
        { q: '① 서로 닮은 삼각형은?', opts: ['△ABC ∽ △DEC', '△ABC ∽ △EDC', '△ABC ∽ △DCE'], ans: 0, hint: '점 C를 지나는 두 직선에서 마주 보는 점끼리 대응해요. A와 D, B와 E', why: 'A ↔ D, B ↔ E, C ↔ C이므로 △ABC ∽ △DEC' },
        { q: '② 닮음 조건은?', opts: SC, ans: 1, hint: '변의 길이의 비 두 쌍과, 그 끼인각을 살펴봐요.', why: 'AC : CD = 3 : 6 = 1 : 2, BC : CE = 4 : 8 = 1 : 2이고 ∠ACB = ∠DCE(맞꼭지각)이므로 SAS 닮음' }] }),
      N(b, { tag: U('03'), concept: C2, t: 'steps', q: '두 직선 AD, BE가 점 C에서 만나고 AB ∥ DE입니다. AC = 4 cm, CD = 8 cm, AB = 5 cm일 때, 닮은 삼각형과 닮음 조건을 찾고 DE의 길이를 구하세요.', fig: figU03, steps: [
        { q: '① 서로 닮은 삼각형은?', opts: ['△ABC ∽ △DEC', '△ABC ∽ △EDC', '△ABC ∽ △CDE'], ans: 0, hint: 'A와 D, B와 E가 마주 보는 점이에요.', why: 'A ↔ D, B ↔ E, C ↔ C이므로 △ABC ∽ △DEC' },
        { q: '② 닮음 조건은?', opts: SC, ans: 2, hint: '길이는 한 쌍의 비만 알아요. 평행선과 맞꼭지각에서 같은 각을 찾아요.', why: 'AB ∥ DE이므로 ∠BAC = ∠EDC(엇각), ∠ACB = ∠DCE(맞꼭지각) → AA 닮음' },
        { q: '③ DE의 길이는?', t: 'num', unit: 'cm', ans: 10, hint: '닮음비는 AC : CD예요. AB의 대응변이 DE예요.', why: 'AC : CD = 4 : 8 = 1 : 2이므로 AB : DE = 1 : 2, DE = 5 × 2 = 10 cm' }] }),
      N(b, { tag: T('05'), concept: C7, t: 'steps', q: '두 직육면체는 서로 닮은 도형이고 모서리 DH와 LP가 대응합니다. DH = 6 cm, LP = 8 cm일 때 (1) 겉넓이의 비 (2) 부피의 비를 구하세요.', fig: fig05, steps: [
        { q: '① (1) 겉넓이의 비는?', opts: ['3 : 4', '9 : 16', '27 : 64'], ans: 1, hint: '닮음비는 DH : LP = 6 : 8 = 3 : 4예요. 겉넓이의 비는 닮음비를 제곱해요.', why: '닮음비 3 : 4이므로 겉넓이의 비는 3² : 4² = 9 : 16' },
        { q: '② (2) 부피의 비는?', opts: ['9 : 16', '27 : 64', '3 : 4'], ans: 1, hint: '부피의 비는 닮음비를 세제곱해요.', why: '부피의 비는 3³ : 4³ = 27 : 64' }] }),
      N(b, { tag: U('05'), concept: C7, t: 'steps', q: '두 직육면체는 서로 닮은 도형이고 대응하는 모서리의 길이가 각각 4 cm, 10 cm입니다. 작은 직육면체의 겉넓이가 52 cm², 부피가 24 cm³일 때 큰 직육면체의 겉넓이와 부피를 구하세요.', fig: figU05, steps: [
        { q: '① 닮음비는? (가장 간단한 자연수의 비)', opts: ['2 : 5', '5 : 2', '4 : 25'], ans: 0, hint: '4 : 10을 간단히 해요.', why: '4 : 10 = 2 : 5' },
        { q: '② 큰 직육면체의 겉넓이는?', t: 'num', unit: 'cm²', ans: 325, hint: '겉넓이의 비는 2² : 5² = 4 : 25', why: '52 : (큰 겉넓이) = 4 : 25이므로 큰 겉넓이 = 52 × 25 ÷ 4 = 325 cm²' },
        { q: '③ 큰 직육면체의 부피는?', t: 'num', unit: 'cm³', ans: 375, hint: '부피의 비는 2³ : 5³ = 8 : 125', why: '24 : (큰 부피) = 8 : 125이므로 큰 부피 = 24 × 125 ÷ 8 = 375 cm³' }] }),
      N(b, { tag: T('06'), concept: C2, t: 'steps', q: 'x, y의 값을 각각 구하세요. 닮음 조건을 먼저 찾고 식을 세워요. (1)은 AD = 4, BD = 11, AE = 5, CE = 7, DE = 6, (2)는 AD ⊥ BC, ∠B = ∠DAC, CD = 6, AC = 8입니다. (분수는 14/3처럼 써요)', fig: () => h('div', {}, fig06a(), f06b()), steps: [
        { q: '① (1) 닮은 두 삼각형과 닮음 조건은?', opts: ['△ADE ∽ △ACB (SAS 닮음)', '△ADE ∽ △ABC (SAS 닮음)', '△ADE ∽ △ACB (AA 닮음)'], ans: 0, hint: 'AD : AC와 AE : AB를 비교해 봐요. ∠A는 공통이에요.', why: 'AD : AC = 4 : 12 = 1 : 3, AE : AB = 5 : 15 = 1 : 3이고 ∠A는 공통이므로 △ADE ∽ △ACB (SAS 닮음)' },
        { q: '② x의 값은?', t: 'num', ans: 18, hint: 'DE : BC = 1 : 3', why: 'DE : BC = 1 : 3이므로 6 : x = 1 : 3, x = 18' },
        { q: '③ (2) 닮은 두 삼각형과 닮음 조건은?', opts: ['△ABC ∽ △DAC (AA 닮음)', '△ABC ∽ △ADC (AA 닮음)', '△ABC ∽ △DAC (SAS 닮음)'], ans: 0, hint: '같은 각이 두 쌍이에요. ∠B = ∠DAC, 그리고 공통인 ∠C', why: '∠B = ∠DAC, ∠C는 공통이므로 △ABC ∽ △DAC (AA 닮음). 대응은 A ↔ D, B ↔ A, C ↔ C' },
        { q: '④ y의 값은? (분수로 써요)', t: 'num', ans: 14 / 3, hint: '먼저 BC의 길이를 구해요. BC ↔ AC, AC ↔ CD', why: 'BC : AC = AC : CD이므로 BC : 8 = 8 : 6, BC = 32/3. y = BC − CD = 32/3 − 6 = 14/3' }] }),
      N(b, { tag: U('06'), concept: C2, t: 'steps', q: 'x, y의 값을 각각 구하세요. (1)은 AD = 3, BD = 7, AE = 5, CE = 1, DE = 4, (2)는 AD ⊥ BC, ∠B = ∠DAC, CD = 4, AC = 6입니다.', fig: () => h('div', {}, figU06a(), fU06b()), steps: [
        { q: '① (1) 닮은 두 삼각형과 닮음 조건은?', opts: ['△ADE ∽ △ABC (SAS 닮음)', '△ADE ∽ △ACB (SAS 닮음)', '△ADE ∽ △ACB (AA 닮음)'], ans: 1, hint: 'AD : AC와 AE : AB를 비교해 봐요. AB = 10, AC = 6', why: 'AD : AC = 3 : 6 = 1 : 2, AE : AB = 5 : 10 = 1 : 2이고 ∠A는 공통이므로 △ADE ∽ △ACB (SAS 닮음)' },
        { q: '② x의 값은?', t: 'num', ans: 8, hint: 'DE : BC = 1 : 2', why: 'DE : BC = 1 : 2이므로 4 : x = 1 : 2, x = 8' },
        { q: '③ (2) 닮은 두 삼각형과 닮음 조건은?', opts: ['△ABC ∽ △ADC (AA 닮음)', '△ABC ∽ △DAC (SAS 닮음)', '△ABC ∽ △DAC (AA 닮음)'], ans: 2, hint: '∠B = ∠DAC와 공통인 ∠C', why: '∠B = ∠DAC, ∠C는 공통이므로 △ABC ∽ △DAC (AA 닮음)' },
        { q: '④ y의 값은?', t: 'num', ans: 5, hint: 'BC : AC = AC : CD로 BC를 먼저 구해요.', why: 'BC : 6 = 6 : 4, BC = 9. y = BC − CD = 9 − 4 = 5' }] })
    ] };

  const L2 = {
    id: 's92', label: '생각 다지기 ②', title: '교과서 응용·도전 문제 + 유사', el: '닮은 도형의 넓이와 부피의 비 · 삼각형의 닮음 조건',
    concept: { id: null, label: C7 }, concepts: [C7, C2], core: core2,
    qs: [
      N(ap, { tag: T('04'), concept: C7, t: 'steps', q: 'A0 용지를 반으로 자른 것이 A1, A1을 반으로 자른 것이 A2, …입니다. 모든 용지가 서로 닮은 도형일 때 (1) A0와 A4의 넓이의 비 (2) 닮음비를 구하세요.', fig: () => fig04('A0 용지를 반으로 자르면 A1, A1을 반으로 자르면 A2, 이렇게 계속 자른 그림'), steps: [
        { q: '① (1) A0와 A4의 넓이의 비는?', opts: ['4 : 1', '8 : 1', '16 : 1'], ans: 2, hint: 'A0 → A1 → A2 → A3 → A4, 몇 번 반으로 잘랐나요?', why: '4번 반으로 잘랐으므로 넓이는 2⁴ = 16배, 넓이의 비는 16 : 1' },
        { q: '② (2) 닮음비는?', opts: ['2 : 1', '4 : 1', '16 : 1'], ans: 1, hint: '넓이의 비는 닮음비의 제곱이에요. 제곱해서 16이 되는 수는?', why: '닮음비를 m : n이라 하면 m² : n² = 16 : 1이므로 m : n = 4 : 1' }] }),
      N(ap, { tag: U('04'), concept: C7, t: 'steps', q: 'A0 용지의 넓이는 10000 cm²이고, 반으로 자를 때마다 A1, A2, …가 됩니다. 모든 용지가 닮은 도형일 때, A1과 A3의 넓이의 비와 닮음비, 그리고 A3의 넓이를 구하세요.', fig: () => fig04('A0 용지를 반으로 자르면 A1, A1을 반으로 자르면 A2, 이렇게 계속 자른 그림'), steps: [
        { q: '① A1과 A3의 넓이의 비는?', opts: ['2 : 1', '4 : 1', '8 : 1'], ans: 1, hint: 'A1 → A2 → A3, 몇 번 반으로 잘랐나요?', why: '2번 반으로 잘랐으므로 넓이의 비는 4 : 1' },
        { q: '② A1과 A3의 닮음비는?', opts: ['2 : 1', '4 : 1', '16 : 1'], ans: 0, hint: '넓이의 비 4 : 1 = 2² : 1²', why: '넓이의 비가 4 : 1 = 2² : 1²이므로 닮음비는 2 : 1' },
        { q: '③ A3의 넓이는?', t: 'num', unit: 'cm²', ans: 1250, hint: 'A0 → A3는 3번 반으로 잘랐어요. 즉 A0의 1/8이에요.', why: 'A0의 넓이 10000 cm²를 3번 반으로 자르면 10000 ÷ 8 = 1250 cm²' }] }),
      N(ap, { tag: T('07'), concept: C2, t: 'steps', q: '평행사변형 ABCD에서 점 E는 변 BC 위의 점이고 AC와 DE의 교점이 F입니다. AD = 9 cm, AF = 6 cm, CF = 4 cm일 때 BE의 길이를 구하세요.', fig: fig07, steps: [
        { q: '① 닮은 두 삼각형은?', opts: ['△AFD ∽ △CFE', '△AFD ∽ △EFC', '△ABF ∽ △CFE'], ans: 0, hint: 'AD ∥ BC이므로 엇각이 같아요.', why: 'AD ∥ BC이므로 ∠FAD = ∠FCE, ∠FDA = ∠FEC(엇각). A ↔ C, F ↔ F, D ↔ E이므로 △AFD ∽ △CFE (AA 닮음)' },
        { q: '② CE의 길이는?', t: 'num', unit: 'cm', ans: 6, hint: 'AF : CF = AD : CE', why: '6 : 4 = 9 : CE이므로 CE = 4 × 9 ÷ 6 = 6 cm' },
        { q: '③ BE의 길이는?', t: 'num', unit: 'cm', ans: 3, hint: '평행사변형에서 BC = AD예요.', why: 'BC = AD = 9 cm이므로 BE = BC − CE = 9 − 6 = 3 cm' }] }),
      N(ap, { tag: U('07'), concept: C2, t: 'steps', q: '평행사변형 ABCD에서 점 E는 변 BC 위의 점이고 AC와 DE의 교점이 F입니다. AD = 14 cm, AF = 8 cm, CF = 4 cm일 때 BE의 길이를 구하세요.', fig: figU07, steps: [
        { q: '① 닮은 두 삼각형은?', opts: ['△AFD ∽ △EFC', '△AFD ∽ △CFE', '△ADF ∽ △CFE'], ans: 1, hint: 'A ↔ C, D ↔ E, F ↔ F로 대응해요.', why: '△AFD ∽ △CFE (AA 닮음)' },
        { q: '② CE의 길이는?', t: 'num', unit: 'cm', ans: 7, hint: 'AF : CF = AD : CE', why: '8 : 4 = 14 : CE이므로 CE = 4 × 14 ÷ 8 = 7 cm' },
        { q: '③ BE의 길이는?', t: 'num', unit: 'cm', ans: 7, hint: 'BC = AD = 14 cm', why: 'BE = BC − CE = 14 − 7 = 7 cm' }] }),
      N(ap, { tag: T('09'), concept: C7, t: 'steps', q: '두 구 모양 스티로폼으로 눈사람을 만듭니다. 머리와 몸통의 부피의 합이 350π cm³이고 닮음비가 2 : 3일 때 몸통의 부피를 구하세요.', fig: () => fig09('머리', '몸통', '닮은 두 구 모양 스티로폼으로 만든 눈사람'), steps: [
        { q: '① 머리와 몸통의 부피의 비는?', opts: ['4 : 9', '8 : 27', '2 : 3'], ans: 1, hint: '부피의 비는 닮음비를 세제곱해요.', why: '2³ : 3³ = 8 : 27' },
        { q: '② 몸통의 부피는? (π 앞의 수만 쓰세요)', t: 'num', unit: 'π cm³', ans: 270, hint: '합 350π를 8 : 27로 나눠요. 8 + 27 = 35', why: '몸통은 전체의 27/35이므로 350π × 27/35 = 270π cm³' }] }),
      N(ap, { tag: U('09'), concept: C7, t: 'steps', q: '크기가 다른 두 눈덩이는 닮은 구이고 닮음비가 1 : 2입니다. 두 눈덩이의 부피의 합이 540π cm³일 때 큰 눈덩이의 부피를 구하세요.', fig: () => fig09('작은 눈덩이', '큰 눈덩이', '닮음비가 1 : 2인 두 눈덩이'), steps: [
        { q: '① 두 눈덩이의 부피의 비는?', opts: ['1 : 2', '1 : 4', '1 : 8'], ans: 2, hint: '부피의 비는 닮음비를 세제곱해요.', why: '1³ : 2³ = 1 : 8' },
        { q: '② 큰 눈덩이의 부피는? (π 앞의 수만 쓰세요)', t: 'num', unit: 'π cm³', ans: 480, hint: '1 + 8 = 9로 나눠요.', why: '큰 눈덩이는 전체의 8/9이므로 540π × 8/9 = 480π cm³' }] }),
      N(ch, { tag: T('08'), concept: C2, t: 'steps', q: '∠B = 90°, AB = 10 cm, BC = 15 cm인 직각삼각형 ABC의 안쪽에 정사각형 DBEF를 그렸습니다. 점 F가 변 AC 위에 있을 때 □DBEF의 넓이를 구하세요. (힌트: 정사각형의 한 변을 x로 놓고 △ADF와 닮은 삼각형을 찾아요.)', fig: fig08, steps: [
        { q: '① △ADF와 닮은 삼각형은?', opts: ['△ADF ∽ △ABC', '△ADF ∽ △ACB', '△ADF ∽ △BAC'], ans: 0, hint: '∠A는 공통이고 ∠ADF = ∠ABC = 90°예요.', why: 'A ↔ A, D ↔ B, F ↔ C이므로 △ADF ∽ △ABC (AA 닮음)' },
        { q: '② 정사각형의 한 변을 x cm라 할 때, 알맞은 비례식은?', opts: ['(10 − x) : 10 = x : 15', '(10 − x) : x = x : 15', '(10 − x) : 10 = 15 : x'], ans: 0, hint: 'AD = 10 − x예요. AD : AB = DF : BC', why: 'AD = 10 − x, DF = x이므로 AD : AB = DF : BC에서 (10 − x) : 10 = x : 15' },
        { q: '③ x의 값은?', t: 'num', unit: 'cm', ans: 6, hint: '내항의 곱 = 외항의 곱: 15(10 − x) = 10x', why: '150 − 15x = 10x이므로 25x = 150, x = 6' },
        { q: '④ □DBEF의 넓이는?', t: 'num', unit: 'cm²', ans: 36, hint: '정사각형의 넓이는 (한 변)²', why: '6 × 6 = 36 cm²' }] }),
      N(ch, { tag: U('08'), concept: C2, t: 'steps', q: '∠B = 90°, AB = 12 cm, BC = 24 cm인 직각삼각형 ABC의 안쪽에 정사각형 DBEF를 그렸습니다. 점 F가 변 AC 위에 있을 때 □DBEF의 넓이를 구하세요.', fig: figU08, steps: [
        { q: '① △ADF와 닮은 삼각형은?', opts: ['△ADF ∽ △ACB', '△ADF ∽ △ABC', '△ADF ∽ △BAC'], ans: 1, hint: '∠A는 공통이고 ∠ADF = ∠ABC = 90°예요.', why: 'A ↔ A, D ↔ B, F ↔ C이므로 △ADF ∽ △ABC (AA 닮음)' },
        { q: '② 정사각형의 한 변을 x cm라 할 때, 알맞은 비례식은?', opts: ['(12 − x) : x = x : 24', '(12 − x) : 12 = 24 : x', '(12 − x) : 12 = x : 24'], ans: 2, hint: 'AD = 12 − x예요. AD : AB = DF : BC', why: 'AD : AB = DF : BC에서 (12 − x) : 12 = x : 24' },
        { q: '③ x의 값은?', t: 'num', unit: 'cm', ans: 8, hint: '24(12 − x) = 12x', why: '288 − 24x = 12x이므로 36x = 288, x = 8' },
        { q: '④ □DBEF의 넓이는?', t: 'num', unit: 'cm²', ans: 64, hint: '정사각형의 넓이는 (한 변)²', why: '8 × 8 = 64 cm²' }] }),
      N(ch, { tag: T('10'), concept: C2, t: 'steps', q: '정삼각형 ABC를 DE를 접는 선으로 하여 꼭짓점 A가 변 BC 위의 점 F에 오도록 접었습니다. AC = 24 cm, AE = 14 cm, BF = 8 cm일 때 AD의 길이를 구하세요. (힌트: 접으면 DF = AD, EF = AE예요. △DBF와 △FCE는 AA 닮음이에요. 소수나 분수로 써요.)', fig: fig10, steps: [
        { q: '① △DBF ∽ △FCE가 되는 닮음 조건은?', opts: SC, ans: 2, hint: '길이는 아직 몰라요. ∠B = ∠C = 60°이고 ∠DFE = ∠A = 60°예요.', why: '∠B = ∠C = 60°, ∠BDF = 180° − 60° − ∠BFD = 120° − ∠BFD, ∠CFE = 180° − 60° − ∠BFD = 120° − ∠BFD이므로 ∠BDF = ∠CFE → AA 닮음' },
        { q: '② CF의 길이는?', t: 'num', unit: 'cm', ans: 16, hint: 'BC = 24 cm', why: 'CF = BC − BF = 24 − 8 = 16 cm' },
        { q: '③ CE의 길이는?', t: 'num', unit: 'cm', ans: 10, hint: 'AC = 24 cm이고 AE = 14 cm', why: 'CE = AC − AE = 24 − 14 = 10 cm' },
        { q: '④ AD = x cm라 할 때, 알맞은 비례식은?', opts: ['(24 − x) : 16 = 8 : 10', '(24 − x) : 8 = 16 : 10', 'x : 16 = 8 : 10'], ans: 0, hint: 'BD = 24 − x예요. 대응변: BD ↔ CF, BF ↔ CE', why: 'BD : CF = BF : CE이므로 (24 − x) : 16 = 8 : 10' },
        { q: '⑤ AD의 길이는?', t: 'num', unit: 'cm', ans: 56 / 5, hint: '10(24 − x) = 16 × 8', why: '240 − 10x = 128이므로 10x = 112, x = 56/5 = 11.2 cm' }] }),
      N(ch, { tag: U('10'), concept: C2, t: 'steps', q: '정삼각형 ABC를 DE를 접는 선으로 하여 꼭짓점 A가 변 BC 위의 점 F에 오도록 접었습니다. AC = 30 cm, AE = 21 cm, BF = 6 cm일 때 AD의 길이를 구하세요.', fig: figU10, steps: [
        { q: '① △DBF ∽ △FCE가 되는 닮음 조건은?', opts: SC, ans: 2, hint: '∠B = ∠C = 60°이고 ∠DFE = ∠A = 60°예요.', why: '∠B = ∠C = 60°이고 ∠BDF = ∠CFE이므로 AA 닮음' },
        { q: '② CF의 길이는?', t: 'num', unit: 'cm', ans: 24, hint: 'BC = 30 cm', why: 'CF = BC − BF = 30 − 6 = 24 cm' },
        { q: '③ CE의 길이는?', t: 'num', unit: 'cm', ans: 9, hint: 'AC = 30 cm이고 AE = 21 cm', why: 'CE = AC − AE = 30 − 21 = 9 cm' },
        { q: '④ AD = x cm라 할 때, 알맞은 비례식은?', opts: ['(30 − x) : 6 = 24 : 9', 'x : 24 = 6 : 9', '(30 − x) : 24 = 6 : 9'], ans: 2, hint: 'BD = 30 − x예요. BD ↔ CF, BF ↔ CE', why: 'BD : CF = BF : CE이므로 (30 − x) : 24 = 6 : 9' },
        { q: '⑤ AD의 길이는?', t: 'num', unit: 'cm', ans: 14, hint: '9(30 − x) = 24 × 6', why: '270 − 9x = 144이므로 9x = 126, x = 14 cm' }] })
    ] };

  grade.units.push({ id: 'vtb', name: 'Ⅴ. 도형의 닮음 (교과서 생각 다지기)', sub: '교과서 208~210쪽 문제 + 유사 문제', lessons: [L1, L2] });
})();
