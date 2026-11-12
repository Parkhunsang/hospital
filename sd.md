1. 진단: 왜 스타일이 이렇게 많아졌을까? (3가지 핵심 원인)

76개 선택자를 분석해 본 결과, 스타일이 폭발적으로 늘어난 이유는 아래 3가지입니다.

같은 폰트 크기 안에서 font-weight가 5단계(400 / 500 / 600 / 700 / 800)로 쪼개져 있음
예: $font-base(16px), $font-md(15px), $font-sm(14px) 각각에 400, 500, 600, 700, 800이 모두 존재합니다. 실무에서는 한 사이즈당 최대 2~3가지 두께(예: Medium 500 / Bold 700, 타이틀만 ExtraBold 800)로 통일합니다.
16px($font-base) ↔ 15px($font-md) ↔ 14px($font-sm), 그리고 13px($font-xss) ↔ 12px($font-xs)의 역할 중복
버튼만 봐도 .primary-button은 16px(700), .non-surgical**card-btn과 .news**tab-button은 15px(700), .footer**card-btn은 14px(600), .channel**btn span은 13px(600)으로 모두 다릅니다.
line-height 미선언 선택자 다수
같은 24px / 800인데 .card-title은 line-height: 1.35가 있고, .hero-3d**info-title과 .reservation**title은 line-height가 빠져 있어 피그마/코드 상에서 서로 다른 스타일처럼 분리되어 있습니다.
📊 2. 76개 선택자 통폐합 및 최적화 그룹핑

76개 선택자를 역할과 수치 기준으로 묶으면 아래 6개 카테고리(약 12~14개 표준 스타일)로 완벽히 압축됩니다.

① Display & Page Heading (36px / $font-4xl)
통합 프리셋	현재 묶이는 선택자	최적화 포인트
Display-KR
(36px / 800 / 1.35 / -0.03em)	.section-title (clamp 24~36), .brand-trust__title, .subpage-hero__title (현재 1.25)	3개 모두 메인/서브 대형 타이틀이므로 행간(1.25 또는 1.35)까지 맞추면 1개로 통일 가능
Display-Num
(36px / 800 / 1 / 0)	.brand-trust__stat-num, .doctors__number (현재 2.25rem 하드코딩)	완전히 동일한 대형 숫자 스타일 (2.25rem → $font-4xl 통일)
(예외 단일 요소)	.footer__watermark (clamp(40px, 8vw, 120px))	배경 장식용이므로 프리셋 제외 (개별 유지)
② Card & Section Sub-Title (24px / $font-2xl & 20px / $font-xl)
통합 프리셋	현재 묶이는 선택자	최적화 포인트
Title-LG (24px)
($font-2xl / 800 / 1.35) .card-title, .hero-3d**info-title, .reservation**title, .footer**card-title--phone (자간 0) .hero-3d**info-title과 .reservation**title에 누락된 line-height: $line-height-heading을 넣으면 4개가 완전히 동일한 스타일이 됨
Title-MD (20px)
($font-xl / 700~800 / 1.35) .self-test**result-title (800), .footer**card-title (700) 두께를 700(또는 800)으로 통일하면 1개 프리셋으로 통합
Title-Sub-EN
(20~24px / 400~500 / 1.35) .subpage-hero**title--english (24px/400), .section-title**eng-title (20px/500), .intro-door**desc (20px/400/1.7) 서브 타이틀/인트로 문구 계열
③ Body & Content (18px / 16px / 15px / 14px 본문 계열)

현재 @include text-desc가 쓰이던 곳들로, 가장 많이 중복되어 있는 구간입니다.

통합 프리셋 현재 묶이는 선택자 최적화 포인트
Body-LG (18px)
($font-lg / 500 / 1.7)	.brand-trust__desc, .hero-3d__welcome-title (현재 600)	강조형 리드 문구
Body-Base-Loose (16px 장문)
($font-base / 500 / 1.7) .section-desc, .showcase-slider**card-desc, .fast-diagnosis**step-desc, .self-test**desc 4개가 100% 동일한 코드입니다.
Body-Base (16px 일반)
($font-base / 500~600 / 1.5) .causes-text**desc (500), .symptoms**text (600), .doctors**role (600), .self-test**text (600) 두께를 500(기본)과 600(강조) 2종으로 정리
Body-MD (15px 본문/리스트)
($font-md / 500 / 1.5) .footer**brand-tagline, .doctors**spec-text, .neck-compare**td, .sub-eyebrow (1.7), .showcase-slider**features-item (600) 15px 설명문/리스트를 단일 규격(15px / 500 / 1.5)으로 통일
Body-SM (14px 보조 본문)
($font-sm / 500 / 1.5) .footer**card-text, .news**desc, .lnb**sub-link, .footer\_\_legal-item a (400→500 통일 권장) 400과 500으로 나뉜 것을 500 하나로 통합
④ UI / Button / Navigation (16px / 15px / 14px 볼드 UI 계열)

