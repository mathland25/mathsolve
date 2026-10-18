/* 중2-2 Ⅴ. 도형의 닮음 — 문제해결 데이터
   항목 id는 개념 탐구 노트 차시 id(l06 → s06)와 짝을 이룬다. el(평가 요소)은 개념 탐구 노트와 같은 문자열을 쓴다. */
(() => {
  const { F, h, label, seg } = window.SF;
  const GRADE = window.SOLVE_GRADES = window.SOLVE_GRADES || [];

  /* ---- 그림 ---- */
  const tA = { A: [30, 55], B: [10, 125], C: [90, 125] }, tD = { D: [165, 25], E: [130, 130], F: [250, 130] };
  const tri2 = Object.assign({}, tA, tD);
  const q1 = { A: [20, 45], B: [10, 125], C: [95, 125], D: [75, 55] }, q2 = { E: [130, 15], F: [120, 130], G: [255, 130], H: [225, 40] };

  const cyl = (cx, top, r, hh, fill) => h('s:g', {},
    h('s:path', { d: `M${cx - r} ${top} L${cx - r} ${top + hh} A${r} ${r * .3} 0 0 0 ${cx + r} ${top + hh} L${cx + r} ${top}`, fill: fill || 'var(--blue-soft)', 'fill-opacity': .6, stroke: 'var(--blue)', 'stroke-width': 2 }),
    h('s:ellipse', { cx, cy: top, rx: r, ry: r * .3, fill: fill || 'var(--blue-soft)', 'fill-opacity': .9, stroke: 'var(--blue)', 'stroke-width': 2 }),
    h('s:path', { d: `M${cx - r} ${top + hh} A${r} ${r * .3} 0 0 1 ${cx + r} ${top + hh}`, fill: 'none', stroke: 'var(--blue)', 'stroke-dasharray': '4 3' }));
  const figCyl = () => h('div', { class: 'figbox' }, h('s:svg', { viewBox: '-10 -10 300 200', class: 'qfig', role: 'img', 'aria-label': '닮은 두 원기둥 A, B' },
    cyl(75, 50, 26, 66), cyl(210, 20, 39, 99, 'var(--green-soft)'),
    label(75, 18, '원기둥 A', 'svgt'), label(210, 8, '원기둥 B', 'svgt'),
    label(75, 150, '높이 6 cm', 'svgm'), label(75, 166, '반지름 4 cm', 'svgm'), label(210, 160, '높이 9 cm', 'svgm')),
    h('div', { class: 'figcap', text: '※ 그림은 실제 크기와 다를 수 있어요.' }));

  const sector = (O, r, a, fill) => { const rad = a * Math.PI / 360, p1 = [O[0] + r * Math.cos(-rad), O[1] + r * Math.sin(-rad)], p2 = [O[0] + r * Math.cos(rad), O[1] + r * Math.sin(rad)];
    return h('s:path', { d: `M${O[0]} ${O[1]} L${p1[0]} ${p1[1]} A${r} ${r} 0 0 1 ${p2[0]} ${p2[1]} Z`, fill, 'fill-opacity': .6, stroke: 'var(--blue)', 'stroke-width': 2, 'stroke-linejoin': 'round' }); };
  const figSector = () => h('div', { class: 'figbox' }, h('s:svg', { viewBox: '-10 -10 300 190', class: 'qfig', role: 'img', 'aria-label': '중심각 72°로 같은 두 부채꼴 A, B' },
    sector([15, 85], 62, 72, 'var(--blue-soft)'), sector([115, 85], 100, 72, 'var(--green-soft)'),
    label(48, 30, '부채꼴 A', 'svgt'), label(180, 10, '부채꼴 B', 'svgt'),
    label(30, 122, '5 cm', 'svgm'), label(143, 138, '8 cm', 'svgm'), label(44, 89, '72°', 'svgm'), label(150, 89, '72°', 'svgm'),
    label(72, 140, '호의 길이 2π cm', 'svgm'), label(190, 160, '호의 길이 ?', 'svgm')),
    h('div', { class: 'figcap', text: '※ 그림은 실제 크기와 다를 수 있어요.' }));

  const CAUSES = ['개념을 잘 몰랐어요', '대응하는 변·각을 잘못 찾았어요', '식을 잘못 세웠어요', '계산 실수예요', '문제를 잘못 읽었어요'];

  const s06 = {
    id: 's06', label: 'Ⅴ-1차시', title: '닮은 도형', el: '닮은 도형의 성질',
    concept: { id: 'l06', label: 'Ⅴ-1차시 닮은 도형' },
    core: {
      defs: [['닮음', '한 도형을 일정한 비율로 확대하거나 축소한 도형이 다른 도형과 합동일 때, 두 도형은 닮음 관계에 있다고 해요.'], ['닮음비', '닮은 두 도형에서 대응하는 변의 길이의 비'], ['기호', '△ABC ∽ △DEF — 대응하는 꼭짓점의 순서대로 써요.']],
      points: ['닮은 두 평면도형에서 대응하는 변의 길이의 비는 일정하고, 대응하는 각의 크기는 각각 같다.', '닮은 두 입체도형에서 대응하는 모서리의 길이의 비는 일정하고, 대응하는 면은 닮은 도형이다.', '닮음비가 1 : 1이면 합동이다.'],
      note: '△ABC ∽ △DEF이면 A↔D, B↔E, C↔F가 대응해요. 순서가 바뀌면 대응도 바뀌니 꼭 확인하세요.'
    },
    qs: [
      { lv: 1, t: 'num', unit: 'cm', ans: 15, q: '△ABC ∽ △DEF이고 AB = 4 cm, BC = 6 cm, DE = 10 cm입니다. EF의 길이는?',
        fig: () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], txt: [['A', 'B', '4'], ['B', 'C', '6', 16], ['D', 'E', '10'], ['E', 'F', '?', 16]], alt: '닮은 두 삼각형 ABC, DEF' }),
        hints: ['대응변을 찾아요. AB ↔ DE, BC ↔ EF', '닮음비는 AB : DE = 4 : 10 = 2 : 5예요. BC : EF도 2 : 5예요.'],
        why: 'AB : DE = BC : EF이므로 4 : 10 = 6 : EF, EF = 6 × 10 ÷ 4 = 15 cm' },
      { lv: 1, t: 'num', unit: '°', ans: 65, q: '△ABC ∽ △DEF이고 ∠A = 75°, ∠B = 40°입니다. ∠F의 크기는?',
        fig: () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], ang: [['A', 'B', 'C', '75°'], ['B', 'C', 'A', '40°'], ['F', 'D', 'E', '?']], alt: '닮은 두 삼각형, ∠A = 75°, ∠B = 40°' }),
        hints: ['∠F에 대응하는 각은 ∠C예요.', '삼각형의 세 각의 합은 180°예요.'],
        why: '∠C = 180° − 75° − 40° = 65°이고, 닮은 도형에서 대응각의 크기는 같으므로 ∠F = ∠C = 65°' },
      { lv: 2, t: 'choice', opts: ['DE', 'DF', 'EF'], ans: 1, q: '△ABC ∽ △DEF일 때, 변 AC에 대응하는 변은?',
        fig: () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], alt: '닮은 두 삼각형 ABC, DEF' }),
        hints: ['닮음 기호 양쪽에서 같은 자리에 있는 꼭짓점끼리 대응해요.', 'A ↔ D예요. 그러면 C와 대응하는 꼭짓점은?'],
        why: 'A ↔ D, C ↔ F이므로 변 AC의 대응변은 DF' },
      { lv: 2, t: 'num', unit: 'cm', ans: 15, q: '사각형 ABCD ∽ 사각형 EFGH이고 AB = 12 cm, BC = 9 cm, EF = 20 cm입니다. FG의 길이는?',
        fig: () => F({ w: 270, P: Object.assign({}, q1, q2), poly: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']], txt: [['A', 'B', '12'], ['B', 'C', '9', 16], ['E', 'F', '20'], ['F', 'G', '?', 16]], alt: '닮은 두 사각형 ABCD, EFGH' }),
        hints: ['AB ↔ EF, BC ↔ FG가 대응해요.', '닮음비는 AB : EF = 12 : 20 = 3 : 5예요.'],
        why: 'AB : EF = BC : FG이므로 12 : 20 = 9 : FG, FG = 9 × 20 ÷ 12 = 15 cm' },
      { lv: 2, t: 'num', unit: 'π cm', ans: 12, q: '닮은 두 원기둥 A, B의 높이가 각각 6 cm, 9 cm이고 원기둥 A의 밑면의 반지름은 4 cm입니다. 원기둥 B의 밑면의 둘레의 길이는? (π는 그대로 두고, π 앞의 수만 쓰세요)',
        fig: figCyl,
        hints: ['닮은 입체도형에서 대응하는 모서리(높이, 반지름)의 길이의 비는 일정해요.', '높이의 비 6 : 9 = 2 : 3이므로 반지름의 비도 2 : 3이에요.'],
        why: '반지름의 비가 2 : 3이므로 4 : (B의 반지름) = 2 : 3, B의 반지름은 6 cm. 밑면의 둘레는 2π × 6 = 12π cm' },
      { lv: 3, t: 'num', unit: 'cm', ans: 31.5, q: '△ABC ∽ △DEF이고 AB = 6 cm, BC = 7 cm, AC = 8 cm, DE = 9 cm입니다. △DEF의 둘레의 길이는?',
        fig: () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], txt: [['A', 'B', '6'], ['B', 'C', '7', 16], ['A', 'C', '8'], ['D', 'E', '9']], alt: '닮은 두 삼각형, AB = 6, BC = 7, AC = 8, DE = 9' }),
        hints: ['먼저 △ABC의 둘레를 구해요.', '닮은 도형의 둘레의 비도 닮음비와 같아요. 닮음비는 AB : DE = 6 : 9 = 2 : 3'],
        why: '△ABC의 둘레는 6 + 7 + 8 = 21 cm. 닮음비 2 : 3이므로 21 : (△DEF의 둘레) = 2 : 3, 둘레 = 21 × 3 ÷ 2 = 31.5 cm' },
      { lv: 3, t: 'num', unit: 'π cm', ans: 3.2, q: '중심각의 크기가 72°로 같은 두 부채꼴 A, B는 닮은 도형입니다. 반지름은 각각 5 cm, 8 cm이고 부채꼴 A의 호의 길이는 2π cm입니다. 부채꼴 B의 호의 길이는? (π 앞의 수만 쓰세요. 분수는 소수로 써요)',
        fig: figSector,
        hints: ['호의 길이도 대응하는 길이예요. 닮음비는 반지름의 비와 같아요.', '닮음비 5 : 8 = (A의 호) : (B의 호)'],
        why: '닮음비가 5 : 8이므로 2π : (B의 호) = 5 : 8, B의 호 = 2π × 8 ÷ 5 = 3.2π cm' },
      { lv: 4, t: 'steps', q: '△ABC ∽ △DEF이고 AB = 8 cm, BC = 10 cm, DE = 12 cm, ∠A = 70°, ∠B = 50°입니다. EF의 길이와 ∠F의 크기를 단계에 따라 구하세요.',
        fig: () => F({ w: 270, P: tri2, poly: [['A', 'B', 'C'], ['D', 'E', 'F']], txt: [['A', 'B', '8'], ['B', 'C', '10', 16], ['D', 'E', '12']], ang: [['A', 'B', 'C', '70°'], ['B', 'C', 'A', '50°']], alt: '닮은 두 삼각형, AB = 8, BC = 10, DE = 12, ∠A = 70°, ∠B = 50°' }),
        steps: [
          { q: '① 변 AB에 대응하는 변은?', opts: ['DE', 'DF', 'EF'], ans: 0, hint: 'A ↔ D, B ↔ E예요.', why: 'A ↔ D, B ↔ E이므로 AB의 대응변은 DE' },
          { q: '② 닮음비 AB : DE는? (가장 간단한 자연수의 비)', opts: ['2 : 3', '3 : 2', '4 : 5'], ans: 0, hint: '8 : 12를 최대공약수로 나눠요.', why: '8 : 12 = 2 : 3' },
          { q: '③ EF의 길이를 구하는 알맞은 비례식은?', opts: ['AB : DE = BC : EF', 'AB : DE = BC : DF', 'AB : BC = DE : DF'], ans: 0, hint: 'BC에 대응하는 변이 무엇인지 먼저 찾아요.', why: 'B ↔ E, C ↔ F이므로 BC ↔ EF. 따라서 AB : DE = BC : EF' },
          { q: '④ EF의 길이는?', t: 'num', unit: 'cm', ans: 15, hint: '8 : 12 = 10 : EF', why: 'EF = 10 × 12 ÷ 8 = 15 cm' },
          { q: '⑤ ∠F의 크기는?', t: 'num', unit: '°', ans: 60, hint: '∠C를 먼저 구해요. ∠F의 대응각이에요.', why: '∠C = 180° − 70° − 50° = 60°이고 ∠F = ∠C = 60°' }
        ] }
    ]
  };

  GRADE.push({ id: 'g2-2', label: '중2-2', units: [{ id: 'v', name: 'Ⅴ. 도형의 닮음', sub: '닮음과 피타고라스 정리', lessons: [s06],
    planned: [['Ⅴ-2차시', '삼각형의 닮음 조건'], ['Ⅴ-2차시 직각삼각형', '직각삼각형의 닮음'], ['Ⅴ-3·4차시', '평행선과 선분의 길이의 비'], ['Ⅴ-5차시', '평행선 사이의 선분의 길이의 비'], ['Ⅴ-6차시', '삼각형의 무게중심'], ['Ⅴ-7차시', '닮은 도형의 넓이와 부피'], ['Ⅴ-8차시', '피타고라스 정리']] }] });
  window.SOLVE_CAUSES = CAUSES;
})();
