# 3. 데이터 모델

PostgreSQL + Supabase Auth를 사용한다. 이 문서는 설계이며 적용된 마이그레이션이 아니다. 모든 사용자 테이블은 UUID PK, owner_id UUID NOT NULL REFERENCES auth.users(id), created_at/updated_at timestamptz를 기본으로 한다. 변경 가능한 확정 데이터는 revision 정수를 추가한다.

| 테이블 | 주요 필드 | 관계·역할 |
|---|---|---|
| profiles | id=auth.users.id, display_name | 개인 설정, 학교명 선택값; 코치 역할 없음 |
| projects | title, description, topic?, status, started_on, ended_on | 경험을 묶는 활동 단위, 필수 생성 아님 |
| materials | kind(file/text/link/drive), title, source, source_url?, project_id?, deleted_at? | 기존 자료의 논리 ID |
| material_versions | material_id, version_no, storage_path?, text_body?, mime_type, byte_size, sha256, source_modified_at?, extraction_status | 원본 불변 버전; 파일 또는 기존 텍스트 |
| evidence_fragments | material_version_id, locator jsonb, extracted_text?, extraction_method | 페이지·문단·슬라이드·사진 위치; locator는 검증된 타입 |
| analysis_consents | purpose, provider, disclosure_version, approved_at, revoked_at? | 외부 전송 동의 이력 |
| consent_targets | consent_id, material_version_id?, experience_revision_id?, content_hash | 실제 전송 대상/스냅샷 고정; 상담 포함 |
| analysis_jobs | consent_id, kind, status, model, request_hash, error_code?, attempt, completed_at? | queued/running/succeeded/failed/cancelled, 실제 작업 상태 |
| experience_suggestions | job_id, proposed_fields jsonb, review_status, reviewed_at? | pending/accepted/rejected; AI 원본 제안 보존 |
| suggestion_evidence | suggestion_id, fragment_id, rationale? | 검증된 근거 ID만 허용 |
| experiences | project_id?, title, role?, activity?, problem?, process?, outcome?, reflection?, interest_tags?, occurred_from?, occurred_to?, current_revision | 학생이 확정한 정보, 평가 점수 없음 |
| experience_revisions | experience_id, revision_no, fields jsonb, source_suggestion_id? | 확정 내용 이력, AI 제안과 분리 |
| experience_evidence | experience_id, fragment_id, supports(role/process/outcome/context), student_note? | M:N 경험-근거 |
| gap_items | experience_id, field, reason, status, source_job_id? | 부족한 기록 설명; 점수 아님 |
| use_cases | purpose, title, selected_experience_ids 또는 연결 테이블 | 목적별 경험 구성; 관계 테이블 권장 |
| portfolios | use_case_id?, title, revision, status | 비공개 초안/확정, 공개 공유는 후속 별도 설계 |
| portfolio_sections | portfolio_id, order_key, heading, student_content, accepted_ai_job_id? | 초안 제안과 학생 편집 구분 |
| portfolio_experiences | section_id, experience_id, experience_revision_id | 사용한 경험 버전과 근거 유지 |
| consultation_threads | title | 학생별 상담 세션 |
| consultation_messages | thread_id, role, content, job_id?, consent_id?, status | 실제 사용자 입력/실제 AI 응답 |
| consultation_sources | message_id, experience_revision_id?, fragment_id? | 상담 근거 추적 |
| drive_connections | provider_account_id, scopes, encrypted_refresh_token?, expires_at?, revoked_at? | 서버 전용, 접근 토큰 장기 평문 저장 금지 |
| drive_imports | connection_id, provider_file_id, material_id, last_imported_revision?, last_checked_at, status | 선택 파일 등록, 중복 방지 |
| sync_runs | connection_id, status, started_at, completed_at?, error_code? | 실제 동기화 상태; 성공시각만 갱신 |

