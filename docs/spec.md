# AI Intern: build spec (team Pomelo)

Why we build it this way: see `docs/goal.md`. This file says what to build.

## Stack

- Next.js (App Router, TypeScript, Tailwind), deploy on Vercel.
- `@anthropic-ai/sdk`, key from `ANTHROPIC_API_KEY` in `.env` (never committed).
- One page `/`, one API route `POST /api/generate`.
- System prompts in `prompts/intern.md`, `prompts/coach.md`, `prompts/lesson.md`. Demo data in `lib/mock.ts`. Shared types in `lib/schema.ts`.
- No database, no login, no analytics.

## Flow: one page, 4 steps, mobile first

On desktop, center a phone-width column (max 480px). Step bar at the top on every step: Task, Onboard, Compare, Note.

### Step 1: Task
- Title: "Meet your AI intern." Subtitle: "Get today's task done in 3 minutes. Your AI intern learns your shop as you go."
- AI intern bubble: "Hi, I'm new here. I'm fast, but I don't know your shop yet. What should I do first?"
- Three task cards; tapping one fills the textarea:
  - **Reply to a review** (selected by default): `Reply to this 1-star review: "Waited 20 minutes for one coffee. Never again."`
  - **Instagram post:** `Write an Instagram post about our new cake.`
  - **Job ad:** `Write a job ad for a part-time barista.`
