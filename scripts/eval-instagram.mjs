// Eval: does onboarding make the Instagram post better?
// For each brief: get v1 (no answers), the coach's questions, and v2 (answers = first suggestion,
// like tapping "Use example answers"). A separate Claude judge scores v1 and v2 blind, in random order.
// Run: npm run eval   (needs ANTHROPIC_API_KEY in .env and the app running at EVAL_BASE_URL)
import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE_URL = process.env.EVAL_BASE_URL || "https://pomelo-weld.vercel.app";
const JUDGE_MODEL = process.env.JUDGE_MODEL || "claude-opus-5-5";

const BRIEFS = [
  "Write an Instagram post about our new cake.",
  "Write an Instagram post about our new seasonal coffee.",
  "Write an Instagram post saying we have new opening hours.",
  "Write an Instagram post about our breakfast menu.",
  "Write an Instagram post about our terrace opening.",
  "Write an Instagram post about a new sandwich.",
  "Write an Instagram post about our weekend brunch.",
  "Write an Instagram post about a new pastry.",
  "Write an Instagram post thanking our regulars.",
  "Write an Instagram post about our new vegan options.",
];

const client = new Anthropic({ timeout: 120_000, maxRetries: 2 });
const judgeSystem = readFileSync(new URL("../prompts/judge.md", import.meta.url), "utf8");
const strip = (s) => s.replace(/<\/?a[1-3]>/g, "");

async function generate(body) {
  const res = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: "post", ...body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.status);
  if (data.demo) throw new Error("got demo data, not a live answer");
  return data;
}

const scoreSchema = {
  type: "object",
  additionalProperties: false,
  required: ["specific", "voice", "action", "unsupportedClaims"],
  properties: {
    specific: { type: "integer", enum: [1, 2, 3, 4, 5] },
    voice: { type: "integer", enum: [1, 2, 3, 4, 5] },
    action: { type: "integer", enum: [1, 2, 3, 4, 5] },
    unsupportedClaims: { type: "array", items: { type: "string" } },
  },
};
const judgeTool = {
  name: "submit_scores",
  description: "Submit scores for post A and post B and the preferred post.",
  strict: true,
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["A", "B", "preferred"],
    properties: { A: scoreSchema, B: scoreSchema, preferred: { type: "string", enum: ["A", "B", "tie"] } },
  },
};

async function judge(brief, facts, v1, v2) {
  const v2IsA = Math.random() < 0.5;
  const [a, b] = v2IsA ? [v2, v1] : [v1, v2];
  const res = await client.messages.create({
    model: JUDGE_MODEL,
    max_tokens: 4000,
    system: judgeSystem,
    tools: [judgeTool],
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content: `Owner's request:\n${brief}\n\nOwner's facts about the shop:\n${facts || "(none)"}\n\nPost A:\n${a}\n\nPost B:\n${b}\n\nAnswer by calling the submit_scores tool.`,
      },
    ],
  });
  const call = res.content.find((c) => c.type === "tool_use");
  if (!call) throw new Error(`judge did not score (stop_reason: ${res.stop_reason})`);
  const s = call.input;
  const pref = s.preferred === "tie" ? "tie" : (s.preferred === "A") === v2IsA ? "v2" : "v1";
  return { v1: v2IsA ? s.B : s.A, v2: v2IsA ? s.A : s.B, preferred: pref };
}

async function runOne(brief) {
  const [v1, coach] = await Promise.all([generate({ mode: "intern", brief }), generate({ mode: "coach", brief })]);
  const answers = coach.questions.map((q) => ({ n: q.n, question: q.question, answer: q.suggestions[0] }));
  const v2 = await generate({ mode: "intern", brief, answers });
  const facts = answers.map((a) => `- ${a.question} ${a.answer}`).join("\n");
  const scores = await judge(brief, facts, strip(v1.output), strip(v2.output));
  const tagged = new Set([...v2.output.matchAll(/<a([1-3])>/g)].map((m) => m[1])).size;
  return { brief, answers, v1: v1.output, v2: v2.output, answersTagged: tagged, ...scores };
}

const results = [];
const failed = [];
for (const chunk of [BRIEFS.slice(0, 5), BRIEFS.slice(5)]) {
  const settled = await Promise.allSettled(chunk.map(runOne));
  settled.forEach((r, i) =>
    r.status === "fulfilled" ? results.push(r.value) : failed.push({ brief: chunk[i], error: String(r.reason) }),
  );
}

const avg = (k, v) => (results.reduce((sum, r) => sum + r[v][k], 0) / results.length).toFixed(1);
const claims = (v) => results.reduce((sum, r) => sum + r[v].unsupportedClaims.length, 0);
const wins = results.filter((r) => r.preferred === "v2").length;
const allTagged = results.filter((r) => r.answersTagged === 3).length;

const summary = `# Eval: Instagram posts, before and after onboarding

- Briefs: ${results.length} scored${failed.length ? `, ${failed.length} failed` : ""}
- AI intern: the live app (${BASE_URL}). Judge: ${JUDGE_MODEL}, blind, posts shown in random order.
- Answers: the coach's first suggestion for each question (what "Use example answers" does).

| | Before (v1) | After (v2) |
|---|---|---|
| Specific (1 to 5) | ${avg("specific", "v1")} | ${avg("specific", "v2")} |
| Sounds like the shop (1 to 5) | ${avg("voice", "v1")} | ${avg("voice", "v2")} |
| Clear next step (1 to 5) | ${avg("action", "v1")} | ${avg("action", "v2")} |
| Unsupported claims (total) | ${claims("v1")} | ${claims("v2")} |

- Judge preferred the onboarded post in **${wins} of ${results.length}** briefs.
- Every answer showed up as a coloured phrase in **${allTagged} of ${results.length}** onboarded posts.

Limits: one sample per brief, answers written by the coach rather than real owners, and an AI judge. Real owner feedback beats this.
`;

mkdirSync("eval", { recursive: true });
writeFileSync("eval/instagram-results.json", JSON.stringify({ results, failed }, null, 2));
writeFileSync("eval/RESULTS.md", summary);
console.log(summary);
if (failed.length) console.log("Failed:", failed);