## 제약·인덱스
- UNIQUE(owner_id,id)를 참조 키로 제공하고 모든 부모 관계에 복합 FK(owner_id,parent_id)를 사용해 다른 소유자의 행 연결을 차단한다.
- 버전 UNIQUE(material_id,version_no), 경험 이력 UNIQUE(experience_id,revision_no), 근거 연결 UNIQUE(experience_id,fragment_id,supports).
- Drive 연결 UNIQUE(owner_id,provider_account_id), 가져오기 UNIQUE(connection_id,provider_file_id). 동일 SHA 자료는 중복 후보로 알리되 제목만으로 덮어쓰지 않는다.
- owner_id와 updated_at, 상태, 부모 ID 인덱스. 한국어 검색은 초기 제목/본문 ILIKE와 pg_trgm 후보를 검증하고, 언어별 전문 검색 설정을 확인한다.
- AI 결과는 JSON schema 검증 후 저장한다. 모델이 만든 존재하지 않는 근거 ID와 타 사용자 근거는 거절한다.
- 경험·포트폴리오 편집은 WHERE owner_id=현재 사용자 AND revision=기대값으로 갱신한다. 충돌은 덮어쓰지 않는다.

## 접근 정책
일반 테이블 SELECT/DELETE USING(auth.uid()=owner_id), INSERT WITH CHECK(auth.uid()=owner_id), UPDATE는 USING과 WITH CHECK 모두 적용한다. 인증되지 않은 접근은 거절한다. profiles는 id 기준 동일 정책이다. 동의/작업/AI 원본 결과는 사용자 임의 상태 변경이 불가능하도록 쓰기 권한을 서버 작업 경로로 제한한다.
서버는 Supabase 검증된 사용자 세션으로 소유권을 확인한다. service role은 필요한 백그라운드 작업 전용이며 JWT/RLS 우회를 전제로 명시적 소유권 재검증을 수행한다. Drive 토큰 테이블은 브라우저/일반 Auth 역할 접근 불가인 private schema에 둔다.
Storage는 private 버킷, 사용자 UUID/자료 UUID/버전 경로와 storage.objects RLS를 적용한다. 짧은 만료 서명 URL은 서버에서 소유권 확인 후 발급한다. Realtime publication은 필요한 사용자 테이블만 등록하고 RLS를 유지한다. 이벤트 수신 후 권한 있는 집계를 재조회한다.

## 파일·동의·삭제
초기 PDF/이미지/기존 텍스트를 지원하고 형식·크기 한도를 서버에서 검증한다. PPTX 등은 지원하는 추출기 검증 전 성공 처리하지 않는다. Google 문서/슬라이드 export는 원본 유형과 변환 형식을 기록한다. 비신뢰 파일·추출 텍스트는 명령이 아닌 데이터로 취급하고 프롬프트 주입에도 서버 권한을 부여하지 않는다.
동의는 실제 전송 내용 hash와 버전에 묶는다. 다른 버전/문맥 추가 시 새 동의를 받는다. 철회는 대기 작업을 취소하며 이미 전송된 내용을 회수했다고 주장하지 않는다. 원본 보존과 개인정보 삭제 요청은 구분한다. 삭제 시 Storage·추출문·근거·AI 문맥·Drive 토큰을 정리하고, 참조 중 포트폴리오는 근거 삭제 상태로 표시한다. 보존 기간과 외부 AI 처리 조건은 실제 제공자 정책 확인 후 공개한다.

## 그래프와 대시보드
그래프는 projects/experiences/evidence 연결에서 파생하며 별도 점수/추천 DB를 만들지 않는다. 경험 간 관계는 아래 relations와 관계 근거를 조회해 구성한다. 대시보드는 사용자별 자료 수, 확정 경험 수, 검토 대기 수, 미해결 보완 수와 최근 저장 내역을 집계한다. 서버/DB 집계는 요청 사용자 조건을 강제하고 AI 추정 수치나 샘플 수치를 섞지 않는다.

## 0단계 대조 후 보완한 모델
수행계획서 12쪽의 User/Project/Experience/Evidence/Relation/Guide/Career Goal/Portfolio와 발표 10·24·26~29쪽을 대응한다. 기술적 세분화는 개발 설계다. Career Information 테이블은 사용자 제외 지시에 따라 만들지 않는다. Career Goal은 use_cases의 학생 목적 입력으로 대응하며 학과/직무는 선택적 사용자 텍스트일 뿐 추천 DB가 아니다.

