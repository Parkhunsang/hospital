# 📓 개발 일지 — SCSS 디자인 토큰 고도화 및 스타일 리팩토링

> **작업 요약**
> 1. **자간(`letter-spacing`) 5단계 디자인 시스템 토큰 수립 및 전역 적용** (KRDS·Pretendard·Tailwind·Material 표준 기반)
> 2. **하드코딩된 수치(`px`, `rem`)의 디자인 토큰 변수화** (`$space-*`, `$radius-*`, `$font-*`)
> 3. **단축 속성(`background`)을 명시적 속성(`background-color`)으로 통일** (Transition 호환성 및 코드 명확성 개선)
> 4. **불필요한 `transition` 및 미작동 스타일 제거** (`.topbar`, `.doctors__card`)
> 5. **CSS 속성 선언 순서 표준화** (위치 → 표시/정렬 → 박스 모델 → 테두리/배경 → 타이포그래피 → 기타)

---

## 1. Letter Spacing(자간) 디자인 토큰 체계 수립 (`_variables.scss`)

### 💡 도입 배경
- 국문(`Pretendard`)과 영문(`Outfit` / `UPPERCASE`)이 혼용되는 프로젝트 특성상, 하드코딩된 자간 값(`-0.02em`, `0.05em`, `0.15em`)을 일관된 디자인 시스템 기준으로 통합 관리할 필요성 확인.
- 폰트 크기와 자간이 반비례하는 **시각 보정(Optical Sizing)** 원리와 **국내외 디자인 시스템 표준(KRDS, Pretendard, Tailwind CSS, Material Design)**을 근거로 5단계 스케일 정의.

### 📐 정의한 5단계 자간 토큰 및 설계 근거

| 토큰 변수명 | 설정값 | 레퍼런스 및 공학적 근거 | 주요 적용 대상 |
| :--- | :---: | :--- | :--- |
| `$letter-spacing-tight` | `-0.03em` (`-3%`) | **Apple HIG / Pretendard Optical Sizing**<br>폰트 크기가 클수록 글자 사이 물리적 여백도 커져 느슨해 보이므로, `30px` 이상 대형 타이틀은 기본보다 `1%` 더 조여 응집력 확보 | `.section-title`, `.subpage-hero__title`, `.brand-trust__title` (`$font-3xl` ~ `$font-5xl`) |
| `$letter-spacing-base` | `-0.02em` (`-2%`) | **KRDS(범정부 디자인 시스템) & Pretendard 국문 표준**<br>네모틀 한글 폰트에서 글자 뭉침 없이 단어 단위의 가독성을 가장 잘 형성하는 웹 표준 수치 | `body` 전역 기본값 (`$font-sm` ~ `$font-2xl` 일반 국문 본문/제목) |
| `$letter-spacing-normal` | `0` (`0%`) | **Material Design / 웹 접근성 가독성 원칙**<br>`12px` 이하 소형 텍스트나 **숫자(전화번호, 통계, 날짜, 시간)**에 음수 자간이 상속되면 획이 뭉쳐 인지가 어려워지므로 `0`으로 초기화 | `.badge`, `.footer__card-title--phone`, `.footer__card-time`, `.brand-trust__stat-num`, `.doctors__number`, `.news__date`, `.channel__phone`, `.section-title__eng-title` |
| `$letter-spacing-wide` | `0.05em` (`+5%`) | **Tailwind CSS (`tracking-wider`) 규격**<br>영문 서브 타이틀 및 대형 워터마크에서 알파벳 형태를 시원하게 보여주기 위한 양수 자간 | `.footer__watermark`, `.footer__card-eng-title`, `.subpage-hero__title--english` |
| `$letter-spacing-widest` | `0.1em` (`+10%`) | **Tailwind CSS (`tracking-widest`) / Material (`OVERLINE`) 규격**<br>`text-transform: uppercase`(영문 대문자)는 글자 높이가 모두 같아 직사각형 블록처럼 뭉쳐 보이므로 `+10%` 자간 부여 *(기존 임의값 `0.15em` → 표준 `0.1em` 보정)* | `.eyebrow`, `.badge--glass-gold` |

