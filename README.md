# 문제해결 플랫폼

개념 탐구 노트([mathconcept](https://mathland25.github.io/mathconcept/))로 개념을 익힌 뒤, 적용·응용 문제로 2회고사를 대비하는 학생용 앱입니다.
배포 주소: https://mathland25.github.io/mathsolve/ · 교사용 화면: 주소 끝에 `#teacher`

- 로그인·서버 없음. 기록은 기기(localStorage `solve-v1`)에 저장하고, 구글 폼(개념 탐구 노트와 같은 폼·시트)으로 제출합니다.
- 학생은 이름(띄어쓰기 없이)과 반(2-1 형식)을 입력합니다. 교사용 화면에서 이름+반이 같으면 같은 학생으로 합칩니다.

## 구조
| 파일 | 내용 |
|---|---|
| `index.html`, `style.css`, `app.js` | 화면과 로직 (학년/단원 선택, 문제 엔진, 제출, 교사용) |
| `helpers.js` | 개념 탐구 노트와 같은 SVG 그림 도우미 `F()` |
| `data/g2-2-v.js` | 중2-2 Ⅴ단원 문제 데이터 (새 단원은 `data/`에 파일을 추가하고 `index.html`에 `<script>` 한 줄 추가) |
| `catalog.json` | 항목 목록 (통합 교사용 화면이 읽음) — 항목을 추가하면 같이 고칠 것 |
| `tools/verify.js` | 정답 재계산·선분 표기(알파벳순)·catalog 일치·제출 코드 왕복 점검: `node tools/verify.js` |

## 제출 코드 약속
`GN2z.<base64url(deflate-raw(JSON))>` · JSON `{v:2, app:'solve', id, name, cls, at, day, ls:{ 항목id:{s,d,c:[첫시도정답수,문항수],p,r,u} }}`
추가 필드: `k`(푼 문항 수), `w`(틀린 까닭별 횟수), `hn`(힌트 본 문항 수), `ss`(서술형 단계 [첫 시도 맞힌 수, 전체]).
항목 id는 개념 탐구 노트 차시 id에 대응합니다(`l06` → `s06`). 평가 요소(`el`)는 개념 탐구 노트와 같은 문자열입니다.

## 교과서 생각 다지기 데이터
- data/g2-2-v-tb.js (도형의 닮음 ①②), g2-2-v-tb2.js (닮은 도형의 성질 ①②), g2-2-vi.js (경우의 수 ①②, 확률 ①②), g2-2-vi-m.js (단원 매듭 ①②③). 각 교과서 문항 뒤에 유사 문제를 붙였고, 정답은 tools/verify.js가 조건에서 다시 계산한다.
