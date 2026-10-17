"use client";

import { useState } from "react";
import type {
  Answer,
  AnswerNumber,
  CoachResult,
  Element,
  LessonResult,
  Task,
  WithDemo,
} from "@/lib/schema";
import { parseTags, stripTags } from "@/lib/tags";
import { Storefront } from "@/components/Storefront";

// ---------- Content ----------

const TASKS: { id: Exclude<Task, "custom">; title: string; brief: string }[] = [
  {
    id: "review",
    title: "Reply to a review",
    brief: 'Reply to this 1-star review: "Waited 20 minutes for one coffee. Never again."',
  },
  { id: "post", title: "Instagram post", brief: "Write an Instagram post about our new cake." },
  { id: "job", title: "Job ad", brief: "Write a job ad for a part-time barista." },
];

const STEPS = ["Task", "Onboard", "Compare", "Note"] as const;

const ANSWER_STYLE: Record<AnswerNumber, { chip: string; text: string }> = {
  1: { chip: "bg-a1-bg text-a1", text: "text-a1" },
  2: { chip: "bg-a2-bg text-a2", text: "text-a2" },
  3: { chip: "bg-a3-bg text-a3", text: "text-a3" },
};

const ESSENTIALS: { id: Element; title: string; text: string }[] = [
  { id: "what", title: "What", text: "The product, offer or situation" },
  { id: "who", title: "Who", text: "Your guests and their language" },
  { id: "tone", title: "Tone", text: "How your shop sounds" },
  { id: "goal", title: "Goal", text: "What people should do next" },
];

const COPY_LABEL: Record<Task, string> = {
  review: "Copy reply",
  post: "Copy post",
  job: "Copy ad",
  custom: "Copy text",
};

const GENERIC_ERROR = "Something went wrong. Try again.";

// ---------- API ----------

class FriendlyError extends Error {}

async function generate<T>(body: Record<string, unknown>): Promise<WithDemo<T>> {
  let res: Response;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FriendlyError(GENERIC_ERROR);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new FriendlyError(data?.error || GENERIC_ERROR);
  return data;
}

function errorText(err: unknown): string {
  return err instanceof FriendlyError ? err.message : GENERIC_ERROR;
}

// Warn (never block) when the message looks like it contains an email address or phone number.
function hasPersonalData(text: string): boolean {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text) || /\+?\d[\d\s()\/-]{7,}\d/.test(text);
}

function detectTask(brief: string): Task {
  return TASKS.find((t) => t.brief === brief.trim())?.id ?? "custom";
}

// ---------- Page ----------

