# 공개 데모 배포

소스는 main, 검증한 정적 데모 산출물은 gh-pages에 올렸다. 실제 서비스 API·비밀값은 정적 산출물에서 제외한다. 공개 웹 데모는 개인 모드의 연결 필요/빈 상태로 시작하며 사용자가 상단 데모 모드를 켜면 브라우저 전용 예시 데이터가 표시된다.

## GitHub Pages 활성화 (현재 필요한 작업)
GitHub API의 Pages 생성 요청은 Resource not accessible by integration (HTTP 403)으로 거절됐다. Git 읽기/푸시는 성공했고 저장소 관리 권한은 확인했지만 연결 토큰의 Pages API 권한이 부족하다. 환경 네트워크 허용으로 해결할 권한 오류가 아니다.

1. https://github.com/jaeyun283/MyJJYRepo/settings/pages 를 연다.
2. Build and deployment의 Source를 Deploy from a branch로 선택한다.
3. Branch를 gh-pages, 폴더를 /(root)로 선택하고 Save한다.
4. GitHub Pages 배포가 끝나면 설정 화면의 사이트 링크를 연다.

예상 사이트 주소: https://jaeyun283.github.io/MyJJYRepo/
이 주소의 정상 응답과 실제 공개 화면은 Pages 활성화 이후 검증해야 한다. 현재 게시 완료로 주장하지 않는다.

## 빌드와 갱신
```bash
npm ci
npm run build:static
```

scripts/build-static.mjs는 임시 디렉터리에 앱 소스를 복사하고 app/api를 제외한 다음 Next.js 정적 export를 실행한다. 원본 서버 앱은 유지한다. 기본 basePath는 /MyJJYRepo이며 RECORD_BASE_PATH로 변경할 수 있다. 결과는 out/에 생성되며 소스 브랜치에 커밋하지 않는다. 정적 모드에서는 연결 상태를 미연결로 표시하고 상담 요청은 외부 전송 없이 미연결 오류를 표시한다.

검증 결과: 정적 빌드 성공, 타입 검사 통과, 정적 파일 서버의 브라우저에서 개인 모드 로딩→데모 화면→설정→상담 동의/미연결 오류를 확인했다. JavaScript 오류 0개, 서버 API 요청 0개. 로컬 정적 검증과 실제 GitHub Pages 게시 검증은 구분한다.

정적 데모는 화면·브라우저 저장 기능 확인용이다. Supabase·Gemini·Google OAuth/Drive 기능은 서버 구현과 별도 배포가 필요하다.