- Textarea label: "Your message to the AI intern". Free text works too.
- Privacy line under it: "Never paste customer names or personal data." (P2: if the text contains an email address or phone number, show an inline warning above the button. Warn, don't block.)
- Button "Send to AI intern": calls `intern` (no answers) and `coach` **in parallel**.

### Step 2: Onboard
- "Your AI intern's first try": output v1 rendered in the task's card style (review: the review plus the reply under it; post: a generic social post card with initials avatar and an image placeholder; job ad: a plain card). No real platform branding.
- Note: "Generic, right? That's not your AI intern's fault. Nobody told them about your shop yet."
- Panel title "Onboard your AI intern", subtitle "A new employee needs to know a few things about your shop. So does AI."
- The coach's 3 questions, numbered 1 to 3, each with its own colour. Each has a text input and, under it, 2 to 3 tappable suggestion chips (P1). Tapping a chip fills the input.
- "Use example answers" fills every input with its first suggestion.
- Button "Send again with these answers": calls `intern` with answers (v2), then `lesson`.

### Step 3: Compare (the hero screen of the video)
- Title: "Same AI intern. Three answers later."
- Row of the 3 answers as coloured, numbered chips.
- "Before onboarding": compact, muted card with v1.
- "After onboarding": accent border, v2 with every `<aN>` span shown in answer N's colour plus a small superscript N.
- Copy button on the After card ("Copy reply" / "Copy post" / "Copy ad"), copies v2 without tags (P1).
- "What changed": the lesson's 2 to 3 bullets, each with the number and colour of the answer it came from.
- Button "Get your onboarding note".

### Step 4: Note
- Learning meter at the top (P1): four pills What, Who, Tone, Goal. Text: "Your first message covered X of 4 things a new employee needs. Your note covers Y of 4."
  - X = `coach.covered.length`. Y = elements in `coach.covered` plus the elements of questions with a non-empty answer (unique, max 4).
- Note card: `improvedBrief`, with `[brackets]` highlighted. Buttons "Copy note" (P1) and "Share" (P2, `navigator.share` if available, else copy).
- 2x2 grid: **What** (the product, offer or situation), **Who** (your guests and their language), **Tone** (how your shop sounds), **Goal** (what people should do next).
- AI intern bubble with the lesson's `takeaway`.
- Secondary button "Try another task" resets to step 1.

### UI rules
- English UI. Never the words prompt, model, token, LLM. Always "AI intern", never "intern" alone.
- Not a chat layout. No scores.
- Touch targets at least 44px. Works at 390px width.
- Loading text: "Your AI intern is writing…", "Reading your message…".
- Errors: "Something went wrong. Try again." with a retry button. Never a blank screen.
- Look (matches the design prototype): background `#F3F5F8`, text `#16202C`, secondary text `#4A5563`, accent `#1F4FD1`, cards white with `#E1E5EB` borders, radius 14 to 18px. Answer colours: 1 violet (`#ECE9FD` bg, `#3B2F99` text), 2 teal (`#DDF3EC`, `#0B5844`), 3 orange (`#FDE8DA`, `#8A3B0E`). Font: Plus Jakarta Sans (Google Fonts).

## API: `POST /api/generate`

Body `{ mode, ...payload }`. `Element = "what" | "who" | "tone" | "goal"`.

| mode | payload | response |
|---|---|---|
| `intern` | `{ task, brief, answers?: { n: 1\|2\|3, question, answer }[] }` | `{ output: string }`; with answers, phrases wrapped in `<a1>…</a1>`, `<a2>…</a2>`, `<a3>…</a3>` |
| `coach` | `{ task, brief }` | `{ feedback, covered: Element[], questions: { n: 1\|2\|3, element: Element, question, suggestions: string[] }[] }` (exactly 3 questions, 2 to 3 suggestions each) |
| `lesson` | `{ task, brief, answers, outputV1, outputV2 }` | `{ improvedBrief, whatChanged: { n: 1\|2\|3, text }[], takeaway }` |

- `coach` and `lesson`: forced tool use with a JSON schema, validated on the server.
- `intern`: plain text. Strip tags before copying, before sending to `lesson`, and if tags are malformed render plain text.
- Model from env `CLAUDE_MODEL`, default `claude-sonnet-5-5`. `max_tokens` 800. 30 s timeout.
- **Demo data:** if `ANTHROPIC_API_KEY` is missing or `MOCK=1`, every mode returns the mock below. If a live call fails, return the mock for that mode with `demo: true`; the UI then shows a small "demo data" label. Never present demo data as live.

## System prompts

### `prompts/intern.md`
```
You are a brand-new intern at a small business. Today is your first day.
You are eager and fast, but you know nothing about this business except what is written in the instruction and in any answers the owner gives you.

Rules:
- Do exactly what the instruction asks.
- Do not ask questions.
- Do not invent specific facts such as names, prices, dates, ingredients, locations, opening hours or what happened. If a detail is not given, stay general.
- If the owner gave answers, use every answer at least once.
- If the owner gave answers, wrap each phrase that comes from answer N in <aN>...</aN>, where N is 1, 2 or 3. Use no other markup.
- Keep it short and ready to use.
- Write in the language of the instruction, unless the answers say otherwise.
- Output only the requested text. No preamble, no explanation.
```

### `prompts/coach.md`
```
You are a warm, practical coach who helps small business owners use AI. Many of them have never used AI tools and feel it is not for them.

Your core message: telling an AI what to do is like onboarding a new employee, a skill they already use every day.

A new employee needs four things to do a task well:
- what: the specifics of the product, offer or situation (for a review: what actually happened)
- who: who it is for, and what language they speak
- tone: how the business sounds
- goal: what the owner wants people to do or feel next

Given the owner's message to their new AI intern:
1. covered: list which of the four the message already contains.
2. questions: ask exactly 3 questions about the missing ones. If fewer than 3 are missing, ask a sharper question about a covered one. Each question is plain language, at most 10 words, phrased the way an owner would brief a new employee.
3. suggestions: for each question give 2 or 3 short, concrete example answers, written the way a real café or shop owner would answer. Put the most typical answer first.
4. feedback: one warm sentence (max 25 words) comparing this to onboarding a new employee. Never condescending.

Never use the words prompt, model, AI jargon or technical terms.
```

### `prompts/lesson.md`
```
You help a small business owner see what they just learned.

You get: their original message, their 3 answers (numbered), the AI intern's first output and the improved output.

Return:
1. improvedBrief: one reusable message in the owner's own words, combining the original message and the answers. Replace the parts that change each time with [brackets], for example [review] or [what happened]. Max 60 words.
2. whatChanged: 2 or 3 short points (max 15 words each) on what got better in the second output. Each point names the number of the answer it came from.
3. takeaway: one sentence (max 20 words) reminding them they used a skill they already have: onboarding staff.

Plain language, no jargon.
```

## Demo data (`lib/mock.ts`, review scenario)

```json
{
  "brief": "Reply to this 1-star review: \"Waited 20 minutes for one coffee. Never again.\"",
  "intern_v1": {
    "output": "Dear guest, we are sorry to hear about your experience. We always strive to provide excellent service and will take your feedback into account. We hope to welcome you again soon."
  },
  "coach": {
    "feedback": "A new barista wouldn't know what happened that day either. Three quick questions:",
    "covered": ["who"],
    "questions": [
      { "n": 1, "element": "what", "question": "What actually happened that day?", "suggestions": ["Saturday rush, one of my two baristas was sick", "Our espresso machine broke down", "No idea, it was a normal day"] },
      { "n": 2, "element": "tone", "question": "How do you want to sound?", "suggestions": ["Honest and warm, sign it with my name, Mira", "Short and professional", "Friendly, like I talk to regulars"] },
      { "n": 3, "element": "goal", "question": "What do you want this guest to do?", "suggestions": ["Come back, their next coffee is on me", "Message me directly", "Just feel heard"] }
    ]
  },
  "intern_v2": {
    "output": "Hi, you're right: 20 minutes is far too long for one coffee, and I'm sorry. <a1>Last Saturday one of our two baristas was sick, so I was alone behind the counter during the rush.</a1> <a2>That's not an excuse, just the honest story.</a2> <a3>Come back any time and your next coffee is on me. Just mention this review.</a3> <a2>Mira, owner of Kiez Café</a2>"
  },
  "lesson": {
    "improvedBrief": "Reply to this review: [review]. What happened: [what happened]. Sound [how I want to sound] and sign with my name. I'd like the guest to [what they should do next].",
    "whatChanged": [
      { "n": 1, "text": "It tells the real story of that Saturday, not a stock apology." },
      { "n": 2, "text": "It sounds like Mira: honest, warm and signed with her name." },
      { "n": 3, "text": "It gives the guest a clear reason to come back." }
    ],
    "takeaway": "You didn't learn anything new. You onboarded your AI intern like you'd onboard a new barista."
  }
}
```

## Out of scope

Login, database, history, posting to Google or Instagram, images, voice input, analytics. German UI and voice are "next steps" for the pitch, not for today unless P0 and P1 are done and deployed.
