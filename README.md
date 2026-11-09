# 첫 전세 프론트엔드

React와 Vite 기반 로컬 프론트 데모입니다.

## 실행

```powershell
npm ci
npm run dev
```

브라우저에서 http://localhost:5173 에 접속합니다. 배포용 빌드는 `npm run build`, 계산 규칙 검증은 `npm test`로 실행합니다.

## 코드 찾기

| 위치 | 역할 |
| --- | --- |
| src/main.jsx | 앱 마운트, 공통 CSS |
| src/app/ | 화면 경로, 로그인 상태, 진단 결과 전달 |
| src/pages/Home/ | 첫 화면과 용어 안내 |
| src/pages/Diagnosis/ | 준비, 질문 10개, 금액 입력 |
| src/pages/Result/ | 점수, 위험 이유, 질문, 특약 복사 |
| src/pages/Schedule/ | 계약 날짜 입력과 일정 14개 |
| src/pages/Account/ | 로그인과 회원가입이 공유하는 폼 (선택 기능) |
| src/pages/MyPage/ | 계정 정보와 최근 진단 기록 (로그인 필요) |
| src/components/common/ | 입력 필드, 안내, 오류, 공통 CSS |
| src/components/layout/ | 헤더와 푸터 |
| src/styles/global.css | 색상, 글꼴, 기본 레이아웃 |
| src/api/ | 실제 API와 Mock 전환 |
| src/api/mock/ | 질문, 안내 문구, 점수 및 일정 계산 |
| src/services/ | 브라우저의 데모 계정과 진단 기록 저장 |
| tests/ | 점수 기준과 날짜 계산 회귀 검사 |

진단 화면의 useDiagnosis.js는 입력 상태와 API 요청을 담당하고 Diagnosis.jsx는 단계별 화면을 표시합니다. 각 화면 폴더의 JSX와 CSS를 함께 수정합니다. 버튼, 카드, 입력 필드처럼 여러 화면에서 쓰는 스타일은 common.css에서 관리합니다.

## 화면과 데이터 흐름

첫 화면 → 등기부 준비 → 질문 10개 → 금액 → 결과 → 일정표 순서입니다. 첫 화면이나 헤더에서 일정표로 바로 갈 수도 있습니다 (docs/06-service-flow.md).

로그인은 선택입니다. 로그인하지 않아도 진단과 일정표를 모두 쓸 수 있고, 마이페이지만 로그인이 필요합니다. 로그인한 상태로 진단하면 결과 요약(날짜, 보증금·시세, 등급, 점수)이 마이페이지에 최근 10건까지 저장됩니다. 비로그인 진단은 저장하지 않습니다.

App이 로그인 상태와 진단 결과를 보관합니다. Diagnosis는 answers와 amounts를 모아 api/diagnosis.js에 전달합니다. 결과 화면은 응답을 표시하고 Clause가 특약 복사를 담당합니다. 결과 상세는 새로고침 시 사라지며 첫 화면으로 이동합니다.

## Mock과 실제 API 연결

.env.example을 .env로 복사하고 VITE_USE_MOCK=false로 설정하면 질문, 진단, 일정 API를 VITE_API_BASE_URL로 요청합니다. 개발 서버를 다시 시작해 환경변수를 반영합니다. 백엔드 CORS 허용 주소인 http://localhost:5173 으로 접속합니다.

로그인, 회원가입, 마이페이지 기록은 VITE_USE_MOCK 설정과 관계없이 브라우저(localStorage) 기반 데모입니다. 비밀번호는 salt와 PBKDF2 검증값으로 저장하며, 실제 인증에는 인증 서버가 필요합니다.

점수 계산 코드는 Mock에서만 실행됩니다. 실제 연결에서는 백엔드가 점수와 등급을 결정합니다. API 필드와 날짜 형식은 docs/03-api-contract.md를 따릅니다. 선순위 보증금 미입력은 null, 실제 0원은 0으로 구분합니다.

## 협업

작업 전에 docs/AGENTS.md와 관련 docs를 읽습니다. 매 pull에서 이전 HEAD와 새 HEAD 사이의 Markdown 변경을 확인하고 바뀐 규칙을 먼저 적용합니다. 공통 문서의 원본은 BackEnd이며 팀장이 FrontEnd에 동기화합니다. 프론트 구현 설명은 이 README에 최신화합니다.

팀의 이슈, 브랜치, PR 절차(docs/07-git-rules.md)를 따릅니다. 환경변수의 실제 비밀값은 커밋하지 않습니다.
