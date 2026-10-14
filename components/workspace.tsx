"use client";
import { useEffect, useState } from "react";
import {
  Home,
  Network,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Sprout,
  Menu,
  X,
  Leaf,
  Plus,
  ChevronRight,
  Upload,
  Sparkles,
  Lightbulb,
  Pencil,
  ExternalLink,
  Trash2,
} from "lucide-react";
import Learning from "./learning";
import Portfolio from "./portfolio";
import { Dashboard, Consultation, SettingsScreen } from "./other-screens";
import {
  seed,
  emptyStore,
  type Store,
  type Project,
  type Material,
} from "@/lib/data";
import { saveFile, getFile, removeFile } from "@/lib/demo-storage";
import { Card, Checks, Empty, Notice, Quote, MaterialIcon, Modal } from "./ui";
const nav = [
  ["projects", "내 프로젝트", Home],
  ["learning", "나의 배움 정리", Network],
  ["portfolio", "포트폴리오 만들기", FileText],
  ["dashboard", "대시보드", LayoutDashboard],
  ["consultation", "AI 상담", MessageCircle],
  ["settings", "자료 연결 및 설정", Settings],
] as const;
export type Screen = (typeof nav)[number][0];
export type AppContext = {
  data: Store;
  demo: boolean;
  query: string;
  mutate: (fn: (s: Store) => Store) => boolean;
  message: (s: string) => void;
  openMaterial: (m: Material) => void;
  consult: () => void;
  go: (s: Screen) => void;
};
export default function Workspace() {
  const [screen, setScreen] = useState<Screen>("projects"),
    [data, setData] = useState<Store>(emptyStore),
    [demo, setDemo] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false),
    [modal, setModal] = useState<React.ReactNode>(null),
    [toast, setToast] = useState(""),
    [panel, setPanel] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("record-mode") === "demo") {
        setDemo(true);
        const raw = localStorage.getItem("record-demo-v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            !Array.isArray(parsed.projects) ||
            !Array.isArray(parsed.portfolios)
          )
            throw Error("invalid");
          setData(parsed);
        } else setData(seed());
      }
    } catch {
      setError(
        "데모 저장 데이터를 읽지 못했습니다. 설정에서 데모를 초기화해 주세요.",
      );
    }
    setLoading(false);
    const hash = location.hash.slice(1);
    if (nav.some((n) => n[0] === hash)) setScreen(hash as Screen);
    const change = () => {
      const h = location.hash.slice(1);
      if (nav.some((n) => n[0] === h)) setScreen(h as Screen);
    };
    addEventListener("hashchange", change);
    return () => removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  function go(s: Screen) {
    setScreen(s);
    location.hash = s;
    setMobile(false);
    setQuery("");
  }
  function message(s: string) {
    setToast(s);
  }
  function mutate(fn: (s: Store) => Store) {
    if (!demo) {
      message(
        "계정·데이터베이스 연결이 필요합니다. 데모 모드에서 화면을 체험할 수 있어요.",
      );
      return false;
    }
    try {
      const next = fn(data);
      localStorage.setItem("record-demo-v1", JSON.stringify(next));
      setData(next);
      return true;
    } catch {
      setError(
        "브라우저 저장에 실패했습니다. 저장 공간과 브라우저 설정을 확인해 주세요.",
      );
      return false;
    }
  }
  function toggleDemo() {
    try {
      if (demo) {
        localStorage.setItem("record-mode", "live");
        setData(emptyStore);
        setDemo(false);
      } else {
        const raw = localStorage.getItem("record-demo-v1");
        const next = raw ? JSON.parse(raw) : seed();
        localStorage.setItem("record-demo-v1", JSON.stringify(next));
        localStorage.setItem("record-mode", "demo");
        setData(next);
        setDemo(true);
      }
      setError("");
      setModal(null);
    } catch {
      setError("데모를 불러오지 못했습니다. 설정에서 초기화해 주세요.");
    }
  }
  async function openMaterial(m: Material) {
    if (m.kind === "file" && !m.sample) {
      try {
        const blob = await getFile(m.id);
        if (!blob) throw Error();
        const url = URL.createObjectURL(blob);
        setModal(
          <Modal
            title={m.title}
            close={() => {
              URL.revokeObjectURL(url);
              setModal(null);
            }}
          >
            <a className="button primary" href={url} download={m.title}>
              원본 파일 다운로드
            </a>
            <p>브라우저 데모 저장소의 원본 파일입니다.</p>
          </Modal>,
        );
      } catch {
        message("원본 파일을 찾을 수 없습니다. 다시 등록해 주세요.");
      }
    } else
      setModal(
        <Modal title={m.title} close={() => setModal(null)}>
          {m.sample && (
            <Notice>명시적 데모 자료입니다. 실제 학생 자료가 아닙니다.</Notice>
          )}
          <p className="preserve">{m.text}</p>
          {m.url && (
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              원본 링크 열기 <ExternalLink size={14} />
            </a>
          )}
        </Modal>,
      );
  }
  const ctx: AppContext = {
    data,
    demo,
    query,
    mutate,
    message,
    openMaterial,
    consult: () => setPanel(true),
    go,
  };
  return (
    <div className="app">
      <a className="skip" href="#main">
        본문으로 이동
      </a>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <Leaf size={26} fill="currentColor" />
          <strong>RE:Cord</strong>
          <button
            className="mobile-only icon-button"
            aria-label="메뉴 닫기"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <p className="tagline">
          기록이 만드는
          <br />더 나은 나
        </p>
        <nav>
          {nav.map(([key, label, Icon], i) => (
            <button
              key={key}
              className={`nav-item ${key === screen ? "active" : ""} ${i === 3 ? "nav-divider" : ""}`}
              onClick={() => go(key)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Sprout size={24} />
          <p>
            오늘도
            <br />
            좋은 성장을 기록해요.
            <br />
            RE:Cord가 함께합니다.
          </p>
          <span className="tiny">나의 경험, 나의 이야기</span>
        </div>
      </aside>
      {mobile && (
        <button
          className="nav-backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="shell">
        <header className="topbar">
          <button
            className="mobile-only icon-button"
            aria-label="메뉴 열기"
            onClick={() => setMobile(true)}
          >
            <Menu size={22} />
          </button>
          <div className="top-label">
            나의 기록 공간 <span>/</span>{" "}
            {nav.find((n) => n[0] === screen)?.[1]}
          </div>
          <label className="search">
            <Search size={16} />
            <input
              aria-label="프로젝트, 키워드 검색"
              placeholder="프로젝트, 키워드 검색하기…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="icon-button"
                aria-label="검색 지우기"
                onClick={() => setQuery("")}
              >
                <X size={13} />
              </button>
            )}
          </label>
          <button
            className="icon-button bell"
            aria-label="알림"
            onClick={() =>
              message(
                "새 알림이 없습니다. AI 연결 후 검토 요청을 확인할 수 있어요.",
              )
            }
          >
            <Bell size={18} />
          </button>
          <button className="user" onClick={() => go("settings")}>
            <span className="avatar">{demo ? "김" : "나"}</span>
            <span>{demo ? "김지민님" : "계정 연결"}</span>
            <ChevronDown size={14} />
          </button>
        </header>
        <div className={`mode-bar ${demo ? "demo" : ""}`}>
          <span>
            <span className="mode-dot" />
            {demo
              ? "데모 모드 · 예시 자료 / 브라우저에만 저장"
              : "개인 작업 공간 · 계정 및 데이터 연결 필요"}
          </span>
          <button onClick={toggleDemo}>
            {demo ? "데모 종료" : "데모 모드 체험"} <ChevronRight size={14} />
          </button>
        </div>
        {query && (
          <div className="search-results" aria-label="검색 결과">
            <div className="row">
              <h3>검색 결과</h3>
              <button
                className="icon-button"
                aria-label="검색 결과 닫기"
                onClick={() => setQuery("")}
              >
                <X size={15} />
              </button>
            </div>
            {data.projects
              .filter((p) => p.title.includes(query))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    go("projects");
                    setQuery(p.title);
                  }}
                >
                  <Home size={15} />
                  {p.title}
                  <ChevronRight size={13} />
                </button>
              ))}
            {data.projects
              .flatMap((p) => p.materials)
              .filter((m) => (m.title + " " + m.text).includes(query))
              .slice(0, 6)
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setQuery("");
                    openMaterial(m);
                  }}
                >
                  <MaterialIcon material={m} />
                  {m.title}
                  <ChevronRight size={13} />
                </button>
              ))}
            {!data.projects.some(
              (p) =>
                p.title.includes(query) ||
                p.materials.some((m) =>
                  (m.title + " " + m.text).includes(query),
                ),
            ) && <p>검색 결과가 없습니다.</p>}
          </div>
        )}
        <main id="main">
          {error && (
            <div role="alert" className="error">
              {error}
              <button onClick={() => go("settings")}>설정 열기</button>
            </div>
          )}
          {loading ? (
            <div className="loading" role="status">
              <span className="spinner" />
              기록 공간을 불러오는 중…
            </div>
          ) : (
            <>
              <div className="page-heading">
                <div>
                  <h1>{nav.find((n) => n[0] === screen)?.[1]}</h1>
                  <p>
                    {screen === "projects"
                      ? "진행 중인 프로젝트를 관리하고, 기록을 모아 더 나은 나를 만들어보세요."
                      : "나의 기록에서 발견하는 경험과 배움"}
                  </p>
                </div>
                <button
                  className="button subtle"
                  onClick={() => setPanel(true)}
                >
                  <MessageCircle size={16} /> AI와 이야기하기
                </button>
              </div>
              {screen === "projects" ? (
                <Projects ctx={ctx} />
              ) : screen === "learning" ? (
                <Learning ctx={ctx} />
              ) : screen === "portfolio" ? (
                <Portfolio ctx={ctx} />
              ) : screen === "dashboard" ? (
                <Dashboard ctx={ctx} />
              ) : screen === "consultation" ? (
                <Consultation ctx={ctx} />
              ) : (
                <SettingsScreen ctx={ctx} />
              )}
            </>
          )}
        </main>
        <footer>
          RE:Cord <span>오늘의 경험을, 내일의 가능성으로.</span>
          <span>내 기록은 내가 확인하고 완성합니다.</span>
        </footer>
      </div>
      {modal}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {panel && (
        <div className="panel-overlay">
          <aside className="consult-panel">
            <div className="row">
              <h2>
                <Sparkles size={20} /> AI 상담
              </h2>
              <button
                className="icon-button"
                aria-label="상담 패널 닫기"
                onClick={() => setPanel(false)}
              >
                <X size={20} />
              </button>
            </div>
            <Consultation ctx={ctx} compact />
            <button
              className="button primary"
              onClick={() => {
                setPanel(false);
                go("consultation");
              }}
            >
              상담 화면으로 이동
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
function Projects({ ctx }: { ctx: AppContext }) {
  const { data, query, mutate, message } = ctx;
  const [selected, setSelected] = useState("access"),
    [tab, setTab] = useState("자료 관리"),
    [dialog, setDialog] = useState<"new" | "edit" | "material" | null>(null),
    [saving, setSaving] = useState(false);
  const chosen =
    data.projects.find((p) => p.id === selected) || data.projects[0];
  const p = query
    ? data.projects.find((p) =>
        `${p.title} ${p.description} ${p.materials.map((m) => m.title + " " + m.text).join(" ")}`.includes(
          query,
        ),
      )
    : chosen;
  const matching = data.projects.filter((p) =>
    `${p.title} ${p.description} ${p.materials.map((m) => m.title + " " + m.text).join(" ")}`.includes(
      query,
    ),
  );
  function update(p: Project) {
    return mutate((s) => ({
      ...s,
      projects: s.projects.map((x) => (x.id === p.id ? p : x)),
    }));
  }
  function needDemo() {
    if (!ctx.demo) {
      message(
        "계정·DB 연결이 필요합니다. 데모 모드를 켜면 브라우저에서 편집할 수 있어요.",
      );
      return true;
    }
    return false;
  }
  async function upload(files: FileList | null) {
    if (!files || !p || needDemo()) return;
    setSaving(true);
    try {
      const additions: Material[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 20 * 1024 * 1024)
          throw Error("파일은 20MB 이하로 등록해 주세요.");
        if (!/\.(pdf|png|jpe?g|txt|md)$/i.test(f.name))
          throw Error("PDF, JPG, PNG, TXT, MD 파일을 지원합니다.");
        const id = crypto.randomUUID();
        await saveFile(id, f);
        additions.push({
          id,
          title: f.name,
          kind: "file",
          date: new Date().toISOString().slice(0, 10),
          text: /\.(txt|md)$/i.test(f.name) ? await f.text() : "",
        });
      }
      if (update({ ...p, materials: [...p.materials, ...additions] }))
        message(
          "데모 브라우저 저장소에 원본을 등록했습니다. AI 분석은 수행하지 않았습니다.",
        );
    } catch (e) {
      message(e instanceof Error ? e.message : "파일 저장 실패");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <div className="project-grid">
        <Card className="project-list">
          <div className="row">
            <h3>프로젝트 목록</h3>
            <span className="purple">{data.projects.length}</span>
          </div>
          <button
            className="button primary full"
            onClick={() => {
              if (!needDemo()) setDialog("new");
            }}
          >
            <Plus size={16} /> 새 프로젝트
          </button>
          <div className="project-items">
            {matching.map((x) => (
              <button
                key={x.id}
                className={`project-item ${p?.id === x.id ? "selected" : ""}`}
                onClick={() => {
                  setSelected(x.id);
                  setTab("자료 관리");
                }}
              >
                <span>
                  <strong>{x.title.replace(" 프로젝트", "")}</strong>
                  <small>
                    {x.status} · 자료 {x.materials.length}개
                  </small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
            {matching.length === 0 && (
              <Empty
                title={query ? "검색 결과가 없어요" : "첫 프로젝트를 시작해요"}
              />
            )}
          </div>
        </Card>
        <Card className="project-work">
          {p ? (
            <>
              <div className="project-title row">
                <div>
                  <h2>{p.title}</h2>
                  <p>
                    {p.start || "시작일 미확인"}
                    {p.end ? ` – ${p.end}` : " · 종료일 미확인"}
                  </p>
                </div>
                <button
                  className="button mini"
                  onClick={() => {
                    if (!needDemo()) setDialog("edit");
                  }}
                >
                  <Pencil size={13} /> 수정
                </button>
              </div>
              <div className="tabs" role="tablist" aria-label="프로젝트 작업">
                {["자료 관리", "프로젝트 개요", "진행 기록", "성과 정리"].map(
                  (t) => (
                    <button
                      role="tab"
                      aria-selected={t === tab}
                      key={t}
                      className={tab === t ? "active" : ""}
                      onClick={() => setTab(t)}
                    >
                      {t}
                    </button>
                  ),
                )}
              </div>
              {tab === "자료 관리" ? (
                <>
                  <div className="row section-heading">
                    <h3>노트 리스트</h3>
                    <button
                      className="button mini"
                      onClick={() => {
                        if (!needDemo()) setDialog("material");
                      }}
                    >
                      링크 · 메모 추가
                    </button>
                  </div>
                  <label
                    className={`upload ${saving ? "busy" : ""}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      upload(e.dataTransfer.files);
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                      aria-label="파일 등록"
                      disabled={saving || !ctx.demo}
                      onChange={(e) => {
                        upload(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <Upload size={29} />
                    <strong>
                      {saving
                        ? "원본을 저장하고 있어요…"
                        : "파일을 끌어놓거나 선택하세요"}
                    </strong>
                    <span>문서 · 사진 · 링크 · 자유 메모</span>
                    <small>
                      {ctx.demo
                        ? "데모 브라우저 저장소 · 파일당 최대 20MB"
                        : "계정·Storage 연결 후 업로드할 수 있어요."}
                    </small>
                  </label>
                  <div className="materials">
                    {p.materials
                      .filter(
                        (m) =>
                          !query ||
                          (m.title + " " + m.text).includes(query) ||
                          p.title.includes(query),
                      )
                      .map((m) => (
                        <div className="material-row" key={m.id}>
                          <button
                            className="material-main"
                            onClick={() => ctx.openMaterial(m)}
                          >
                            <MaterialIcon material={m} />
                            <span>
                              <strong>{m.title}</strong>
                              <small>
                                {m.date} ·{" "}
                                {m.sample ? "예시 자료" : "데모 저장소"}
                              </small>
                            </span>
                          </button>
                          <span className="tiny">
                            {m.kind === "link"
                              ? "링크"
                              : m.kind === "file"
                                ? "파일"
                                : "노트"}
                          </span>
                          <button
                            className="icon-button"
                            aria-label={`${m.title} 삭제`}
                            onClick={async () => {
                              if (needDemo()) return;
                              try {
                                if (m.kind === "file" && !m.sample)
                                  await removeFile(m.id);
                                if (
                                  update({
                                    ...p,
                                    materials: p.materials.filter(
                                      (x) => x.id !== m.id,
                                    ),
                                  })
                                )
                                  message("데모 자료를 삭제했습니다.");
                              } catch {
                                message("파일 삭제에 실패했습니다.");
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    {p.materials.length === 0 && <Empty />}
                  </div>
                  <div className="material-foot">
                    <span>자료 {p.materials.length}개</span>
                    <span>원본은 그대로, 경험은 연결해서.</span>
                  </div>
                </>
              ) : (
                <form
                  key={`${p.id}-${tab}`}
                  className="project-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (needDemo()) return;
                    const f = new FormData(e.currentTarget);
                    const next = { ...p };
                    for (const key of [
                      "description",
                      "role",
                      "problem",
                      "process",
                      "result",
                      "reflection",
                    ] as const)
                      if (f.has(key)) next[key] = String(f.get(key));
                    if (update(next))
                      message("변경 내용을 데모 저장소에 저장했습니다.");
                  }}
                >
                  {(tab === "프로젝트 개요"
                    ? [
                        ["description", "프로젝트 소개"],
                        ["role", "내 역할"],
                        ["problem", "시작한 이유와 문제"],
                      ]
                    : tab === "진행 기록"
                      ? [["process", "내가 한 일과 과정"]]
                      : [
                          ["result", "결과와 변화"],
                          ["reflection", "배운 점과 다음 시도"],
                        ]
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <textarea
                        name={key}
                        defaultValue={p[key as "description"]}
                        placeholder="기존 기록에서 필요한 내용을 정리해 보세요."
                        rows={5}
                      />
                    </label>
                  ))}
                  <button className="button primary" type="submit">
                    변경 내용 저장
                  </button>
                </form>
              )}
            </>
          ) : (
            <Empty title="프로젝트 기록을 모아보세요">
              계정 연결 후 시작하거나 데모 모드에서 화면을 체험하세요.
            </Empty>
          )}
        </Card>
        <Card className="ai-side">
          <h2 className="icon-title">
            <Sparkles size={20} /> AI 보완 제안
          </h2>
          <p className="muted">더 풍부한 기록을 위한 제안을 확인해보세요.</p>
          {ctx.demo && p ? (
            <>
              <span className="badge">예시 제안 · 실제 AI 응답 아님</span>
              <button
                className="suggestion"
                onClick={() => setDialog("material")}
              >
                <FileText size={23} />
                <span>
                  <strong>완성한 결과물이 있나요?</strong>
                  <small>지도 시안이나 발표자료를 추가해요.</small>
                  <b>
                    자료 추가하기 <ChevronRight size={14} />
                  </b>
                </span>
              </button>
              <button
                className="suggestion"
                onClick={() => setTab("성과 정리")}
              >
                <Lightbulb size={23} />
                <span>
                  <strong>무엇을 배웠나요?</strong>
                  <small>배운 점과 다음 개선점을 남겨요.</small>
                  <b>
                    짧게 답하기 <ChevronRight size={14} />
                  </b>
                </span>
              </button>
            </>
          ) : (
            <Notice>
              AI 연결 필요
              <br />
              자료를 분석한 뒤 보완 제안이 표시됩니다.
            </Notice>
          )}
          <div className="check-block">
            <h3>기록 확인</h3>
            <p>프로젝트 경험을 다양한 관점에서 점검해보세요.</p>
            {p ? (
              <Checks project={p} />
            ) : (
              <div className="checks">
                {["기간", "역할", "문제", "과정", "결과", "증빙", "회고"].map(
                  (f) => (
                    <span className="unverified" key={f}>
                      {f} · 미확인
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
          <Quote />
          <button className="text-button" onClick={ctx.consult}>
            <MessageCircle size={15} /> 이 경험에 대해 상담하기
          </button>
        </Card>
      </div>
      {dialog && (
        <Modal
          title={
            dialog === "new"
              ? "새 프로젝트"
              : dialog === "edit"
                ? "프로젝트 수정"
                : "링크 · 메모 추가"
          }
          close={() => setDialog(null)}
        >
          <form
            className="dialog-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (!String(f.get("title") || "").trim()) {
                message("이름을 입력해 주세요.");
                return;
              }
              if (dialog === "material" && p) {
                const url = String(f.get("url") || "").trim();
                if (url) {
                  try {
                    const parsed = new URL(url);
                    if (!["http:", "https:"].includes(parsed.protocol))
                      throw Error();
                  } catch {
                    message("http 또는 https 링크를 입력해 주세요.");
                    return;
                  }
                }
                const m: Material = {
                  id: crypto.randomUUID(),
                  title: String(f.get("title")).trim(),
                  kind: url ? "link" : "text",
                  text: String(f.get("text") || ""),
                  url: url || undefined,
                  date: new Date().toISOString().slice(0, 10),
                };
                if (update({ ...p, materials: [...p.materials, m] }))
                  setDialog(null);
              } else {
                const start = String(f.get("start") || ""),
                  end = String(f.get("end") || "");
                if (start && end && end < start) {
                  message("종료일은 시작일 이후여야 합니다.");
                  return;
                }
                const base: Project =
                  dialog === "edit" && p
                    ? p
                    : {
                        id: crypto.randomUUID(),
                        title: "",
                        description: "",
                        role: "",
                        problem: "",
                        process: "",
                        result: "",
                        reflection: "",
                        interests: [],
                        materials: [],
                        start: "",
                        end: "",
                        status: "진행 중",
                      };
                const next = {
                  ...base,
                  title: String(f.get("title")).trim(),
                  start,
                  end,
                  status: String(f.get("status")) as Project["status"],
                };
                if (
                  mutate((s) => ({
                    ...s,
                    projects:
                      dialog === "edit"
                        ? s.projects.map((x) => (x.id === next.id ? next : x))
                        : [...s.projects, next],
                  }))
                ) {
                  setSelected(next.id);
                  setDialog(null);
                  message("프로젝트를 데모 저장소에 저장했습니다.");
                }
              }
            }}
          >
            <label>
              {dialog === "material" ? "자료 제목" : "프로젝트 이름"}
              <input
                name="title"
                required
                maxLength={100}
                defaultValue={dialog === "edit" ? p?.title : ""}
              />
            </label>
            {dialog === "material" ? (
              <>
                <label>
                  원본 링크 (선택)
                  <input name="url" type="url" placeholder="https://" />
                </label>
                <label>
                  기존 기록 또는 자유 메모
                  <textarea name="text" rows={5} />
                </label>
                <Notice>
                  원본 링크는 저장만 하며 자동 수집하거나 AI에 전송하지
                  않습니다.
                </Notice>
              </>
            ) : (
              <>
                <div className="two-col">
                  <label>
                    시작일
                    <input
                      name="start"
                      type="date"
                      defaultValue={dialog === "edit" ? p?.start : ""}
                    />
                  </label>
                  <label>
                    종료일
                    <input
                      name="end"
                      type="date"
                      defaultValue={dialog === "edit" ? p?.end : ""}
                    />
                  </label>
                </div>
                <label>
                  진행 상태
                  <select
                    name="status"
                    defaultValue={dialog === "edit" ? p?.status : "진행 중"}
                  >
                    <option>진행 중</option>
                    <option>완료</option>
                  </select>
                </label>
              </>
            )}
            <button className="button primary" type="submit">
              데모 저장소에 저장
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
