# Front-end

## 📝 프로젝트 설명

Agentic AI Busan은 부산 여행 정보를 제공하는 AI 기반 서비스입니다. 부산의 맛집, 관광지 등 다양한 정보를 자연어 질의응답 방식으로 제공하여 사용자들의 여행 계획을 돕습니다.

현재는 Naive RAG(Retrieval-Augmented Generation) 시스템으로 구현되어 있으며, 단계적으로 Advanced RAG, Modular RAG, 에이전트 시스템으로 발전시킬 계획입니다.

이 프로젝트는 [OKESTRO AGI(주)](https://www.lifelogm.co.kr/index.html)의 지원을 받았습니다.

주요 기능:

- AI 기반 여행지 및 경로 추천
- 사용자 맞춤 일정 편집 기능
- 로그인/회원가입 및 사용자 정보 관리
- 여행지 검색 기능
- 여행지 상세 정보 제공: 선택한 맛집, 관광지 등에 대한 사진, 설명, 운영 시간, 사용자 메모 등 상세 정보 제공
- 나만의 일정 저장 및 관리: 생성하거나 추천받은 여행 일정을 저장하고 언제든지 다시 불러와 수정하거나 확인할 수 있는 기능

## 🛠️ 기술 스택

- React
- TypeScript
- Vite
- ESLint
- React Router DOM: 라우팅 관리
- Styled Components: CSS-in-JS 스타일링
- React Markdown: 마크다운 렌더링
- Flatpickr: 날짜 및 시간 선택기
- [기타 사용된 주요 라이브러리나 프레임워크를 여기에 추가해주세요. (예: Zustand, React Query 등)]

## ⚙️ 설치 방법

```bash
# 저장소를 복제합니다.
git clone https://github.com/Agentic-AI-Busan/Frontend

# 프로젝트 디렉토리로 이동합니다.
cd Frontend

# 의존성 패키지들을 설치합니다.
npm install
```

## ▶️ 실행 방법

```bash
# 개발 서버를 실행합니다.
npm run dev
```

## 📂 폴더 구조

```
src/
├── assets/            # 이미지, 폰트 등 정적 파일
├── components/        # 공통 UI 컴포넌트
│   ├── AISidebar.tsx
│   ├── EditingCard.tsx
│   ├── Footer.tsx
│   ├── LoadingSpinner.tsx
│   ├── LoginForm.tsx
│   ├── Map/
│   ├── Modal/
│   ├── Navbar.tsx
│   ├── ProtectedRoute.tsx
│   ├── QuestionSidebar.tsx
│   ├── SearchPanel.tsx
│   ├── SelectionSidebar.tsx
│   └── SignUpForm.tsx
├── contexts/          # Context API
│   └── UserContext.tsx
├── pages/             # 페이지 컴포넌트
│   ├── LoginSingup/   # 로그인/회원가입 페이지
│   ├── Mypage/        # 마이페이지
│   ├── Question/      # 질문 관련 페이지
│   ├── SchduleEditing/ # 일정 편집 페이지 (ScheduleEditing으로 수정 권장)
│   ├── Selection/     # 선택 관련 페이지
│   ├── errorPage.tsx
│   ├── mainPage.tsx
│   └── searchPage.tsx
├── services/          # API 연동 서비스
│   └── api.ts
├── App.tsx            # 애플리케이션 루트 컴포넌트
├── index.css          # 전역 CSS 스타일
├── main.tsx           # 애플리케이션 진입점
└── vite-env.d.ts      # Vite 타입 정의
```

## 🧑‍💻 개발자 정보

|                                                                                 프로필                                                                                 | 이름/기여 내용                                                                                           |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------- |
| <a href="https://github.com/ssxrxbx"><img src="./src/assets/seongsurib_profile.jpg" alt="성수립 프로필" width="120"/></a><br/>**[성수립]([성수립_GitHub_프로필_URL])** | **&lt;프로젝트 기여&gt;**<br/>• 서비스 기획 및 디자인 총괄<br/>• 프론트엔드 개발 총괄<br/>               |
| <a href="https://github.com/LeeYeoNyeong"><img src="./src/assets/leeenyeong_profile.png" alt="이어녕 프로필" width="120"/></a><br/>**[이여녕]([[이여녕_GitHub_프로필_URL](https://github.com/LeeYeoNyeong)])** | **&lt;프로젝트 기여&gt;**<br/>• 질문 페이지 개발<br/>• 로그인/회원가입 페이지 개발<br/>• 마이페이지 개발 |
