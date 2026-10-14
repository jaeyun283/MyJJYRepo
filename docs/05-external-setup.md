# 5. 필요한 외부 설정 목록

현재 Next.js 화면 앱과 데모 저장 흐름은 실행 가능하며, 실제 외부 연동은 없다. 아래는 설정 계약 후보이며 비밀값은 작성하지 않는다. 설치 시 선택한 SDK 공식 문서를 다시 확인해 실제 변수/설정과 일치시킨다.

| 구분 | 설정 후보 | 공개/비밀·필요 작업 |
|---|---|---|
| Supabase | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | 브라우저 공개 가능. 프로젝트 생성, Auth URL/리디렉션 설정 |
| DB/Storage | 마이그레이션, private materials 버킷, RLS, Realtime publication | DB 관리 작업, 두 계정으로 정책 검증 |
| 서버 관리 | SUPABASE_SERVICE_ROLE_KEY(필요한 경우만) | 서버 비밀, 기본 CRUD에는 사용자 세션과 RLS 사용 |
| Gemini | GEMINI_API_KEY, GEMINI_MODEL | 키 서버 비밀, 모델 ID는 현재 지원·파일 지원·요금 확인 후 선택 |
| Google OAuth | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI | client ID 공개 가능, secret 서버 전용, Drive 연결용 callback |
| Google Picker | NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_PICKER_API_KEY, NEXT_PUBLIC_GOOGLE_PROJECT_NUMBER | 공개 설정. API 키에 실제 배포 origin·API 제한 적용 |
| 토큰 암호화 | DRIVE_TOKEN_ENCRYPTION_KEY | 서버 비밀, 암호화 키 관리/회전, 토큰을 브라우저·로그에 노출하지 않음 |
| 앱 주소 | APP_URL | 비밀 아님. 확정된 배포 주소로 callback 구성 |
| 비동기 실행 | 작업 runner/스케줄러, 인증된 호출 설정 | 장시간 추출·Gemini 요청 timeout·재시도 설계; 플랫폼 선정 후 확정 |

## Supabase
1. 개발 프로젝트 생성, 지원하는 로그인 제공자 및 redirect allowlist 설정. Supabase 로그인과 Drive 연결 OAuth는 별개 흐름으로 관리한다.
2. 스키마·RLS·private Storage 정책을 마이그레이션으로 적용하고 Realtime 대상 테이블만 설정한다.
3. 서버 SSR 쿠키 세션을 공식 지원 방식으로 연결하고 보호 경로에서 검증한다. 사용자 ID를 클라이언트 요청에서 신뢰하지 않는다.
4. service role과 DB 비밀번호는 서버/배포 비밀 저장소에만 입력한다.

## Gemini
Google AI 프로젝트와 API 키, 허용된 모델·할당량을 준비한다. 공식 libraries 문서에서 현재 권장하는 JavaScript SDK @google/genai를 확인했다. 설치 버전 및 생성·임베딩 모델 ID는 설치/모델 검증 단계에서 고정한다. 구형 SDK나 모델 ID를 추정해서 고정하지 않는다. 외부 전송/보존 정책을 확인해 동의 화면에 반영한다. 키가 없으면 분석/상담은 연결 필요이며 성공 데이터를 생성하지 않는다.

## Google Drive
1. Google Cloud 프로젝트에서 Drive API와 Picker API를 활성화한다.
2. OAuth 동의 화면, 사용자 유형, 테스트 사용자, 실제 서비스 도메인·개인정보처리방침을 설정한다. 학생 개인정보 및 미성년 사용자 관련 운영 조건을 확인한다.
3. 웹 OAuth client의 승인된 JavaScript origins와 정확한 서버 callback URI를 등록한다. OAuth state, PKCE(지원하는 서버 라이브러리 경로), 일회성 callback 검증으로 연결 요청을 보호한다.
4. 최소권한 drive.file을 우선 검토한다. Picker에서 선택/앱에 공유된 파일만 접근·동기화한다. 광범위 Drive 검색/자동 동기화가 필요하면 별도 동의·scope 검증·심사 없이 권한을 확대하지 않는다.
5. Picker 공개 키는 HTTP referrer 및 API 제한을 건다. Picker access token은 필요한 짧은 수명으로 사용하고 refresh token/secret은 서버에서만 다룬다.
6. 서버에서 파일 접근·유형 확인 후 download/export한다. Google Workspace 문서와 바이너리 파일의 export/download를 구분한다.
7. 장기 동기화에 필요한 offline access/refresh token 실제 발급을 확인한다. 동의 철회·토큰 만료·권한상실은 재연결 상태로 표시한다. 동기화는 새 원본 버전만 저장하고 AI 재분석은 별도 동의를 요구한다.

## 네트워크와 공식 문서 검증 현황
초기 요청은 프록시 403이었으나 0단계 보완 시 아래 7개 공식 URL 모두 HTTP 200과 본문 열람을 확인했다. 이전 문서 접근 차단은 해소됐다. 기본 SDK/API 방식 확인과 실제 설치·통합 테스트는 구분한다.

