"use client";
import { useEffect, useRef } from "react";
import {
  Sprout,
  X,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { fields, recordState, type Project, type Material } from "@/lib/data";
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Empty({
  title = "아직 등록된 자료가 없어요",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Sprout size={32} />
      <h3>{title}</h3>
      <p>{children || "기존에 작성한 자료에서 시작해 보세요."}</p>
    </div>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <AlertCircle size={15} />
      <span>{children}</span>
    </div>
  );
}
export function Checks({ project }: { project: Project }) {
  const state = recordState(project);
  return (
    <div className="checks">
      {fields.map((f) => (
        <span
          key={f}
          className={state[f] ? "verified" : "unverified"}
          title={`${f}: ${state[f] ? "기록 있음" : "미확인"}`}
        >
          {state[f] ? "✓" : "−"} {f}
          {!state[f] && <small> 미확인</small>}
        </span>
      ))}
    </div>
  );
}
export function MaterialIcon({ material }: { material: Material }) {
  const Icon =
    material.kind === "link"
      ? LinkIcon
      : material.title.endsWith(".jpg") || material.title.endsWith(".png")
        ? ImageIcon
        : FileText;
  return <Icon size={20} />;
}
export function Quote() {
  return (
    <div className="quote">
      <span>
        “기록하는 오늘이,
        <br />더 나은 내일을 만듭니다.”
      </span>
      <Sprout size={42} />
    </div>
  );
}
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([disabled]),textarea,select,a[href]",
        ) || [],
      );
    controls()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const items = controls();
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div className="overlay" onClick={close}>
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row">
          <h2>{title}</h2>
          <button className="icon-button" aria-label="닫기" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
