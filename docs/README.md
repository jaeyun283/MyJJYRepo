# RE:Cord 개발 준비 문서

작성 기준: 사용자 요구사항 및 첨부 자료 전체 대조.

[0단계 검토 기록과 수정 결정](00-reference-review.md)을 먼저 읽는다. 현재 저장소에는 README.md와 레너드.jpg만 있고 기존 앱·매니페스트·테스트·CI는 없다. 기존 파일은 유지한다.

1. [요구사항과 참고자료 대응표](01-requirements.md)
2. [화면 목록과 사용자 흐름](02-screens-and-flows.md)
3. [데이터 모델](03-data-model.md)
4. [단계별 구현 계획](04-implementation-plan.md)
5. [필요한 외부 설정](05-external-setup.md)

현재 상태: Next.js/TypeScript 기반 요청 화면 6종과 데모 동작을 구현했다. 실제 인증·DB/RLS·Gemini·Drive 연동은 미구현이다. 실행/검증/연결 지점은 [화면 실행 안내](06-running-and-validation.md)를 읽는다. 0단계 자료 검토와 문서 보완은 완료했다. 시각 방향과 핵심 정보 구조는 예시 이미지로 정리했다. 독립적인 데이터·인증·업로드 기반 구현은 진행할 수 있다.

[GitHub 공개 데모 배포와 남은 활성화 설정](07-public-demo.md)
