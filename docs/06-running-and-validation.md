# RE:Cord 화면 실행 및 검증

## 실행
저장소 루트 `/workspace/MyJJYRepo`에서 Node.js 20.9 이상을 사용한다. 현재 검증 런타임은 Node 24.19.0이다.

```bash
npm ci
npm run dev
```

이 환경에서 npm 기본 캐시 경로 쓰기가 불가능하면 `npm --cache /tmp/record-npm-cache ci`를 사용한다. 실행 포트는 기본 3000이다. 앱은 기본적으로 개인 모드이며 데이터 연결 필요·빈 상태를 표시한다. 상단 **데모 모드 체험**을 눌러야 예시 데이터가 생성된다. 브라우저 새로고침 후에도 해당 브라우저의 데모만 유지된다.

```bash
npm run typecheck
npm run build
npm run start
npm run test:e2e
```

브라우저 테스트는 현재 환경의 `/usr/bin/chromium`을 사용한다. 다른 환경은 `PLAYWRIGHT_CHROMIUM_EXECUTABLE`로 설치된 Chromium 경로를 지정한다. 테스트용 브라우저는 의존성 설치와 별개다. 재사용 가능한 개발 서버가 없으면 Playwright가 자동으로 시작한다.

## 구현 범위
- 내 프로젝트: 3열, 프로젝트 생성/수정·선택, 4개 탭, 파일·링크·메모 등록/조회/삭제, 기록 편집·저장, 7개 기록 태그.
- 배움 정리: SVG 경험 그래프, 줌·노드/기록 선택·원본 근거, 프로젝트 필터, 관심사·패턴 탭. 키보드용 경험 목록 포함.
- 포트폴리오: 유형→경험→편집, 2종 템플릿, 기존 기록 가져오기, 순서 이동, 본문·기관 편집, 체크리스트, 저장 후 재열기, 미리보기·TXT 다운로드.
- 대시보드: 현재 데모 저장 데이터의 프로젝트/자료/포트폴리오 수, 최근 자료, 미확인 항목 안내. AI 검토 요청은 아직 없어 0이며 연결 필요를 표시한다.
- 상담: 독립 화면과 사이드 패널, 질문 작성·자료 선택·전송 내용 확인·동의, 서버 연결 미완료 오류/재시도. 가짜 AI 답변 없음.
- 설정: 계정·Drive·Gemini 연결 필요, 키의 존재 여부만 서버 확인, 로딩·네트워크 오류·재시도, 데모 초기화.
- 공통: 실제 저장 자료의 검색, 데모/개인 모드 구분, 반응형 메뉴, 빈 상태·저장 중·실패 알림, 모달 Escape·포커스 순환.

샘플과 모든 데모 편집은 localStorage `record-demo-v1`에만 저장한다. 실제 선택한 파일 Blob은 IndexedDB `record-demo-files-v1`에 저장해 새로고침 후 다운로드할 수 있다. 데모 종료는 샘플을 개인 모드로 옮기지 않는다. 초기화는 해당 브라우저의 데모 저장소만 삭제한다. PDF/이미지 원본을 AI 분석하거나 실제 학생 데이터베이스에 저장하지 않는다. 파일 내용 추출은 TXT/MD만 지원하며 다른 파일은 원본 보관/다운로드만 제공한다.

## 시각 검증
예시 I1~I3 및 발표 부록을 기준으로 컴포넌트를 구현했다. 이미지 배경이나 외부 문서 편집 도구는 사용하지 않는다. 먼저 내 프로젝트를 실행해 1440px/390px 캡처를 확인한 뒤 오른쪽 열 너비, 자료 글자 크기·간격을 보정하고 다른 화면을 구현했다. 이후 편집 본문의 굵기·높이, 그래프 라벨 위치, 모바일 상담 자료 선택을 보정했다.