버튼, 탭, 테이블 헤더, 네비게이션 링크처럼 단일 행(line-height: 1 또는 1.35) + 굵은 글씨(600~700)로 쓰이는 그룹입니다.

통합 프리셋 현재 묶이는 선택자 최적화 포인트
UI-Base-Bold (16px)
($font-base / 700 / 1.35)	.primary-button, .ghost-button, .slider-nav__btn, .hero-3d__pain-text(.hero-3d__menu-text), .channel__title, .neck-compare__th, .doctors__spec-info, .brand-trust__stat-val small, .news__title (800→700)	16px / 700으로 쓰는 선택자가 무려 9개입니다. 하나로 묶으면 관리가 매우 쉬워집니다.
UI-Base-Nav (16px 메뉴)
($font-base / 500 / 1) .gnb**link, .drawer**link, .gnb**sub-link (400), .disease-nav**link (600) GNB/드로어/탭 네비게이션 링크 그룹
UI-MD-Bold (15px 버튼/탭)
($font-md / 700 / 1.35)	.info-badge__desc, .fast-diagnosis__btn-more, .non-surgical__card-btn, .reservation__submit-btn, .news__tab-button, .neck-compare__th--row, .doctors__schedule-time (800)	15px / 700 선택자 7개가 완벽히 같은 역할입니다.
UI-MD-SemiBold (15px 인풋/링크)
($font-md / 600 / 1.35) .hero-3d**disease-link, .lnb**button, .footer**card-time, .reservation**input, .reservation**select (500), .drawer**sub-link (400) 폼 요소 및 서브 메뉴 버튼
UI-SM-Bold (14px 라벨/소형버튼)
($font-sm / 600~700 / 1)	.brand-trust__stat-label (700), .doctors__schedule-label (700), .brand-trust__current-index, .brand-trust__total-index (800), .footer__card-btn (600), .footer__card-traffic-item strong (600), .footer__card-eng-title (600)	14px 라벨/버튼의 두께(600/700/800)를 600 또는 700 하나로 통일하면 7개가 1개 스타일로 합쳐집니다!
⑤ Caption & Badge (13px / $font-xss & 12px / $font-xs)
통합 프리셋	현재 묶이는 선택자	최적화 포인트
Caption (13px)
($font-xss / 500~600 / 1.5) .intro-door**scroll-hint (600), .news**date (600), .channel**btn span (600), .reservation**agreement-label (500), .reservation**privacy-btn (500), .footer**legal-text (500) 13px 보조 텍스트 6종
Badge / Eyebrow (12px)
($font-xs / 700~800 / 1) .badge (700), .footer\_\_card-badge (600→700 통일 권장), .eyebrow (800, uppercase, 0.1em) 소형 뱃지 및 아이브로우
🛠️ 3. 어떻게 관리하는 게 가장 좋을까? (@mixin 활용법 3가지 비교)

기존 @mixin text-desc에서 word-break: keep-all; overflow-wrap: break-word;는 제거하고(대신 body나 타이틀/설명문 공통 규칙으로 한 번만 선언), 타이포그래피를 관리하는 3가지 실무 패턴입니다.

방법 1. [가장 추천 ⭐] 기본 조립형 @mixin font + 핵심 시맨틱 @mixin 병행

피그마의 핵심 Text Style(타이틀, 본문, 뱃지 등 자주 반복되는 6~8개)은 전용 프리셋 믹스인으로 만들고, 나머지 미세 조정이 필요한 UI 요소는 한 줄짜리 @include typo(...) 유틸리티 믹스인으로 선언하는 방식입니다.

