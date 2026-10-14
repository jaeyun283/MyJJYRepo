"use client";
import { useEffect, useState } from "react";
import {
  Folder,
  FileText,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
  Link as LinkIcon,
  RefreshCw,
  User,
  Cloud,
  ShieldCheck,
  Send,
  Check,
  AlertCircle,
} from "lucide-react";
import { recordState } from "@/lib/data";
import type { AppContext } from "./workspace";
import { Card, Checks, Empty, Notice, MaterialIcon, Modal } from "./ui";
export function Dashboard({ ctx }: { ctx: AppContext }) {
  const { data } = ctx;
  const materials = data.projects
    .flatMap((p) => p.materials.map((m) => ({ ...m, project: p.title })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const gaps = data.projects.flatMap((p) =>
    Object.entries(recordState(p))
      .filter(([, v]) => !v)
      .map(([field]) => ({ p, field })),
  );
  return (
    <>
      <div className="stats-grid">
        {[
          {
            label: "진행 중인 프로젝트",
            value: data.projects.filter((p) => p.status === "진행 중").length,
            icon: Folder,
          },
          { label: "등록한 자료", value: materials.length, icon: FileText },
          { label: "검토 대기", value: 0, icon: ShieldCheck },
          {
            label: "포트폴리오",
            value: data.portfolios.length,
            icon: FileText,
          },
        ].map((x) => (
          <Card className="stat" key={x.label}>
            <div className="row">
              <span>{x.label}</span>
              <x.icon size={19} />
            </div>
            <strong>
              {x.value}
              <small>개</small>
            </strong>
            <p>{ctx.demo ? "데모 저장 데이터 기준" : "데이터 연결 필요"}</p>
          </Card>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="row">
            <h2>프로젝트 현황</h2>
            <button className="text-button" onClick={() => ctx.go("projects")}>
              전체 보기 <ArrowUpRight size={14} />
            </button>
          </div>
          {data.projects.map((p) => (
            <div className="dashboard-project" key={p.id}>
              <div className="row">
                <h3>{p.title}</h3>
                <span
                  className={`badge ${p.status === "진행 중" ? "progress" : ""}`}
                >
                  {p.status}
                </span>
              </div>
              <Checks project={p} />
            </div>
          ))}
          {!data.projects.length && <Empty title="아직 프로젝트가 없어요" />}
        </Card>
        <Card>
          <h2>최근 자료</h2>
          {materials.slice(0, 5).map((m) => (
            <button
              className="recent-material"
              key={m.id}
              onClick={() => ctx.openMaterial(m)}
            >
              <MaterialIcon material={m} />
              <span>
                <strong>{m.title}</strong>
                <small>
                  {m.project} · {m.date}
                </small>
              </span>
              <ArrowUpRight size={14} />
            </button>
          ))}
          {!materials.length && <Empty />}
        </Card>
        <Card>
          <h2>보완 질문</h2>
          <p className="muted">
            확인되지 않은 기록을 살펴보세요. AI 응답이 아닌 기록 상태 기반
            안내입니다.
          </p>
          {gaps.slice(0, 4).map(({ p, field }) => (
            <button
              className="gap-row"
              key={p.id + field}
              onClick={() => ctx.go("projects")}
            >
              <span className="question-mark">?</span>
              <span>
                <strong>{field}을 확인할 자료가 있나요?</strong>
                <small>
                  {p.title} · {field} 미확인
                </small>
              </span>
              <Chevron />
            </button>
          ))}
          {!gaps.length && <Empty title="확인할 보완 항목이 없어요" />}
        </Card>
        <Card>
          <h2>검토 대기와 포트폴리오</h2>
          <Notice>AI 분석 연결 필요 · 실제 검토 요청이 아직 없습니다.</Notice>
          {data.portfolios.map((p) => (
            <button
              className="recent-material"
              key={p.id}
              onClick={() => ctx.go("portfolio")}
            >
              <FileText size={19} />
              <span>
                <strong>{p.title}</strong>
                <small>
                  데모 저장 · {new Date(p.updated).toLocaleDateString("ko-KR")}
                </small>
              </span>
              <ArrowUpRight size={14} />
            </button>
          ))}
          <button
            className="button subtle full"
            onClick={() => ctx.go("portfolio")}
          >
            포트폴리오 만들기 <ArrowUpRight size={15} />
          </button>
        </Card>
      </div>
    </>
  );
}
function Chevron() {
  return <ArrowUpRight size={14} />;
}
export function Consultation({
  ctx,
  compact = false,
}: {
  ctx: AppContext;
  compact?: boolean;
}) {
  const [question, setQuestion] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [confirm, setConfirm] = useState(false),
    [consent, setConsent] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const materials = ctx.data.projects
    .flatMap((p) => p.materials)
    .filter((m) => m.text && m.kind !== "file");
  async function send() {
    setLoading(true);
    setError("");
    setConfirm(false);
    try {
      const r = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          consent,
          context: materials
            .filter((m) => selected.includes(m.id))
            .map((m) => ({ title: m.title, text: m.text })),
        }),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.message);
      throw Error("상담 응답을 검증할 수 없습니다.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "요청에 실패했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className={compact ? "" : "chat-grid"}>
      {!compact && (
        <Card className="chat-context">
          <h3>함께 살펴볼 기록</h3>
          <p className="muted">선택한 기록만 상담 문맥에 포함됩니다.</p>
          {materials.map((m) => (
            <label className="context-item" key={m.id}>
              <input
                type="checkbox"
                checked={selected.includes(m.id)}
                onChange={() =>
                  setSelected(
                    selected.includes(m.id)
                      ? selected.filter((x) => x !== m.id)
                      : [...selected, m.id],
                  )
                }
              />
              <FileText size={15} />
              {m.title}
            </label>
          ))}
          {!materials.length && <Empty title="연결할 기록이 없어요" />}
          <Notice>
            파일 원문 추출과 AI 연동은 아직 준비 중입니다. 데모 기록은 실제 학생
            자료와 분리됩니다.
          </Notice>
        </Card>
      )}
      <Card className="chat-main">
        <div className="row">
          <h2 className="icon-title">
            <Sparkles size={19} /> 나의 경험 상담
          </h2>
          <span className="badge">AI 연결 필요</span>
        </div>
        <div className="conversation">
          <div className="chat-welcome">
            <span className="ai-avatar">
              <Sparkles size={24} />
            </span>
            <h2>어떤 경험을 함께 살펴볼까요?</h2>
            <p>
              내 역할을 찾고, 필요한 근거를 살펴보고,
              <br />
              다음 준비를 내 속도에 맞춰 정리해요.
            </p>
            <div className="prompt-chips">
              {[
                "내가 맡은 역할을 어떻게 설명할까요?",
                "어떤 기록을 더 남기면 좋을까요?",
                "이 경험을 포트폴리오에 담고 싶어요.",
              ].map((x) => (
                <button key={x} onClick={() => setQuestion(x)}>
                  {x}
                </button>
              ))}
            </div>
          </div>
          {questions.map((q, i) => (
            <div className="user-bubble" key={i}>
              {q}
              <small>작성한 질문 · AI 전송 전</small>
            </div>
          ))}
        </div>
        {error && (
          <div className="error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              onClick={() => {
                setError("");
                setConfirm(true);
              }}
            >
              다시 확인
            </button>
          </div>
        )}
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            setQuestions([...questions, question]);
            setConsent(false);
            setConfirm(true);
          }}
        >
          <textarea
            aria-label="상담 질문"
            placeholder="내 기록과 경험에 대해 물어보세요…"
            value={question}
            maxLength={4000}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
          />
          <button
            className="button primary"
            type="submit"
            disabled={!question.trim() || loading}
            aria-label="전송 내용 확인"
          >
            {loading ? <span className="spinner" /> : <Send size={17} />}
          </button>
        </form>
        <p className="privacy-note">
          전송 전에 질문과 선택한 자료를 확인합니다. 연결되지 않은 AI 응답을
          만들지 않습니다.
        </p>
      </Card>
      {confirm && (
        <Modal title="외부 AI 전송 내용 확인" close={() => setConfirm(false)}>
          <p>분석 제공자: Gemini · 목적: 경험 상담</p>
          <h3 className="section-heading">작성한 질문</h3>
          <p className="preserve">{question}</p>
          {materials
            .filter((m) => selected.includes(m.id))
            .map((m) => (
              <div key={m.id}>
                <h3>{m.title}</h3>
                <p className="preserve">{m.text}</p>
              </div>
            ))}
          <Notice>
            현재 AI 서버 연동은 미완료입니다. 요청 시 연결 상태를 확인하며, 외부
            전송이 수행되지 않으면 오류로 안내합니다.
          </Notice>
          <label className="checklist">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            선택한 내용이 Gemini에 전송되는 것을 확인했습니다.
          </label>
          <button
            className="button primary full"
            disabled={!consent || loading}
            onClick={send}
          >
            연결 확인 후 요청
          </button>
        </Modal>
      )}
    </div>
  );
}
export function SettingsScreen({ ctx }: { ctx: AppContext }) {
  const [status, setStatus] = useState<{
      account: { configured: boolean; connected: boolean };
      ai: { configured: boolean; connected: boolean };
      drive: { configured: boolean; connected: boolean };
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reset, setReset] = useState(false);
  async function load() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/connections");
      if (!r.ok) throw Error();
      setStatus(await r.json());
    } catch {
      setError("연결 설정을 확인하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="settings-grid">
      <Card>
        <div className="row">
          <h2>계정과 데이터</h2>
          <User size={21} />
        </div>
        <div className="account-profile">
          <span className="avatar large">{ctx.demo ? "김" : "나"}</span>
          <div>
            <h3>{ctx.demo ? "김지민 · 데모 사용자" : "계정 연결 필요"}</h3>
            <p>
              {ctx.demo
                ? "예시 기록은 브라우저에만 저장됩니다."
                : "개인 데이터는 로그인 후 사용할 수 있어요."}
            </p>
          </div>
        </div>
        <Notice>
          Supabase Auth·DB 연동 준비 중입니다. 로그인 완료 상태를 표시하지
          않습니다.
        </Notice>
        <h4>개인 기록 보호</h4>
        <p>
          실제 서비스 연결 시 사용자별 RLS·Storage 권한을 적용합니다. 현재는
          실제 사용자 자료를 서버에 저장하지 않습니다.
        </p>
        <button
          className="button subtle"
          onClick={() =>
            ctx.message(
              "Supabase Auth 서버 연결이 필요합니다. 계정 정보가 생성되지 않았습니다.",
            )
          }
        >
          <User size={15} /> 계정 연결 안내
        </button>
      </Card>
      <Card>
        <div className="row">
          <h2>Google Drive</h2>
          <Cloud size={22} />
        </div>
        <div className="connection-state">
          <span className="status-dot" />
          연결 필요
        </div>
        <p>
          기존 파일을 선택해 가져오고, 변경된 자료를 원본 버전으로 보관해요.
        </p>
        <ul className="connection-list">
          <li>
            <Check size={14} />
            선택한 파일만 가져오기
          </li>
          <li>
            <Check size={14} />
            학생이 확정한 내용은 그대로 유지
          </li>
          <li>
            <Check size={14} />
            AI 분석은 별도 전송 동의
          </li>
        </ul>
        <button
          className="button primary"
          onClick={() =>
            ctx.message(
              "Google OAuth·Picker·Drive 서버 연동이 필요합니다. 파일을 가져오거나 동기화하지 않았습니다.",
            )
          }
        >
          <LinkIcon size={15} /> Google Drive 연결 안내
        </button>
      </Card>
      <Card>
        <div className="row">
          <h2>AI 연결</h2>
          <Sparkles size={21} />
        </div>
        <div className="connection-state">
          <span className="status-dot" />
          Gemini 연결 필요
        </div>
        <p>경험 구조화·상담·문장 다듬기는 실제 서버 응답을 사용합니다.</p>
        <Notice>
          {busy
            ? "설정 상태를 확인하는 중…"
            : error ||
              `서버 키 ${status?.ai.configured ? "설정 감지 · 실제 연동 미완료" : "미설정"} · AI 응답 없음`}
        </Notice>
        <button className="button" disabled={busy} onClick={load}>
          <RefreshCw size={14} className={busy ? "spin" : ""} /> 연결 상태 다시
          확인
        </button>
        <p className="muted">키 값은 브라우저에 전달하지 않습니다.</p>
      </Card>
      <Card>
        <h2>데모 데이터 관리</h2>
        <p className="muted">
          브라우저 전용 데이터이며 실제 계정과 연결되지 않습니다.
        </p>
        <div className="settings-data">
          <span>프로젝트 {ctx.data.projects.length}개</span>
          <span>포트폴리오 {ctx.data.portfolios.length}개</span>
        </div>
        <button className="button" onClick={() => setReset(true)}>
          데모 초기화
        </button>
        <Notice>
          데모 종료 시 개인 모드는 빈 상태로 돌아갑니다. 데모 파일에는
          개인정보를 등록하지 마세요.
        </Notice>
      </Card>
      {reset && (
        <Modal title="데모 데이터 초기화" close={() => setReset(false)}>
          <p>
            이 브라우저에 저장한 데모 편집 내용과 등록 파일을 삭제합니다. 실제
            계정 데이터에는 영향을 주지 않습니다.
          </p>
          <button
            className="button primary"
            onClick={() => {
              try {
                const r = indexedDB.deleteDatabase("record-demo-files-v1");
                r.onsuccess = () => {
                  localStorage.removeItem("record-demo-v1");
                  localStorage.removeItem("record-mode");
                  location.reload();
                };
                r.onerror = () => ctx.message("파일 저장소 삭제 실패");
                r.onblocked = () =>
                  ctx.message("다른 탭을 닫고 다시 시도해 주세요.");
              } catch {
                ctx.message("데모 초기화에 실패했습니다.");
              }
            }}
          >
            삭제하고 초기화
          </button>
        </Modal>
      )}
    </div>
  );
}