| 검증 대상 | 공식 URL |
|---|---|
| Next.js 설치·런타임 | https://nextjs.org/docs/app/getting-started/installation |
| Supabase SSR | https://supabase.com/docs/guides/auth/server-side/nextjs |
| Supabase RLS | https://supabase.com/docs/guides/database/postgres/row-level-security |
| Gemini SDK | https://ai.google.dev/gemini-api/docs/libraries |
| Picker | https://developers.google.com/workspace/drive/picker/guides/overview |
| 서버 OAuth | https://developers.google.com/identity/protocols/oauth2/web-server |
| Drive changes | https://developers.google.com/workspace/drive/api/guides/manage-changes |

환경 설정 초안의 문서 접근 도메인 nextjs.org, supabase.com, ai.google.dev, developers.google.com을 확인했고 현재 요청은 성공했다. 게시 완료 여부는 확인하지 않았다. 초안 저장 및 현재 접근 성공을 게시 성공으로 간주하지 않는다.
실제 앱의 필요 도메인은 프로젝트별 Supabase 호스트, generativelanguage.googleapis.com, accounts.google.com, oauth2.googleapis.com, www.googleapis.com 및 Picker 리소스 호스트 등이다. 구현 시 공식 문서와 실제 요청으로 정확한 목록을 검증해 기존 허용 목록을 보존하며 추가한다. 문서 접근 허용만으로 API 연결 성공을 주장하지 않는다.

## 외부 설정 없이 계속 가능한 일
자료 대응표·화면 기능·데이터 설계, 앱 구조, 마이그레이션/RLS 구현, 업로드 검증, 연결 필요 상태, 권한·동의 테스트를 진행할 수 있다. 실제 Supabase 통합·Gemini 응답·Google Picker/Drive 검증은 해당 프로젝트와 설정 후 실행한다. 비밀값은 채팅으로 요청하지 않고 환경/배포 설정에 안전하게 입력한다.

## 공식 문서에서 확인한 적용 기준
- Next.js 설치: Node.js 최소 20.9, TypeScript/App Router 방식. 실제 설치 버전 및 저장소 초기화는 후속 단계다.
- Supabase Next.js SSR: @supabase/ssr의 쿠키 기반 browser/server 클라이언트, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 서버 getClaims 검증·토큰 갱신 경로. 설치할 Next.js 버전에 맞는 Proxy 구성 확인.
- Supabase RLS: auth.uid() 소유권 정책과 INSERT/UPDATE WITH CHECK 적용. 실제 DB/Storage 정책 검증 필요.
- Gemini: 공식 권장 Google GenAI SDK @google/genai, legacy 라이브러리로 시작하지 않음. 모델·임베딩 차원은 아직 미선정.
- Picker: 웹 JavaScript PickerBuilder와 OAuth 통합 방식 지원. 모바일 네이티브 Picker를 웹 방식과 혼용하지 않는다. drive.file 최소 권한 우선.
- 서버 OAuth: 정확한 redirect URI, state, offline access와 refresh token 방식 확인. 프로젝트 동의 화면·실제 발급은 미검증.
- Drive API v3: changes.getStartPageToken → changes.list 및 페이지 토큰 저장. 선택 파일 범위·권한 내 변경을 처리하고 import 목록 외 파일을 자동 수집하지 않음.

## 현재 남은 설정·검증
실행 환경에서 필요한 변수의 이름/존재만 확인했다. 위 표의 Supabase/Gemini/Google/암호화 키/앱 주소 후보 변수는 모두 미설정이며, 저장된 환경 요구사항·비밀 메타데이터도 비어 있다. 비밀값은 열람하거나 출력하지 않았다. 다른 이름의 자격증명이 없다고 단정하지 않으며 앱 연동은 아직 수행하지 않았다.

| 상태 | 남은 작업 | 영향 |
|---|---|---|
| 미설정 | Supabase 프로젝트 URL·공개 키, 로그인 callback, 마이그레이션/RLS/Storage/Realtime | 실제 로그인·DB·파일·실시간 검증 미실행 |
| 미설정 | Gemini 서버 키·생성 모델·임베딩 모델/차원·할당량 | 실제 구조화·관계·상담·초안 응답 미실행 |
| 미설정 | Google 프로젝트/API 활성화·OAuth/Picker 공개 설정·서버 secret·callback·테스트 사용자 | Picker·가져오기·refresh·동기화 검증 미실행 |
| 미설정 | 토큰 암호화 키·배포 주소·작업 실행 환경 | 안전한 장기 연결·주기 작업·외부 배포 미실행 |
| 공식 원본 미확인 | 서울대 2027 대체서식 원본과 안내문 | 발표의 100자/최대10개·기관/증빙 조건은 참고안, 실제 제출 적합 보장 불가 |

문서 사이트 접근 차단은 더 이상 남은 blocker가 아니다. 단계 0 문서 작업은 위 설정과 무관하게 완료했다. 실제 개발에서는 키 없는 연결 필요 화면을 제공하고 독립 구현을 계속한다.
