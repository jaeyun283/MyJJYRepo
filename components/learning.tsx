"use client";
import { useState } from "react";
import {
  FileText,
  ChevronRight,
  Network,
  Info,
  Plus,
  Minus,
} from "lucide-react";
import type { AppContext } from "./workspace";
import { Card, Empty, Notice, Quote } from "./ui";
export default function Learning({ ctx }: { ctx: AppContext }) {
  const [tab, setTab] = useState("경험 그래프"),
    [selected, setSelected] = useState("access"),
    [filter, setFilter] = useState("all"),
    [interest, setInterest] = useState("접근성"),
    [zoom, setZoom] = useState(1);
  const projects = ctx.data.projects.filter(
    (p) =>
      (filter === "all" || p.id === filter) &&
      `${p.title} ${p.role} ${p.interests.join(" ")}`.includes(ctx.query),
  );
  const p = projects.find((x) => x.id === selected) || projects[0];
  const interests = [...new Set(ctx.data.projects.flatMap((p) => p.interests))];
  const related = projects.filter((p) => p.interests.includes(interest));
  return (
    <>
      <div className="segmented" role="tablist" aria-label="배움 정리">
        {["경험 그래프", "관심사·패턴"].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tab}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {!projects.length ? (
        <Card>
          <Empty
            title={
              ctx.query ? "연결된 경험이 없어요" : "경험의 연결을 발견해 보세요"
            }
          >
            프로젝트 기록을 모으면 경험과 근거를 함께 살펴볼 수 있어요.
          </Empty>
          <button className="button primary" onClick={() => ctx.go("projects")}>
            내 프로젝트로 이동
          </button>
        </Card>
      ) : tab === "경험 그래프" ? (
        <div className="learning-grid">
          <Card className="graph-card">
            <div className="row">
              <h2>나의 경험 연결</h2>
              <select
                aria-label="프로젝트 필터"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">전체 프로젝트</option>
                {ctx.data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="graph">
              <svg viewBox="0 0 760 500" aria-label="경험과 연결된 기록 그래프">
                <defs>
                  <radialGradient id="node">
                    <stop stopColor="#d7c7ff" />
                    <stop offset=".7" stopColor="#9670f4" />
                    <stop offset="1" stopColor="#7550cb" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>
                <g
                  transform={`translate(${380 - 380 * zoom},${250 - 250 * zoom}) scale(${zoom})`}
                >
                  {projects.map((x, i) => {
                    const cx = projects.length === 1 ? 350 : 200 + i * 180,
                      cy = i % 2 ? 330 : 220;
                    return (
                      <g key={x.id}>
                        {x.materials.map((m, j) => {
                          const a = j * 2.1 - 1.7 + i * 0.7,
                            mx = cx + Math.cos(a) * 120,
                            my = cy + Math.sin(a) * 130;
                          return (
                            <g key={m.id}>
                              <line
                                x1={cx}
                                y1={cy}
                                x2={mx}
                                y2={my}
                                stroke={p?.id === x.id ? "#b295f7" : "#4c5261"}
                                strokeWidth="1.5"
                              />
                              <g
                                role="button"
                                tabIndex={0}
                                aria-label={`기록 ${m.title}`}
                                onClick={() => ctx.openMaterial(m)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    ctx.openMaterial(m);
                                }}
                              >
                                <circle
                                  cx={mx}
                                  cy={my}
                                  r="6"
                                  fill={p?.id === x.id ? "#bba0ff" : "#727887"}
                                />
                                <text
                                  x={mx + 10}
                                  y={my + 4}
                                  fill="#cdd0dc"
                                  fontSize="10"
                                >
                                  {m.title.replace(/\.(pdf|jpg)/, "")}
                                </text>
                              </g>
                            </g>
                          );
                        })}
                        {projects
                          .slice(i + 1)
                          .filter((y) =>
                            y.interests.some((t) => x.interests.includes(t)),
                          )
                          .map((y) => {
                            const yi = projects.indexOf(y);
                            return (
                              <line
                                key={y.id}
                                x1={cx}
                                y1={cy}
                                x2={200 + yi * 180}
                                y2={yi % 2 ? 330 : 220}
                                stroke="#8264c4"
                                strokeDasharray="5 5"
                                opacity=".6"
                              />
                            );
                          })}
                        <g
                          role="button"
                          tabIndex={0}
                          aria-label={`경험 ${x.title}`}
                          onClick={() => setSelected(x.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              setSelected(x.id);
                          }}
                        >
                          {p?.id === x.id && (
                            <>
                              <circle
                                cx={cx}
                                cy={cy}
                                r="22"
                                fill="#9d76ff"
                                filter="url(#glow)"
                              />
                              <circle
                                cx={cx}
                                cy={cy}
                                r="15"
                                fill="none"
                                stroke="#d7c7ff"
                                strokeWidth="2"
                              />
                            </>
                          )}
                          <circle cx={cx} cy={cy} r="11" fill="url(#node)" />
                          <rect
                            x={cx + 19}
                            y={cy - 12}
                            width="125"
                            height="25"
                            rx="12"
                            fill="#3c345c"
                          />
                          <text
                            x={cx + 27}
                            y={cy + 4}
                            fill="#ece5ff"
                            fontSize="10"
                          >
                            {x.title.replace(" 프로젝트", "")}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="zoom">
                <button
                  aria-label="그래프 확대"
                  onClick={() => setZoom(Math.min(1.8, zoom + 0.2))}
                >
                  <Plus size={16} />
                </button>
                <button
                  aria-label="그래프 축소"
                  onClick={() => setZoom(Math.max(0.6, zoom - 0.2))}
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>
            <div className="graph-legend">
              <span>
                <i /> 경험
              </span>
              <span>
                <i /> 기록
              </span>
              <span>― 연결된 근거</span>
              <span>┄ 공통 관심사 (데모)</span>
            </div>
            <div className="experience-list" aria-label="경험 목록">
              {projects.map((x) => (
                <button
                  className={`button mini ${p?.id === x.id ? "chosen" : ""}`}
                  key={x.id}
                  onClick={() => setSelected(x.id)}
                >
                  {x.title}
                </button>
              ))}
            </div>
            <Notice>
              데모 연결은 등록된 자료와 관심사에 기반합니다. 실제 AI 관계 판정이
              아닙니다.
            </Notice>
          </Card>
          <Card className="experience-detail">
            <span className="eyebrow">선택한 경험</span>
            <h2>{p?.title.replace(" 프로젝트", "")}</h2>
            <p className="detail-description">{p?.description}</p>
            <h4>내 역할</h4>
            <p className="body-text">{p?.role || "미확인"}</p>
            <h4>연결된 기록</h4>
            {p?.materials.map((m) => (
              <button
                className="reference"
                key={m.id}
                onClick={() => ctx.openMaterial(m)}
              >
                <FileText size={16} />
                {m.title}
                <ChevronRight size={14} />
              </button>
            ))}
            <h4>연결 이유</h4>
            <p className="body-text">
              이 프로젝트에 학생이 직접 등록한 자료입니다.{" "}
              {p?.interests.length
                ? `관심사: ${p.interests.join(" · ")}`
                : "관심사 미확인"}
            </p>
            <button className="suggestion" onClick={() => ctx.go("projects")}>
              <FileText size={22} />
              <span>
                <strong>이 경험을 더 풍부하게 만들어보세요.</strong>
                <small>
                  관련 기록을 추가하거나,
                  <br />
                  다른 경험과의 연결을 찾아보세요.
                </small>
              </span>
              <ChevronRight size={15} />
            </button>
            <Quote />
          </Card>
        </div>
      ) : (
        <div className="patterns-grid">
          <Card>
            <h2>반복 관심사</h2>
            <p className="muted">여러 프로젝트에 함께 나타난 주제예요.</p>
            <div className="interest-chips">
              {interests.map((x) => (
                <button
                  key={x}
                  className={x === interest ? "active" : ""}
                  onClick={() => setInterest(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="purple small">
              선택한 관심사와 연결된 경험 {related.length}개
            </p>
            <div className="pattern-block">
              <h2>활동 패턴</h2>
              <p className="muted">비슷한 문제 해결 흐름이 나타나요.</p>
              {related.some(
                (p) =>
                  p.process.includes("관찰") ||
                  p.role.includes("관찰") ||
                  p.role.includes("조사"),
              ) ? (
                <>
                  <div className="pattern-flow">
                    <span>관찰</span>
                    <ChevronRight size={16} />
                    <span>문제 정리</span>
                    <ChevronRight size={16} />
                    <span>개선안</span>
                  </div>
                  <p>
                    데모 예시: 현장을 살피고, 불편을 정리해 개선안으로
                    연결했어요.
                  </p>
                </>
              ) : (
                <Empty title="공통 활동 흐름 미확인" />
              )}
            </div>
            <Notice>
              AI의 해석은 내 기록을 보고 수정할 수 있어요. 현재는 데모
              예시입니다.
            </Notice>
          </Card>
          <Card>
            <div className="row">
              <h2>이렇게 연결했어요</h2>
              <span className="badge">데모 해석</span>
            </div>
            {related.map((x) => (
              <div className="related" key={x.id}>
                <h3>
                  <Network size={19} /> {x.title}
                </h3>
                <p>{x.description}</p>
                <div className="reference-links">
                  {x.materials.map((m) => (
                    <button key={m.id} onClick={() => ctx.openMaterial(m)}>
                      <FileText size={12} />
                      {m.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!related.length && <Empty title="관련 경험이 없어요" />}
            <button
              className="button primary full"
              onClick={() => {
                setSelected(related[0]?.id || selected);
                setTab("경험 그래프");
              }}
            >
              관련 경험 그래프로 보기 <ChevronRight size={16} />
            </button>
          </Card>
        </div>
      )}
    </>
  );
}