type Step = 0 | 1 | 2 | 3;

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [brief, setBrief] = useState(TASKS[0].brief);
  const [task, setTask] = useState<Task>("review");
  const [v1, setV1] = useState<WithDemo<{ output: string }> | null>(null);
  const [coach, setCoach] = useState<WithDemo<CoachResult> | null>(null);
  const [answerText, setAnswerText] = useState<Record<AnswerNumber, string>>({ 1: "", 2: "", 3: "" });
  const [v2, setV2] = useState<WithDemo<{ output: string }> | null>(null);
  const [lesson, setLesson] = useState<WithDemo<LessonResult> | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<{ text: string; retry: () => void } | null>(null);
  const [lessonError, setLessonError] = useState(false);

  const answers: Answer[] = (coach?.questions ?? [])
    .map((q) => ({ n: q.n, question: q.question, answer: answerText[q.n].trim() }))
    .filter((a) => a.answer);

  async function sendFirst() {
    setError(null);
    setLoading("Reading your message…");
    const t = detectTask(brief);
    try {
      const [intern, coachRes] = await Promise.all([
        generate<{ output: string }>({ mode: "intern", task: t, brief }),
        generate<CoachResult>({ mode: "coach", task: t, brief }),
      ]);
      setTask(t);
      setV1(intern);
      setCoach(coachRes);
      setAnswerText({ 1: "", 2: "", 3: "" });
      setV2(null);
      setLesson(null);
      setStep(1);
    } catch (err) {
      setError({ text: errorText(err), retry: sendFirst });
    } finally {
      setLoading(null);
    }
  }

  async function loadLesson(outputV2: string) {
    if (!v1) return;
    setLessonError(false);
    try {
      const res = await generate<LessonResult>({
        mode: "lesson",
        task,
        brief,
        answers,
        outputV1: stripTags(v1.output),
        outputV2: stripTags(outputV2),
      });
      setLesson(res);
    } catch {
      setLessonError(true);
    }
  }

  async function sendAgain() {
    setError(null);
    setLoading("Your AI intern is writing…");
    try {
      const res = await generate<{ output: string }>({ mode: "intern", task, brief, answers });
      setV2(res);
      setLesson(null);
      setStep(2);
      // The lesson loads while the owner looks at the compare screen.
      void loadLesson(res.output);
    } catch (err) {
      setError({ text: errorText(err), retry: sendAgain });
    } finally {
      setLoading(null);
    }
  }

  function reset() {
    setStep(0);
    setV1(null);
    setCoach(null);
    setV2(null);
    setLesson(null);
    setError(null);
    window.scrollTo({ top: 0 });
  }

  function goTo(s: Step) {
    setError(null);
    setStep(s);
    window.scrollTo({ top: 0 });
  }

  // Learning meter: what the first message had, plus what the answers added (unique, max 4).
  const noteElements = [
    ...new Set([
      ...(coach?.covered ?? []),
      ...(coach?.questions ?? []).filter((q) => answerText[q.n].trim()).map((q) => q.element),
    ]),
  ];

  const reached: Step = lesson ? 3 : v2 ? 2 : coach ? 1 : 0;
  const isDemo = [v1, coach, v2, lesson].slice(0, step + 1).some((r) => r?.demo);

  if (!opened) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-[480px] px-4 pb-16 pt-4">
        <Welcome onOpen={() => setOpened(true)} />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[480px] px-4 pb-16 pt-4">
      <StepBar step={step} reached={reached} onGo={goTo} />
      {isDemo && (
        <p className="mb-3 inline-block rounded-full border border-line bg-white px-2.5 py-0.5 text-xs text-muted">
          demo data
        </p>
      )}

      {step === 0 && (
        <TaskStep
          brief={brief}
          setBrief={setBrief}
          onSend={sendFirst}
          loading={loading}
        />
      )}

      {step === 1 && v1 && coach && (
        <OnboardStep
          task={task}
          brief={brief}
          v1={v1.output}
          coach={coach}
          answerText={answerText}
          setAnswer={(n, value) => setAnswerText((prev) => ({ ...prev, [n]: value }))}
          onExamples={() =>
            setAnswerText({
              1: coach.questions[0]?.suggestions[0] ?? "",
              2: coach.questions[1]?.suggestions[0] ?? "",
              3: coach.questions[2]?.suggestions[0] ?? "",
            })
          }
          canSend={answers.length > 0}
          onSend={sendAgain}
          loading={loading}
        />
      )}

      {step === 2 && v1 && v2 && (
        <CompareStep
          task={task}
          v1={v1.output}
          v2={v2.output}
          answers={answers}
          lesson={lesson}
          lessonError={lessonError}
          onRetryLesson={() => loadLesson(v2.output)}
          onNext={() => goTo(3)}
        />
      )}

      {step === 3 && lesson && coach && (
        <NoteStep lesson={lesson} covered={coach.covered} noteElements={noteElements} onReset={reset} />
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-2xl border border-line bg-white p-4">
          <p className="text-sm">{error.text}</p>
          <button
            onClick={error.retry}
            className="mt-3 min-h-11 rounded-xl border border-accent px-4 font-semibold text-accent"
          >
            Try again
          </button>
        </div>
      )}
    </main>
  );
}

