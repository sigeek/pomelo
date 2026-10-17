import { NextResponse } from "next/server";
import { isMockMode, runCoach, runIntern, runLesson } from "@/lib/claude";
import { MOCK_COACH, MOCK_INTERN_V1, MOCK_INTERN_V2, MOCK_LESSON } from "@/lib/mock";
import { takeRequestSlot } from "@/lib/rate-limit";
import type { Answer, AnswerNumber } from "@/lib/schema";
import { stripTags } from "@/lib/tags";

export const runtime = "nodejs";
export const maxDuration = 60;

// Limit for text the owner types (message and each answer).
const MAX_INPUT_CHARS = 4000;
// The AI intern's outputs are sent back for the lesson; allow them to be longer.
const MAX_OUTPUT_CHARS = 8000;

function friendly(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function text(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function parseAnswers(v: unknown): Answer[] | null {
  if (!Array.isArray(v)) return null;
  const answers: Answer[] = [];
  for (const raw of v) {
    const a = raw as Record<string, unknown>;
    if (a?.n !== 1 && a?.n !== 2 && a?.n !== 3) return null;
    const answer = text(a.answer);
    if (!answer) continue; // skip empty answers
    answers.push({ n: a.n as AnswerNumber, question: text(a.question), answer });
  }
  return answers;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return friendly("Something went wrong. Try again.", 400);
  }

  const mode = body.mode;
  const brief = text(body.brief);
  if (mode !== "intern" && mode !== "coach" && mode !== "lesson") {
    return friendly("Something went wrong. Try again.", 400);
  }
  if (!brief) return friendly("Tell your AI intern what to do first.", 400);

  const answers = body.answers === undefined ? undefined : parseAnswers(body.answers);
  if (answers === null) return friendly("Something went wrong. Try again.", 400);

  const typed = [brief, ...(answers ?? []).map((a) => a.answer)];
  if (typed.some((t) => t.length > MAX_INPUT_CHARS)) {
    return friendly(
      `That's a lot for one message. Please keep it under ${MAX_INPUT_CHARS.toLocaleString("en")} characters.`,
      413,
    );
  }

  const outputV1 = stripTags(text(body.outputV1));
  const outputV2 = stripTags(text(body.outputV2));
  if (mode === "lesson") {
    if (!answers?.length || !outputV1 || !outputV2) {
      return friendly("Something went wrong. Try again.", 400);
    }
    if (outputV1.length > MAX_OUTPUT_CHARS || outputV2.length > MAX_OUTPUT_CHARS) {
      return friendly("That text is too long for your AI intern. Try a shorter task.", 413);
    }
  }

  // Demo data for this mode, used in mock mode and as the fallback for live failures.
  const withAnswers = !!answers?.length;
  const mock =
    mode === "coach" ? MOCK_COACH : mode === "lesson" ? MOCK_LESSON : withAnswers ? MOCK_INTERN_V2 : MOCK_INTERN_V1;

  if (isMockMode()) return NextResponse.json({ ...mock, demo: true });

  if (!takeRequestSlot()) {
    return friendly(
      "Your AI intern is very popular right now. Please try again in a little while.",
      429,
    );
  }

  try {
    if (mode === "coach") return NextResponse.json(await runCoach(brief));
    if (mode === "lesson") {
      return NextResponse.json(await runLesson(brief, answers!, outputV1, outputV2));
    }
    return NextResponse.json({ output: await runIntern(brief, answers) });
  } catch (err) {
    console.error(`[generate:${mode}] live call failed, using demo data`, err);
    return NextResponse.json({ ...mock, demo: true });
  }
}
