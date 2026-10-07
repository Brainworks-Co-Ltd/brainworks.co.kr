import type { ReactNode } from "react";
import { CircleCheck, Inbox } from "lucide-react";

/* 관리자 화면 공용 스타일. 공개 화면과 같은 토큰(잉크, 골드, 4px 모서리)을 쓴다. */

export const inputClass =
  "min-h-11 w-full rounded-[var(--bw-radius-control)] border border-slate-300 bg-white px-3 text-[var(--bw-color-ink)] placeholder:text-slate-400 focus:border-[var(--bw-color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--bw-color-ink)]/15 disabled:bg-slate-50";

export const textareaClass =
  "w-full rounded-[var(--bw-radius-control)] border border-slate-300 bg-white px-3 py-2 leading-6 text-[var(--bw-color-ink)] placeholder:text-slate-400 focus:border-[var(--bw-color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--bw-color-ink)]/15";

const buttonBase =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--bw-radius-control)] px-5 text-sm font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--bw-color-brand)]/50 disabled:pointer-events-none disabled:opacity-50";

/** 저장, 새 글처럼 화면의 으뜸 동작. 잉크 바탕. */
export const primaryButtonClass = `${buttonBase} bg-[var(--bw-color-ink)] text-white hover:bg-[var(--bw-color-black)]`;

/** 게시처럼 공개에 영향을 주는 동작. 골드 바탕. */
export const brandButtonClass = `${buttonBase} bg-[var(--bw-accent,#5b63d3)] text-white hover:bg-[var(--bw-accent-text,#4a55c6)]`;

/** 목록으로, 미리보기처럼 되돌릴 수 있는 동작. 잉크 테두리. */
export const secondaryButtonClass = `${buttonBase} border border-[var(--bw-color-ink)] bg-white text-[var(--bw-color-ink)] hover:bg-slate-100`;

/** 보관, 게시 중단처럼 공개에서 내리는 동작. */
export const dangerButtonClass = `${buttonBase} border border-red-200 bg-white text-red-700 hover:bg-red-50`;

export const cardClass =
  "rounded-[var(--bw-radius-card)] border border-[var(--bw-color-line)] bg-white p-6";

export const cardTitleClass = "text-lg font-semibold tracking-[-0.02em]";

/** 라벨, 입력, 도움말을 한 덩어리로 묶는다. content-start로 옆 칸 높이에 맞춰 입력이 늘어나는 일을 막는다. */
export function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid content-start gap-2 text-sm font-medium ${className}`}>
      {label}
      {children}
      {hint ? (
        <span className="text-xs font-normal leading-5 text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

const badgeTone: Record<string, string> = {
  LIVE: "bg-emerald-700 text-white",
  PUBLISHED: "bg-emerald-700 text-white",
  SCHEDULED: "bg-sky-700 text-white",
  DRAFT: "bg-amber-100 text-amber-900",
  ENDED: "bg-slate-200 text-slate-700",
  HIDDEN: "bg-slate-200 text-slate-700",
  UNPUBLISHED: "bg-slate-200 text-slate-700",
  ARCHIVED: "bg-slate-800 text-white",
};

/** 상태 뱃지. 색만으로 구분하지 않도록 글자를 함께 쓴다. */
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[var(--bw-radius-control)] px-2 py-0.5 text-xs font-semibold ${badgeTone[status] || "bg-slate-100 text-slate-700"}`}
    >
      {label}
    </span>
  );
}

/*
 * 현황 화면(운영 현황, 성능) 부품.
 * 위계. 페이지 제목 > 열 제목(굵은 글자와 잉크 선) > 패널 제목(18px) >
 * 항목 제목(15px 잉크) > 보조 정보(13px 회색). 안내 문장은 13px 회색으로만 쓰고,
 * 비어 있다는 상태는 패널마다 콜아웃 하나로만 말한다.
 */

// 서버와 브라우저가 같은 글자를 그리도록 시간대를 고정한다.
const dateTimeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value: string) {
  return dateTimeFormat.format(new Date(value));
}

export const listClass =
  "divide-y divide-[var(--bw-color-line)] border-y border-[var(--bw-color-line)]";

export function Panel({
  id,
  title,
  count,
  note,
  children,
}: {
  id: string;
  title: string;
  count?: ReactNode;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={`${cardClass} min-w-0`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={id} className="text-lg font-semibold tracking-[-0.02em]">
          {title}
        </h3>
        {count}
      </div>
      {note ? (
        <p className="mt-1 text-[13px] leading-5 text-slate-500">{note}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** 비어 있음, 할 일 없음 같은 상태 문장. 노션 콜아웃처럼 면과 아이콘으로 안내 문장과 구분한다. */
export function Callout({
  tone = "empty",
  children,
}: {
  tone?: "empty" | "ok";
  children: ReactNode;
}) {
  const ok = tone === "ok";
  const Icon = ok ? CircleCheck : Inbox;
  return (
    <p
      className={`flex items-center gap-3 rounded-[var(--bw-radius-control)] px-4 py-3.5 text-[15px] font-semibold ${ok ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-[var(--bw-color-ink)]"}`}
    >
      <Icon
        aria-hidden
        className={`size-5 shrink-0 ${ok ? "text-emerald-700" : "text-slate-500"}`}
      />
      {children}
    </p>
  );
}

export function Column({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="grid min-w-0 content-start gap-4">
      <h2
        id={id}
        className="border-b-2 border-[var(--bw-color-ink)] pb-2 text-base font-bold text-[var(--bw-color-ink)]"
      >
        {title}
      </h2>
      <div className="grid gap-6">{children}</div>
    </section>
  );
}