📌 \_variables.scss 작성 예시
scss
// 1. 베이스 타이포그래피 믹스인 (4줄을 1줄로 단축!)
@mixin typo(
$size: $font-base,
  $weight: 500,
  $line-height: $line-height-body,
  $tracking: null
) {
  font-size: $size;
  font-weight: $weight;
  line-height: $line-height;
  @if $tracking != null {
    letter-spacing: $tracking;
  }
}
// 2. 피그마 Text Style과 1:1 매칭되는 핵심 프리셋 믹스인
@mixin text-display {
  @include typo($font-4xl, 800, $line-height-heading, $letter-spacing-tight);
}
@mixin text-title-lg {
  @include typo($font-2xl, 800, $line-height-heading);
}
@mixin text-title-md {
  @include typo($font-xl, 700, $line-height-heading);
}
@mixin text-body-lg {
  @include typo($font-base, 500, $line-height-loose); // 기존 text-desc 대체!
}
@mixin text-body-md {
  @include typo($font-md, 500, $line-height-body);
}
@mixin text-body-sm {
  @include typo($font-sm, 500, $line-height-body);
}
@mixin text-caption {
  @include typo($font-xss, 500, $line-height-body, $letter-spacing-normal);
}
📌 실제 SCSS 파일에서 사용하는 모습
scss
// Case A: 피그마 프리셋과 딱 맞아떨어지는 경우 -> 시맨틱 믹스인 호출
.card-title,
.hero-3d__info-title,
.reservation__title {
  @include text-title-lg;
  color: $color-primary;
}
.section-desc,
.showcase-slider__card-desc,
.fast-diagnosis__step-desc,
.self-test__desc {
  @include text-body-lg;
}
// Case B: 버튼/네비게이션 등 개별 조합이 필요한 경우 -> @include typo() 한 줄로 끝!
.non-surgical__card-btn {
  @include typo($font-md, 700, $line-height-none);
  color: $color-secondary;
}
.eyebrow {
  @include typo($font-xs, 800, $line-height-none, $letter-spacing-widest);
  color: $color-secondary;
  text-transform: uppercase;
}
방법 2. 피그마 스타일 이름 맵핑형 (@mixin text-style($name))

피그마에 등록한 Text Style 이름을 그대로 문자열로 넘겨 쓰는 방식입니다. 디자이너와 협업하거나 피그마 토큰 이름을 코드에 강제하고 싶을 때 많이 씁니다.

scss
@mixin text-style($name) {
@if $name == "heading-xl" {
font-size: $font-4xl;
font-weight: 800;
line-height: $line-height-heading;
letter-spacing: $letter-spacing-tight;
} @else if $name == "title-lg" {
font-size: $font-2xl;
font-weight: 800;
line-height: $line-height-heading;
} @else if $name == "body-lg" {
font-size: $font-base;
font-weight: 500;
line-height: $line-height-loose;
}
// ...
}
// 사용 예시
.subpage-hero\_\_title {
@include text-style("heading-xl");
}
장점: 피그마에 없는 임의의 폰트 스타일을 만드는 것을 원천 차단할 수 있음
단점: 자동완성(IntelliSense)이 안 되고, 반응형에서 폰트 크기만 바꿀 때 유연성이 떨어짐
방법 3. word-break: keep-all 분리 처리

기존 @mixin text-desc에 들어있던 word-break: keep-all; overflow-wrap: break-word;는 어차피 한글 웹사이트 전체의 가독성을 위한 속성이므로, common.scss의 body에 전역으로 한 번만 선언해 두면 모든 타이틀과 본문에서 일일이 넣을 필요가 없어집니다!

scss
// common.scss
body {
background-color: $color-white;
font-family: $font-family-base;
letter-spacing: $letter-spacing-base;
color: $color-primary;
word-break: keep-all; // ✅ 전역으로 한 번만 선언!
overflow-wrap: break-word; // ✅ 전역으로 한 번만 선언!
}
💡 요약 및 제안
common.scss의 body로 word-break: keep-all; overflow-wrap: break-word; 이동: 각 선택자와 믹스인에 중복 선언된 word-break: keep-all을 모두 지울 수 있습니다.
방법 1 (@mixin typo + 핵심 프리셋 @mixin) 도입:
기존 @mixin text-desc를 걷어내고,
위 표에서 정리한 것처럼 중복되거나 미세하게 다른 두께(400/500, 700/800)를 표준 프리셋으로 통일하면 피그마 Text Style도 10개 내외로 깔끔하게 떨어지고 SCSS 코드량도 대폭 줄어듭니다.

위 방향(방법 1 + body에 word-break 전역화)이 마음에 드시는지, 그리고 두께/크기 통폐합(예: 14px의 400→500, 버튼류의 700 통일 등)까지 함께 진행할지 알려주시면 바로 설계해서 적용해 드릴게요!