`artifacts/`에 각 화면의 1440px/390px 전체 캡처를 남긴다. 경험 그래프는 등록된 노드만 사용하므로 예시의 장식용 수많은 노드는 추가하지 않았다. 밝은 배경·카드·라벤더 강조·보라 버튼·좌측 메뉴·상단 검색과 3열 작업 구조를 유지한다. 모바일은 접힌 메뉴, 가로 프로젝트 목록, 세로 카드 배치를 사용한다. 폰트는 npm 패키지로 제공하는 Noto Sans KR Variable을 로컬로 번들해 외부 폰트 요청에 의존하지 않는다.

## 검증 항목
Playwright 기존 화면 흐름을 통해 개인 모드 샘플 미노출/데모 격리, 파일·메모 등록, 검색, 편집 저장·재조회, 포트폴리오 순서·저장·미리보기, 그래프 근거, 미확인 태그, AI 동의 미입력 거절·연결 오류, 모바일 메뉴/상담 패널, 대체서식 기관·증빙 체크 재조회, 원본 다운로드, 미지원 파일 거절, 설정 네트워크 오류·재시도를 검증한다. 모든 화면을 두 폭에서 캡처하며 document 가로 넘침과 페이지 JavaScript 오류도 검사한다.

## 다음 연결 지점과 남은 구현
| 위치 | 후속 연결 |
|---|---|
| components/workspace.tsx의 AppContext / mutate | Supabase Auth 검증된 세션·사용자별 CRUD·Realtime 데이터 어댑터. 개인 모드 localStorage 저장 금지 유지 |
| lib/data.ts | 0단계 설계의 Project/Experience/Material/Portfolio 서버 DTO·버전·근거·검토 모델로 확장 |
| lib/demo-storage.ts 및 Projects의 upload/openMaterial | private Supabase Storage·서버 파일 검증·소유권 검증·서명 URL·추출 파이프라인 |
| components/learning.tsx | 확정된 Experience/Relation/근거, 임베딩 검색·최대5개 Gemini 관계 제안·학생 확인, 실제 패턴 해석 수정 |
| components/portfolio.tsx | DB 포트폴리오·revision 충돌 처리·실제 Gemini 초안/문장 제안, 사용자 확인 후 적용 |
| app/api/consultation/route.ts | 현재 안전한 미연결 응답(503)만 반환. 인증·서버 소유권·동의 스냅샷 검증 후 Gemini 서버 호출 및 실제 응답 검증 구현 |
| app/api/connections/route.ts, SettingsScreen | 현재 설정 존재 여부만 확인. 실제 계정/Google OAuth·Picker·Drive 연결 상태와 동기화 API 구현 |

DB/RLS 마이그레이션, 실제 인증, Gemini 호출, Google OAuth/Picker/동기화는 이번 화면 구현에 포함된 동작이 아니다. 키를 입력하는 것만으로 해당 기능이 활성화되지는 않는다. 실제 서버 연동 구현과 자격증명 설정이 모두 필요하다. 05-external-setup.md의 외부 설정 계약을 기준으로 연결하고 비밀값은 서버 환경에만 저장한다.

## 이번 실행 결과
- `npm ci`: lockfile 기반 설치 성공(캐시 경로 `/tmp/record-npm-cache`).
- `npm run typecheck`: 통과.
- `npm run build`: 프로덕션 빌드 통과.
- `npm run test:e2e`: 8개 실행, 8개 통과, 실패/스킵 없음.
- 1440px/390px 요청 화면 6종과 그래프·패턴·포트폴리오 편집 캡처 확인. 가로 페이지 넘침과 브라우저 JavaScript 오류 없음.
- `npm run start -- --port 3001`: 프로덕션 서버 실행 후 브라우저에서 개인 모드 로딩 종료→데모 전환→프로젝트 작업 화면 렌더 검증. 페이지 오류 없음.
- 기존 README.md와 레너드.jpg 변경 없음. 문서 내부 링크 검증 통과.
- 클라우드 설정 초안에 `install_script`(npm ci/typecheck/build)와 `start_skill`(개발 서버 시작·데모/개인 모드·검증·남은 연결 지침) 저장. 초안 저장은 환경 게시가 아니다. 재사용하려면 환경 설정에서 검토·저장 후 게시한다.