```scss
// scss/_variables.scss
$letter-spacing-tight: -0.03em;  // 대형 디스플레이($font-3xl ~ $font-5xl)
$letter-spacing-base: -0.02em;   // 국문 기본 본문 및 중형 제목($font-sm ~ $font-2xl)
$letter-spacing-normal: 0;       // 소형 캡션($font-xs), 숫자(전화번호/통계), 영문 일반 텍스트
$letter-spacing-wide: 0.05em;    // 영문 서브 타이틀 및 워터마크 (+5%)
$letter-spacing-widest: 0.1em;   // 영문 대문자(UPPERCASE) 라벨/아이브로우 (+10%)
```

---

## 2. 하드코딩 수치 → 디자인 토큰 변수화

기존 SCSS 파일 곳곳에 남아있던 하드코딩 수치(`px`, `rem`)를 `_variables.scss`의 토큰으로 교체하여 디자인 시스템 일관성을 강화했습니다.

- **Spacing 토큰(`$space-*`) 적용**
  - `layout.scss`: `.footer__card-badge` 패딩 `2px $space-xs` → `$space-2xs $space-xs`
  - `main.scss`: `.intro-door__content` 패딩 `50px 30px` → `$space-3xl $space-xl`
  - `pages/reservation.scss`: `.reservation__agreement-label` 패딩 `6px 18px` → `$space-2xs $space-md`
- **Border Radius 토큰(`$radius-*`) 적용**
  - `main.scss`: `.intro-door__mouse-icon` (`12px` → `$radius-md`), `.intro-door__mouse-wheel` 및 커스텀 스크롤바 (`4px` → `$radius-xs`)
  - `pages/neck.scss`: `.neck-compare__table-wrap` (`12px` → `$radius-md`)
- **Font Size 토큰(`$font-*`) 적용**
  - `sub-common.scss`: `.disease-nav__link` (`1rem` → `$font-base`)
  - `main.scss`: `.intro-door__scroll-hint` (`13px` → `$font-xss`), `.doctors__schedule-time` (`0.9375rem` → `$font-md`), `.news__tab-button` (`1rem` → `$font-md`)

---

## 3. `background` 단축 속성 → `background-color` 명시화 및 `transition` 정리

### 🔍 문제 원인 및 개선 내용
1. **단축 속성(`background`) 지양 및 `background-color` 통일**
   - 단일 색상만 지정하는 곳에 `background` 단축 속성을 쓰면 다른 배경 속성까지 암묵적으로 초기화되거나 `transition: background-color`와의 매칭이 직관적이지 않음.
   - `_variables.scss`(`@mixin glass`), `common.scss`, `components.scss`, `layout.scss`, `main.scss`, `pages/reservation.scss` 내 단색 배경 선언을 모두 `background-color`로 통일.
2. **작동하지 않는 죽은 `transition` 제거**
   - **`.topbar` (`layout.scss`)**: 실제 배경색과 그림자는 자식인 `.topbar__nav_wrap`이 담당하며, `.topbar` 자체는 스크롤 시 `transform`, `opacity`, `visibility`만 변경됨. 따라서 작동하지 않던 `background-color`, `border-color`, `box-shadow` 트랜지션 3종 제거.
   - **`.doctors__card` (`main.scss`)**: 부모 `.doctors__list`의 `overflow: hidden`에 의해 잘리고 시각적 효과가 없던 `:hover` 시의 `box-shadow: $shadow-sm` 및 `box-shadow 0.5s ease` 트랜지션 제거.

---

## 4. 수정된 파일 목록
- `scss/_variables.scss`
- `scss/common.scss` (`css/common.css`)
- `scss/components.scss` (`css/components.css`)
- `scss/layout.scss` (`css/layout.css`)
- `scss/sub-common.scss` (`css/sub-common.css`)
- `scss/main.scss` (`css/main.css`)
- `scss/pages/neck.scss` (`css/pages/neck.css`)
- `scss/pages/reservation.scss` (`css/pages/reservation.css`)