| 추가/보완 테이블 | 필드·제약 | 근거와 역할 |
|---|---|---|
| relations | from_experience_id, to_experience_id, relation_type, rationale, review_status, source_job_id?, reviewed_at? | Relation: 반복 역할/주제/활동 흐름 등 경험 간 관계. self edge 금지, 소유권 복합 FK, 방향성 없는 관계 쌍 정규화 |
| relation_evidence | relation_id, fragment_id, experience_revision_id? | 관계마다 실제 근거 확인; 확인되지 않은 관계는 제안 레이어에만 표시 |
| experience_embeddings | experience_revision_id, model_id, model_version, dimensions, content_hash, embedding, consent_id | Gemini 임베딩 후보. 모델·차원 공식 확인 후 vector(D) 마이그레이션. 소유자 조건 안에서 검색; 사용자 수정 시 새 버전 임베딩 |
| analysis_cache | owner_id, input_hash, purpose, model_id, prompt_version, schema_version, result_job_id | 동일 입력·동의 범위·모델일 때 저장 결과 재사용; 타 사용자 캐시 공유 금지 |
| learning_insights | kind(interest/pattern), label, description, review_status, source_job_id?, revision | AI 관심사/활동패턴 제안과 학생 확인·수정 구분 |
| insight_experiences | insight_id, experience_revision_id, relation_id? | 관련 경험 개수 실제 집계, 패턴 설명 근거 |
| record_checks | project_id, experience_id?, field(period/role/problem/process/result/evidence/reflection), status(recorded/unverified), rationale, source_job_id?, reviewed_at? | 7개 태그와 근거. 점수/총점 없음; 기간 미확인도 초안 허용 |
| record_check_evidence | check_id, fragment_id | 기록 있음 판단의 원본 근거 |
| guides | experience_id?, project_id?, type(question/material/next_action), reason, suggested_action, status, source_job_id? | Guide: gap_items의 부족 사유를 질문·다음 준비 행동으로 연결 |
| guide_evidence | guide_id, fragment_id?, relation_id? | 제안의 판단 근거, 필요한 부모 중 하나 이상 |
| portfolio_templates | slug(project_portfolio/substitute_record), version, source_url?, source_year?, verification_status, field_schema, draft_rules | 시스템 읽기 전용 고정 2종. 대학 추천 DB 아님. 실제 제출 규칙은 공식 확인 전 draft_reference |
| portfolio_activities | portfolio_id, project_id, order_key, activity_name, start_on?, end_on?, activity_description, issuing_organization?, organization_confirmed_at? | 대체서식 활동 표, 학생 기관명 직접 확인 |
| portfolio_checklist_items | portfolio_id, activity_id?, kind(issue_request/document_ready), checked_by_student_at? | 학생이 직접 체크한 증빙 준비, 코치 승인 아님 |
| ai_edit_suggestions | portfolio_id, section_id?, base_revision, selected_text_hash, action, proposed_text, job_id, review_status | 문장 다듬기 제안은 편집중 본문에 자동 적용하지 않음 |

portfolios에 template_id/template_version 및 use_case_id를 저장한다. 프로젝트 단위 순서와 선택 경험은 정규 연결 테이블로 유지한다. record_checks/관계/인사이트가 의존하는 원본·확정 버전 변경 시 stale 상태 또는 재검토 필요를 표시한다. 생성/편집/동기화가 학생 확정 내용을 자동 갱신하지 않는다.
임베딩을 위한 외부 전송도 동의 대상이다. 후보는 사용자 소유 검색으로 좁힌 뒤 최대 5개만 Gemini 관계 판정에 보내며 필요한 근거만 전송한다. 유사도는 내부 검색 신호이며 학생 평가 수치로 표시하지 않는다. 발표 10쪽의 확신도는 학생 점수가 아니며 관계 자동 확정 기준으로 사용하지 않는다.
