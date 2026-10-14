"use client";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Eye,
  Sparkles,
  FileText,
  Leaf,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import type { AppContext } from "./workspace";
import type { Portfolio as PortfolioData } from "@/lib/data";
import { Card, Checks, Empty, Notice, Modal } from "./ui";
export default function Portfolio({ ctx }: { ctx: AppContext }) {
  const [step, setStep] = useState(1),
    [template, setTemplate] = useState("project"),
    [chosen, setChosen] = useState<string[]>([]),
    [draft, setDraft] = useState<PortfolioData | null>(null),
    [active, setActive] = useState(""),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false);
  const projects = ctx.data.projects;
  const selected = projects.filter((p) => chosen.includes(p.id));
  const current = projects.find((p) => p.id === (active || draft?.order[0]));
  function start() {
    if (!ctx.demo) {
      ctx.message("계정·DB 연결이 필요합니다.");
      return;
    }
    const contents: PortfolioData["contents"] = {};
    for (const p of selected)
      contents[p.id] = {
        problem: p.problem,
        process: p.process,
        result: [p.result, p.reflection].filter(Boolean).join("\n"),
        organization: "",
      };
    const next = {
      id: crypto.randomUUID(),
      title:
        template === "project"
          ? "프로젝트 포트폴리오"
          : "학교생활기록부 대체서식",
      template,
      order: chosen,
      contents,
      updated: "",
      checklist: [false, false],
    };
    setDraft(next);
    setActive(chosen[0]);
    setDirty(true);
    setStep(3);
  }
  function edit(field: string, value: string) {
    if (!draft || !current) return;
    setDraft({
      ...draft,
      contents: {
        ...draft.contents,
        [current.id]: { ...draft.contents[current.id], [field]: value },
      },
    });
    setDirty(true);
  }
  function move(delta: number) {
    if (!draft || !current) return;
    const order = [...draft.order],
      i = order.indexOf(current.id),
      j = i + delta;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    setDraft({ ...draft, order });
    setDirty(true);
  }
  function save() {
    if (!draft) return;
    const next = { ...draft, updated: new Date().toISOString() };
    if (
      ctx.mutate((s) => ({
        ...s,
        portfolios: [...s.portfolios.filter((p) => p.id !== next.id), next],
      }))
    ) {
      setDraft(next);
      setDirty(false);
      ctx.message("포트폴리오를 데모 브라우저 저장소에 저장했습니다.");
    }
  }
  return (
    <>
      <div className="portfolio-top">
        <span>
          RE:Cord <ChevronRight size={12} /> 포트폴리오 만들기
        </span>
        <div className="steps">
          {["유형 선택", "경험 선택", "초안 편집"].map((s, i) => (
            <button
              key={s}
              className={step === i + 1 ? "active" : step > i + 1 ? "done" : ""}
              disabled={i + 1 > step}
              onClick={() => {
                if (dirty) {
                  ctx.message("먼저 변경 내용을 저장해 주세요.");
                  return;
                }
                setStep(i + 1);
              }}
            >
              <b>{step > i + 1 ? <Check size={12} /> : i + 1}</b>
              {s}
            </button>
          ))}
        </div>
      </div>
      {step === 1 ? (
        <>
          <div className="builder-heading">
            <h2>어떤 형태로 정리할까요?</h2>
            <p>
              나에게 맞는 형식을 선택하고, 나만의 포트폴리오를 만들어보세요.
            </p>
          </div>
          <div className="template-grid">
            {[
              {
                id: "project",
                title: "프로젝트 포트폴리오",
                sub: "내 역할과 문제 해결 과정을 소개해요.",
                items: [
                  "프로젝트 소개",
                  "역할 · 과정 · 결과",
                  "배운 점과 다음 시도",
                ],
              },
              {
                id: "substitute",
                title: "대체서식",
                sub: "서울대 2027 참고 작성안 · 공식 제출 규칙 미검증",
                items: [
                  "활동명 · 기간",
                  "활동내용 · 발행기관",
                  "항목별 작성안",
                ],
              },
            ].map((t) => (
              <button
                className={`template card ${template === t.id ? "selected" : ""}`}
                key={t.id}
                onClick={() => setTemplate(t.id)}
              >
                <span className="selection-mark">
                  {template === t.id && <Check size={13} />}
                </span>
                <h2>{t.title}</h2>
                <p>{t.sub}</p>
                <div className="template-body">
                  <div
                    className={`paper ${t.id === "substitute" ? "table-paper" : ""}`}
                  >
                    <strong>RE:Cord</strong>
                    <span />
                    <span />
                    <span />
                    {t.id === "substitute" ? (
                      <div className="paper-table">
                        {Array.from({ length: 12 }, (_, i) => (
                          <i key={i} />
                        ))}
                      </div>
                    ) : (
                      <>
                        <b />
                        <span />
                        <span />
                        <span />
                        <b />
                        <span />
                      </>
                    )}
                  </div>
                  <ul>
                    {t.items.map((x, i) => (
                      <li key={x}>
                        <Check size={14} />
                        <span>
                          <strong>{x}</strong>
                          <small>
                            {
                              [
                                "프로젝트의 주제와 배경을 정리해요.",
                                "내가 한 역할과 해결 과정을 기록해요.",
                                "경험에서 배운 점을 내 문장으로 담아요.",
                              ][i]
                            }
                          </small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
          <div className="builder-bottom">
            <p>
              <Leaf size={20} />{" "}
              <span>
                <strong>진로가 정해지지 않아도 바로 시작할 수 있어요.</strong>
                <small>
                  지금까지의 경험만으로도 충분히 의미 있는 포트폴리오가
                  만들어집니다.
                </small>
              </span>
            </p>
            <button className="button primary" onClick={() => setStep(2)}>
              이 서식으로 시작 <ChevronRight size={16} />
            </button>
          </div>
          {ctx.data.portfolios.length > 0 && (
            <Card className="saved-portfolios">
              <h3>저장한 포트폴리오</h3>
              {ctx.data.portfolios.map((p) => (
                <div className="row saved-row" key={p.id}>
                  <button
                    onClick={() => {
                      setDraft(p);
                      setChosen(p.order);
                      setTemplate(p.template);
                      setActive(p.order[0]);
                      setDirty(false);
                      setStep(3);
                    }}
                  >
                    <FileText size={16} />
                    <span>
                      {p.title}
                      <small>
                        {new Date(p.updated).toLocaleDateString("ko-KR")}
                      </small>
                    </span>
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${p.title} 삭제`}
                    onClick={() =>
                      ctx.mutate((s) => ({
                        ...s,
                        portfolios: s.portfolios.filter((x) => x.id !== p.id),
                      }))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </Card>
          )}
        </>
      ) : step === 2 ? (
        <>
          <div className="builder-heading">
            <h2>담을 프로젝트를 선택해 주세요.</h2>
            <p>추천 순위 대신, 내 기록과 근거를 보고 경험을 선택해요.</p>
          </div>
          <div className="selection-list">
            {projects
              .filter((p) => p.title.includes(ctx.query))
              .map((p) => (
                <label
                  className={`card experience-option ${chosen.includes(p.id) ? "selected" : ""}`}
                  key={p.id}
                >
                  <div className="row">
                    <h3>
                      <input
                        type="checkbox"
                        checked={chosen.includes(p.id)}
                        onChange={() =>
                          setChosen(
                            chosen.includes(p.id)
                              ? chosen.filter((x) => x !== p.id)
                              : [...chosen, p.id],
                          )
                        }
                      />
                      {p.title}
                    </h3>
                    <small>
                      {p.start || "미확인"} – {p.end || "미확인"}
                    </small>
                  </div>
                  <Checks project={p} />
                </label>
              ))}
            {!projects.length && (
              <Card>
                <Empty title="선택할 경험이 아직 없어요" />
                <button className="button" onClick={() => ctx.go("projects")}>
                  내 프로젝트로 이동
                </button>
              </Card>
            )}
          </div>
          <Notice>
            미확인 항목이 있어도 시작할 수 있어요. 아래 버튼은 저장된 기록을
            옮겨 담으며 AI를 호출하지 않습니다.
          </Notice>
          <div className="builder-bottom">
            <p>
              <strong>{chosen.length}개 선택</strong>
            </p>
            <button
              className="button primary"
              disabled={!selected.length}
              onClick={start}
            >
              기록으로 작성 시작 <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : draft ? (
        <>
          <div className="row editor-title">
            <div>
              <h2>{draft.title}</h2>
              <p>지금까지의 기록을 바탕으로, 나만의 이야기를 정리해보세요.</p>
            </div>
            <div className="editor-actions">
              <span className="tiny">
                {dirty
                  ? "저장하지 않은 변경"
                  : draft.updated
                    ? "데모 저장됨"
                    : "작성 중"}
              </span>
              <button className="button" onClick={save}>
                <Save size={14} /> 저장
              </button>
              <button
                className="button primary"
                onClick={() => setPreview(true)}
              >
                <Eye size={15} /> 미리보기
              </button>
            </div>
          </div>
          <div className="editor-grid">
            <Card className="order-panel">
              <h3>프로젝트 순서</h3>
              {draft.order.map((id, i) => (
                <button
                  className={`order-item ${current?.id === id ? "active" : ""}`}
                  key={id}
                  onClick={() => setActive(id)}
                >
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <span>
                    {projects.find((p) => p.id === id)?.title ||
                      "삭제된 프로젝트"}
                    <small>{current?.id === id ? "현재 편집 중" : ""}</small>
                  </span>
                </button>
              ))}
              <div className="order-actions">
                <button
                  className="button mini"
                  onClick={() => move(-1)}
                  disabled={!current || draft.order.indexOf(current.id) === 0}
                >
                  <ArrowUp size={14} /> 위로
                </button>
                <button
                  className="button mini"
                  onClick={() => move(1)}
                  disabled={
                    !current ||
                    draft.order.indexOf(current.id) === draft.order.length - 1
                  }
                >
                  <ArrowDown size={14} /> 아래로
                </button>
              </div>
              <p className="muted">
                프로젝트 단위로 이동하며
                <br />
                순서를 조정할 수 있습니다.
              </p>
            </Card>
            <Card className="draft-body">
              {current ? (
                <>
                  <h2>{current.title}</h2>
                  <p className="muted">
                    {current.start || "기간 미확인"} – {current.end || "미확인"}{" "}
                    · {current.role || "역할 미확인"}
                  </p>
                  {draft.template === "substitute" ? (
                    <>
                      <label>
                        활동내용
                        <textarea
                          value={draft.contents[current.id]?.process || ""}
                          onChange={(e) => edit("process", e.target.value)}
                          rows={6}
                        />
                      </label>
                      <label>
                        활동(발행) 기관
                        <input
                          value={draft.contents[current.id]?.organization || ""}
                          placeholder="학생이 직접 확인해 주세요"
                          onChange={(e) => edit("organization", e.target.value)}
                        />
                      </label>
                      <Notice>
                        참고 작성안입니다. 공식 원본 확인 전 실제 제출 적합성을
                        보장하지 않습니다.
                      </Notice>
                      <h3>증빙 준비 체크리스트</h3>
                      {[
                        "학교에 증빙서류 발급 요청",
                        "발급받은 서류 준비 완료",
                      ].map((x, i) => (
                        <label className="checklist" key={x}>
                          <input
                            type="checkbox"
                            checked={draft.checklist[i]}
                            onChange={(e) => {
                              const checklist = [...draft.checklist];
                              checklist[i] = e.target.checked;
                              setDraft({ ...draft, checklist });
                              setDirty(true);
                            }}
                          />
                          {x}
                        </label>
                      ))}
                    </>
                  ) : (
                    (
                      [
                        [
                          "problem",
                          "문제",
                          "프로젝트를 시작하게 된 배경과 해결하고자 했던 문제를 적어보세요.",
                        ],
                        [
                          "process",
                          "내 역할과 과정",
                          "내가 맡은 역할과 직접 한 행동을 내 문장으로 정리해요.",
                        ],
                        [
                          "result",
                          "결과와 회고",
                          "경험을 통해 배운 점, 앞으로의 계획을 정리해보세요.",
                        ],
                      ] as const
                    ).map(([key, label, help]) => (
                      <label key={key}>
                        {label}
                        <small>{help}</small>
                        <textarea
                          value={draft.contents[current.id]?.[key] || ""}
                          onChange={(e) => edit(key, e.target.value)}
                          rows={key === "process" ? 5 : 4}
                          placeholder="미확인 · 기존 기록을 확인하고 내용을 보완해 주세요."
                        />
                        <span className="char-count">
                          {draft.contents[current.id]?.[key]?.length || 0}자
                        </span>
                      </label>
                    ))
                  )}
                </>
              ) : (
                <Empty title="프로젝트가 삭제되었어요">
                  기존 저장된 포트폴리오 내용은 미리보기에서 확인할 수 있어요.
                </Empty>
              )}
            </Card>
            <Card className="edit-ai">
              <h3 className="icon-title">
                <Sparkles size={19} /> AI 문장 다듬기
              </h3>
              <p className="muted">
                선택한 내용을 바탕으로 표현을 제안해드려요.
              </p>
              {["더 간결하게", "내 역할 중심으로", "선택 부분 다시 쓰기"].map(
                (x) => (
                  <button
                    className="refine"
                    key={x}
                    onClick={() =>
                      ctx.message(
                        "Gemini 서버 연결이 필요합니다. 현재 문장은 변경하지 않았습니다.",
                      )
                    }
                  >
                    <Sparkles size={16} />
                    {x}
                    <ChevronRight size={14} />
                  </button>
                ),
              )}
              <Notice>
                AI 연결 필요
                <br />새 제안은 확인 후 적용합니다.
              </Notice>
              <h3>참고한 기록</h3>
              <p className="muted">이 프로젝트의 연결된 기록을 열어보세요.</p>
              {current?.materials.map((m) => (
                <button
                  key={m.id}
                  className="reference"
                  onClick={() => ctx.openMaterial(m)}
                >
                  <FileText size={16} />
                  {m.title}
                </button>
              ))}
            </Card>
          </div>
        </>
      ) : null}
      {preview && draft && (
        <Modal title="포트폴리오 미리보기" close={() => setPreview(false)}>
          <div className="preview-paper">
            <h2>{draft.title}</h2>
            <Notice>데모 작성안 · 실제 제출 서식 검증 전</Notice>
            {draft.order.map((id, i) => (
              <article key={id}>
                <h3>
                  {String(i + 1).padStart(2, "0")}{" "}
                  {projects.find((p) => p.id === id)?.title ||
                    "삭제된 프로젝트"}
                </h3>
                {Object.entries(draft.contents[id] || {})
                  .filter(([k]) =>
                    draft.template === "project"
                      ? k !== "organization"
                      : ["process", "organization"].includes(k),
                  )
                  .map(([k, v]) => (
                    <p key={k}>
                      <b>
                        {
                          {
                            problem: "문제",
                            process:
                              draft.template === "project"
                                ? "내 역할과 과정"
                                : "활동내용",
                            result: "결과와 회고",
                            organization: "발행기관",
                          }[k]
                        }
                      </b>
                      <span>{v || "미확인"}</span>
                    </p>
                  ))}
              </article>
            ))}
          </div>
          <button
            className="button"
            onClick={() => {
              const text = draft.order
                .map((id) =>
                  [
                    projects.find((p) => p.id === id)?.title,
                    ...Object.values(draft.contents[id] || {}),
                  ].join("\n"),
                )
                .join("\n\n");
              const url = URL.createObjectURL(
                new Blob([text], { type: "text/plain;charset=utf-8" }),
              );
              const a = document.createElement("a");
              a.href = url;
              a.download = "RE-Cord-작성안.txt";
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            작성안 TXT 다운로드
          </button>
        </Modal>
      )}
    </>
  );
}