// ---------- Shared pieces ----------

function StepBar({ step, reached, onGo }: { step: Step; reached: Step; onGo: (s: Step) => void }) {
  return (
    <nav aria-label="Steps" className="mb-5 grid grid-cols-4 gap-1.5">
      {STEPS.map((label, i) => {
        const s = i as Step;
        const active = s === step;
        const enabled = s <= reached && !active;
        return (
          <button
            key={label}
            disabled={!enabled}
            onClick={() => onGo(s)}
            aria-current={active ? "step" : undefined}
            className="flex min-h-11 flex-col items-stretch gap-1.5 text-left disabled:cursor-default"
          >
            <span className={`h-2 rounded-full border-[1.5px] border-ink ${s <= step ? "bg-go" : "bg-white"}`} />
            <span className={`text-xs ${active ? "font-semibold text-ink" : "text-muted"}`}>
              {i + 1}. {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function InternBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white"
      >
        AI
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-5 min-h-14 w-full rounded-[18px] border-[3px] border-ink bg-go px-4 font-display text-[19px] text-ink shadow-[0_4px_0_var(--color-ink)] disabled:opacity-50"
    >
      {children}
    </button>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without the async clipboard API.
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    el.remove();
    return ok;
  }
}

function CopyButton({ label, text, className = "" }: { label: string; text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function onCopy() {
    setState((await copyText(text)) ? "copied" : "failed");
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button
      onClick={onCopy}
      className={`min-h-11 rounded-xl border border-accent px-4 text-sm font-semibold text-accent ${className}`}
    >
      {state === "copied" ? "Copied ✓" : state === "failed" ? "Couldn't copy" : label}
    </button>
  );
}

function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function onShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My onboarding note", text });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // the owner closed the share sheet
      }
    }
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  return (
    <button
      onClick={onShare}
      className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink"
    >
      {copied ? "Copied ✓" : "Share"}
    </button>
  );
}

function NumberBadge({ n, className = "" }: { n: AnswerNumber; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${ANSWER_STYLE[n].chip} ${className}`}
    >
      {n}
    </span>
  );
}

/** Renders the AI intern's text with each <aN> span in answer N's colour and a superscript N. */
function TaggedText({ text }: { text: string }) {
  const segments = parseTags(text);
  if (!segments) return <p className="whitespace-pre-line">{stripTags(text)}</p>;
  return (
    <p className="whitespace-pre-line">
      {segments.map((s, i) =>
        s.n ? (
          <span key={i} className={`rounded px-0.5 box-decoration-clone ${ANSWER_STYLE[s.n].chip}`}>
            {s.text}
            <sup className="ml-0.5 text-[10px] font-bold">{s.n}</sup>
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}

/** The quoted review inside the message, if there is one. */
function quotedText(brief: string): string | null {
  const m = brief.match(/["“„]([^"”“]+)["”“]/);
  return m ? m[1] : null;
}

/** Output in the style of the task: a review reply, a social post or a plain card. */
function OutputCard({ task, brief, children }: { task: Task; brief: string; children: React.ReactNode }) {
  if (task === "review") {
    const review = quotedText(brief);
    return (
      <div className="rounded-2xl border border-line bg-white p-4">
        {review && (
          <div className="mb-3 border-b border-line pb-3">
            <p className="text-sm tracking-wide text-[#E3A008]" aria-label="1 of 5 stars">
              ★<span className="text-line">★★★★</span>
            </p>
            <p className="mt-1 text-[15px]">{review}</p>
            <p className="mt-1 text-xs text-muted">A guest · 2 days ago</p>
          </div>
        )}
        <p className="mb-1 text-xs font-semibold text-muted">Reply from the owner</p>
        <div className="text-[15px] leading-relaxed">{children}</div>
      </div>
    );
  }
  if (task === "post") {
    return (
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center gap-2 p-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-a3-bg text-xs font-bold text-a3">
            YS
          </span>
          <span className="text-sm font-semibold">your.shop</span>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center bg-page text-sm text-muted">Photo</div>
        <div className="p-3 text-[15px] leading-relaxed">{children}</div>
      </div>
    );
  }
  return <div className="rounded-2xl border border-line bg-white p-4 text-[15px] leading-relaxed">{children}</div>;
}

// ---------- Welcome ----------

/** "kiezcafe.example" -> "Kiezcafe". Only used for the sign; the website is not read yet. */
function nameFromWebsite(site: string): string {
  const host = site.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/.]/)[0];
  return host ? host.charAt(0).toUpperCase() + host.slice(1, 18) : "";
}

function Welcome({ onOpen }: { onOpen: () => void }) {
  const [site, setSite] = useState("");
  return (
    <section>
      <div className="overflow-hidden rounded-[26px] border-[3px] border-ink bg-white shadow-[0_6px_0_var(--color-ink)]">
        <div className="border-b-[3px] border-ink bg-[#D3E6EE]">
          <Storefront name={nameFromWebsite(site) || "Your café here"} />
        </div>
        <div className="p-5">
          <h1 className="text-[34px] leading-[1.1]">
            Your business.
            <br />
            Your AI intern.
          </h1>
          <p className="mt-2 text-muted">
            Onboard your AI intern on a real task, like you would a new barista. Every task you finish is real work done.
          </p>
          <label htmlFor="site" className="mt-5 block text-sm font-semibold">
            Your café&apos;s website
          </label>
          <input
            id="site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            placeholder="kiezcafe.example"
            inputMode="url"
            className="mt-2 min-h-12 w-full rounded-2xl border-[3px] border-ink bg-white px-4 text-base outline-none placeholder:text-muted/70"
          />
          <PrimaryButton onClick={onOpen}>Open my café</PrimaryButton>
          <button
            onClick={() => {
              setSite("kiezcafe.example");
              onOpen();
            }}
            className="mt-3 min-h-11 text-sm font-semibold underline underline-offset-2"
          >
            Try the demo café
          </button>
        </div>
      </div>
      <p className="mt-5 rounded-2xl border-2 border-dashed border-muted/60 bg-white/70 px-4 py-3 text-sm text-ink">
        <strong>Nothing gets posted for you.</strong> Your AI intern writes drafts; you decide what to copy. Never paste
        customer names or personal data.
      </p>
    </section>
  );
}

// ---------- Step 1: Task ----------

function TaskStep({
  brief,
  setBrief,
  onSend,
  loading,
}: {
  brief: string;
  setBrief: (v: string) => void;
  onSend: () => void;
  loading: string | null;
}) {
  const selected = detectTask(brief);
  return (
    <section>
      <h1 className="text-[28px] font-bold leading-tight">Meet your AI intern.</h1>
      <p className="mt-2 text-muted">Get today&apos;s task done in 3 minutes. Your AI intern learns your shop as you go.</p>

      <div className="mt-5">
        <InternBubble>Hi, I&apos;m new here. I&apos;m fast, but I don&apos;t know your shop yet. What should I do first?</InternBubble>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {TASKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setBrief(t.brief)}
            aria-pressed={selected === t.id}
            className={`min-h-16 rounded-2xl border bg-white p-3 text-left text-sm font-semibold ${
              selected === t.id ? "border-accent ring-2 ring-accent/20" : "border-line"
            }`}
          >
            {t.title}
          </button>
        ))}
      </div>

      <label htmlFor="brief" className="mt-5 block text-sm font-semibold">
        Your message to the AI intern
      </label>
      <textarea
        id="brief"
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        rows={4}
        className="mt-2 w-full rounded-2xl border border-line bg-white p-3 text-base outline-none focus:border-accent"
      />
      <p className="mt-1 text-xs text-muted">Never paste customer names or personal data.</p>

      {hasPersonalData(brief) && (
        <p role="status" className="mt-4 rounded-xl border border-a3/30 bg-a3-bg px-3 py-2 text-sm text-a3">
          This looks like it contains an email address or phone number. Please remove personal data before sending.
        </p>
      )}

      <PrimaryButton onClick={onSend} disabled={!!loading || !brief.trim()}>
        {loading ?? "Send to AI intern"}
      </PrimaryButton>
    </section>
  );
}

// ---------- Step 2: Onboard ----------

function OnboardStep({
  task,
  brief,
  v1,
  coach,
  answerText,
  setAnswer,
  onExamples,
  canSend,
  onSend,
  loading,
}: {
  task: Task;
  brief: string;
  v1: string;
  coach: CoachResult;
  answerText: Record<AnswerNumber, string>;
  setAnswer: (n: AnswerNumber, value: string) => void;
  onExamples: () => void;
  canSend: boolean;
  onSend: () => void;
  loading: string | null;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted">Your AI intern&apos;s first try</h2>
      <div className="mt-2">
        <OutputCard task={task} brief={brief}>
          <p className="whitespace-pre-line">{stripTags(v1)}</p>
        </OutputCard>
      </div>
      <p className="mt-3 text-sm text-muted">
        Generic, right? That&apos;s not your AI intern&apos;s fault. Nobody told them about your shop yet.
      </p>

      <div className="mt-6 rounded-[18px] border border-line bg-white p-4">
        <h2 className="text-xl font-bold">Onboard your AI intern</h2>
        <p className="mt-1 text-sm text-muted">A new employee needs to know a few things about your shop. So does AI.</p>
        <p className="mt-3 text-[15px]">{coach.feedback}</p>

        <div className="mt-4 space-y-4">
          {coach.questions.map((q) => (
            <div key={q.n}>
              <label htmlFor={`a${q.n}`} className="flex items-center gap-2 text-[15px] font-semibold">
                <NumberBadge n={q.n} />
                {q.question}
              </label>
              <input
                id={`a${q.n}`}
                value={answerText[q.n]}
                onChange={(e) => setAnswer(q.n, e.target.value)}
                placeholder={q.suggestions[0]}
                className={`mt-2 min-h-11 w-full rounded-xl border-2 px-3 text-base outline-none ${ANSWER_STYLE[q.n].chip} border-transparent placeholder:opacity-50 focus:border-current`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {q.suggestions.map((s) => {
                  const picked = answerText[q.n] === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setAnswer(q.n, s)}
                      aria-pressed={picked}
                      className={`min-h-11 rounded-full border px-3 py-1.5 text-left text-sm ${
                        picked ? `${ANSWER_STYLE[q.n].chip} border-current font-semibold` : "border-line bg-white text-muted"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button onClick={onExamples} className="mt-4 min-h-11 text-sm font-semibold text-accent underline underline-offset-2">
          Use example answers
        </button>
      </div>

      <PrimaryButton onClick={onSend} disabled={!!loading || !canSend}>
        {loading ?? "Send again with these answers"}
      </PrimaryButton>
    </section>
  );
}

// ---------- Step 3: Compare ----------

function CompareStep({
  task,
  v1,
  v2,
  answers,
  lesson,
  lessonError,
  onRetryLesson,
  onNext,
}: {
  task: Task;
  v1: string;
  v2: string;
  answers: Answer[];
  lesson: LessonResult | null;
  lessonError: boolean;
  onRetryLesson: () => void;
  onNext: () => void;
}) {
  return (
    <section>
      <h1 className="text-[26px] font-bold leading-tight">Same AI intern. Three answers later.</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {answers.map((a) => (
          <span key={a.n} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${ANSWER_STYLE[a.n].chip}`}>
            <span className="font-bold">{a.n}</span>
            {a.answer}
          </span>
        ))}
      </div>

      <h2 className="mt-5 text-sm font-semibold text-muted">Before onboarding</h2>
      <div className="mt-2 rounded-2xl border border-line bg-white/60 p-3 text-sm leading-relaxed text-muted">
        <p className="whitespace-pre-line">{stripTags(v1)}</p>
      </div>

      <h2 className="mt-5 text-sm font-semibold text-accent">After onboarding</h2>
      <div className="mt-2 rounded-2xl border-2 border-accent bg-white p-4 text-[15px] leading-relaxed">
        <TaggedText text={v2} />
        <CopyButton label={COPY_LABEL[task]} text={stripTags(v2)} className="mt-3" />
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">What changed</h2>
        {lesson ? (
          <ul className="mt-3 space-y-2.5">
            {lesson.whatChanged.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px]">
                <NumberBadge n={w.n} className="mt-0.5" />
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
        ) : lessonError ? (
          <div className="mt-2">
            <p className="text-sm">{GENERIC_ERROR}</p>
            <button onClick={onRetryLesson} className="mt-2 min-h-11 rounded-xl border border-accent px-4 font-semibold text-accent">
              Try again
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Your AI intern is writing…</p>
        )}
      </div>

      <PrimaryButton onClick={onNext} disabled={!lesson}>
        Get your onboarding note
      </PrimaryButton>
    </section>
  );
}

// ---------- Step 4: Note ----------

/** Highlights the [blanks] the owner fills in each time. */
function BracketText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-line">
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <mark key={i} className="rounded bg-accent/10 px-0.5 font-semibold text-accent">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

function LearningMeter({ covered, noteElements }: { covered: Element[]; noteElements: Element[] }) {
  return (
    <div className="rounded-[18px] border border-line bg-white p-4">
      <div className="grid grid-cols-4 gap-1.5">
        {ESSENTIALS.map((e) => {
          const inNote = noteElements.includes(e.id);
          return (
            <span
              key={e.id}
              className={`flex min-h-9 items-center justify-center rounded-full text-sm font-semibold ${
                inNote ? "bg-accent text-white" : "border border-line text-muted"
              }`}
            >
              {inNote ? "✓ " : ""}
              {e.title}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">
        Your first message covered <strong>{covered.length} of 4</strong> things a new employee needs. Your note
        covers <strong className="text-accent">{noteElements.length} of 4</strong>.
      </p>
    </div>
  );
}

function NoteStep({
  lesson,
  covered,
  noteElements,
  onReset,
}: {
  lesson: LessonResult;
  covered: Element[];
  noteElements: Element[];
  onReset: () => void;
}) {
  return (
    <section>
      <LearningMeter covered={covered} noteElements={noteElements} />

      <h1 className="mt-6 text-[26px] font-bold leading-tight">Your onboarding note</h1>
      <p className="mt-2 text-muted">Paste it into any AI chat next time. Fill in the parts in brackets.</p>

      <div className="mt-4 rounded-[18px] border-2 border-accent bg-white p-4 text-[15px] leading-relaxed">
        <BracketText text={lesson.improvedBrief} />
        <div className="mt-3 flex gap-2">
          <CopyButton label="Copy note" text={lesson.improvedBrief} />
          <ShareButton text={lesson.improvedBrief} />
        </div>
      </div>

      <h2 className="mt-6 font-bold">What a new employee needs to know</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {ESSENTIALS.map((e) => (
          <div key={e.id} className="rounded-2xl border border-line bg-white p-3">
            <p className="font-semibold">{e.title}</p>
            <p className="mt-0.5 text-sm text-muted">{e.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <InternBubble>{lesson.takeaway}</InternBubble>
      </div>

      <button
        onClick={onReset}
        className="mt-6 min-h-12 w-full rounded-2xl border border-line bg-white px-4 font-semibold text-ink"
      >
        Try another task
      </button>
    </section>
  );
}
