// Server-only Claude calls for the three roles: AI intern, coach and lesson.
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ELEMENTS,
  type Answer,
  type AnswerNumber,
  type CoachResult,
  type Element,
  type LessonResult,
} from "./schema";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
const MAX_TOKENS = 800;

export function isMockMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY || process.env.MOCK === "1";
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // 30 s per call and no retries: on failure we fall back to demo data instead.
  if (!client) client = new Anthropic({ timeout: 30_000, maxRetries: 0 });
  return client;
}

const prompts = new Map<string, string>();
function loadPrompt(name: "intern" | "coach" | "lesson"): string {
  let text = prompts.get(name);
  if (!text) {
    text = readFileSync(path.join(process.cwd(), "prompts", `${name}.md`), "utf8").trim();
    prompts.set(name, text);
  }
  return text;
}

// These are short, single-shot calls, so skip extended thinking where the model allows it.
// Sonnet 5.5 rejects thinking "disabled"; "between_tools" is its lowest setting.
function thinkingParams(): Partial<Anthropic.MessageCreateParamsNonStreaming> {
  return MODEL === "claude-sonnet-5-5" ? { thinking: { type: "between_tools" } } : {};
}

function formatAnswers(answers: Answer[]): string {
  return answers.map((a) => `${a.n}. ${a.question}\nAnswer ${a.n}: ${a.answer}`).join("\n\n");
}

// ---------- AI intern: plain text ----------

export async function runIntern(brief: string, answers?: Answer[]): Promise<string> {
  let user = `Instruction from the owner:\n${brief}`;
  if (answers?.length) user += `\n\nThe owner's answers:\n${formatAnswers(answers)}`;

  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    ...thinkingParams(),
    system: loadPrompt("intern"),
    messages: [{ role: "user", content: user }],
  });
  const text = res.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n")
    .trim();
  if (!text) throw new Error(`Empty AI intern output (stop_reason: ${res.stop_reason})`);
  return text;
}

// ---------- Structured calls via tool use ----------

// Sonnet 5.5 does not accept a forced tool_choice, so we offer exactly one strict tool,
// ask for it in the message, and treat a missing call as a failure.
async function callTool(
  system: string,
  user: string,
  tool: Anthropic.Tool,
): Promise<unknown> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    ...thinkingParams(),
    system,
    tools: [tool],
    tool_choice: { type: "auto", disable_parallel_tool_use: true },
    messages: [{ role: "user", content: `${user}\n\nAnswer by calling the ${tool.name} tool.` }],
  });
  const block = res.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === tool.name,
  );
  if (!block) throw new Error(`No ${tool.name} call (stop_reason: ${res.stop_reason})`);
  return block.input;
}

const elementSchema = { type: "string", enum: ELEMENTS };
const answerNumberSchema = { type: "integer", enum: [1, 2, 3] };

const coachTool: Anthropic.Tool = {
  name: "onboarding_questions",
  description: "Return which essentials the message covers and 3 onboarding questions.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["feedback", "covered", "questions"],
    properties: {
      feedback: { type: "string" },
      covered: { type: "array", items: elementSchema },
      questions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["n", "element", "question", "suggestions"],
          properties: {
            n: answerNumberSchema,
            element: elementSchema,
            question: { type: "string" },
            suggestions: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  },
};

const lessonTool: Anthropic.Tool = {
  name: "onboarding_note",
  description: "Return the reusable onboarding note, what changed, and a takeaway.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["improvedBrief", "whatChanged", "takeaway"],
    properties: {
      improvedBrief: { type: "string" },
      whatChanged: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["n", "text"],
          properties: { n: answerNumberSchema, text: { type: "string" } },
        },
      },
      takeaway: { type: "string" },
    },
  },
};

export async function runCoach(brief: string): Promise<CoachResult> {
  const input = await callTool(
    loadPrompt("coach"),
    `The owner's message to their new AI intern:\n${brief}`,
    coachTool,
  );
  return validateCoach(input);
}

export async function runLesson(
  brief: string,
  answers: Answer[],
  outputV1: string,
  outputV2: string,
): Promise<LessonResult> {
  const user = [
    `Original message:\n${brief}`,
    `Answers:\n${formatAnswers(answers)}`,
    `First output:\n${outputV1}`,
    `Improved output:\n${outputV2}`,
  ].join("\n\n");
  const input = await callTool(loadPrompt("lesson"), user, lessonTool);
  return validateLesson(input);
}

// ---------- Server-side validation (throws, so the route falls back to demo data) ----------

function str(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) throw new Error(`Invalid ${field}`);
  return v.trim();
}

function answerNumber(v: unknown): AnswerNumber {
  if (v !== 1 && v !== 2 && v !== 3) throw new Error("Invalid answer number");
  return v;
}

export function validateCoach(input: unknown): CoachResult {
  const o = input as Record<string, unknown>;
  const covered = Array.isArray(o?.covered)
    ? [...new Set(o.covered.filter((e): e is Element => ELEMENTS.includes(e as Element)))]
    : [];
  if (!Array.isArray(o?.questions) || o.questions.length !== 3) {
    throw new Error("Coach must return exactly 3 questions");
  }
  const questions = o.questions.map((raw) => {
    const q = raw as Record<string, unknown>;
    if (!ELEMENTS.includes(q.element as Element)) throw new Error("Invalid element");
    const suggestions = Array.isArray(q.suggestions)
      ? q.suggestions.filter((s): s is string => typeof s === "string" && !!s.trim())
      : [];
    if (suggestions.length < 2) throw new Error("Need 2 to 3 suggestions");
    return {
      n: answerNumber(q.n),
      element: q.element as Element,
      question: str(q.question, "question"),
      suggestions: suggestions.slice(0, 3).map((s) => s.trim()),
    };
  });
  if (new Set(questions.map((q) => q.n)).size !== 3) throw new Error("Duplicate question numbers");
  questions.sort((a, b) => a.n - b.n);
  return { feedback: str(o.feedback, "feedback"), covered, questions };
}

export function validateLesson(input: unknown): LessonResult {
  const o = input as Record<string, unknown>;
  if (!Array.isArray(o?.whatChanged) || o.whatChanged.length < 1) {
    throw new Error("Lesson needs whatChanged points");
  }
  const whatChanged = o.whatChanged.slice(0, 3).map((raw) => {
    const w = raw as Record<string, unknown>;
    return { n: answerNumber(w.n), text: str(w.text, "whatChanged.text") };
  });
  return {
    improvedBrief: str(o.improvedBrief, "improvedBrief"),
    whatChanged,
    takeaway: str(o.takeaway, "takeaway"),
  };
}
