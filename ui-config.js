/*
 * 화면 문구와 링크만 모아둔 설정 파일입니다.
 * 디자인 코드를 건드리지 않고 따옴표 안의 글자와 주소만 바꾸면 됩니다.
 */
window.COWAY_UI_CONFIG = {
  brand: {
    name: "coway",
    logo: "logo.png"
  },

  copy: {
    pageTitle: "COWAY 홈케어",
    productMenu: "제품",
    benefitMenu: "혜택",
    toolsMenu: "도구",

    heroLabel: "제품 둘러보기",
    heroTitle: "고객님께 맞는 제품을\n한눈에 찾아보세요",
    heroDescription: "제품과 월 렌탈료를 바로 확인할 수 있어요.",
    heroAction: "제품 보러가기",

    shortcutTitle: "바로가기",
    benefitTitle: "이번 달 혜택",
    benefitDescription: "프로모션과 제휴카드 할인",
    reportTitle: "안심 리포트",
    reportDescription: "미세먼지와 바깥 날씨",
    galleryTitle: "갤러리",
    galleryDescription: "제품과 설치 사례",

    toolSheetTitle: "업무 도구",
    toolSheetDescription: "상담 중 자주 쓰는 화면과 회사 앱을 모았어요.",
    disconnected: "연결 전"
  },

  routes: {
    home: "main.html",
    products: "calc.html",
    benefits: "benefit.html",
    report: "weather.html",
    gallery: "gallery.html"
  },

  /*
   * url에 회사 앱 실행 주소나 웹 주소를 입력하면 메뉴가 활성화됩니다.
   * 예: url: "https://www.example.com"
   */
  tools: [
    {
      label: "회사 앱 열기",
      description: "업무용 앱 바로가기",
      icon: "apps",
      url: ""
    },
    {
      label: "코웨이 공식몰",
      description: "공식 제품 페이지",
      icon: "language",
      url: ""
    },
    {
      label: "상담 바로가기",
      description: "전화·문자·상담 링크",
      icon: "support_agent",
      url: ""
    }
  ]
};
