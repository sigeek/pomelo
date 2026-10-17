> 📅 Built at the **Claude Impact Lab Berlin, 17 Oct 2026**. Event rules and judging: [claude-impact-lab-berlin-2026-10-17](https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17)
>
> TODO before 15:45: screenshots, demo video link, team table. Then delete this line.

# AI Intern

**One line:** Small business owners onboard an AI intern like a new employee, get a reply or post that sounds like their shop in 3 minutes, and learn how to brief any AI themselves.

## The problem

Owners of small cafés, bakeries and shops in Berlin answer reviews and post online themselves, late at night, with no time to spare. Most try AI once, type one vague line, get a stock answer that sounds like a chain, and decide AI isn't for them. In Germany only 19% of firms with fewer than 5 employees used AI between 2022 and 2024, and lack of skills and lack of time are the top barriers ([KfW Research, Feb 2026](https://www.kfw.de/PDF/Download-Center/Konzernthemen/Research/PDF-Dokumente-Fokus-Volkswirtschaft/Fokus-2026/Fokus-Nr.-533-Februar-2026-KI-Mittelstand.pdf)).

Every owner already has the skill that fixes this: onboarding a new employee.

## What it does

Meet Mira (fictional). She owns Kiez Café and has a 1-star review to answer: *"Waited 20 minutes for one coffee. Never again."*

1. **Give the AI intern a task.** Pick "Reply to a review", "Instagram post" or "Job ad", or type your own.
2. **See the first try, then onboard.** The reply is a stock apology. The app asks the 3 questions a new employee would need answered (what happened, how you sound, what you want the guest to do). Tap a suggested answer or type your own.
3. **Compare.** The new reply sounds like Mira. Each answer and the sentences it produced share a colour, so you see exactly what your words changed.
4. **Keep your onboarding note.** A reusable message for any AI chat, plus a meter: your first message covered 1 of 4 things a new employee needs, your note covers 4 of 4.

No login, phone first, nothing is stored and nothing is posted for you.

## How Claude is used

Claude plays three roles, each with its own system prompt in [`prompts/`](prompts/):

| Role | What it reads | What it produces |
|---|---|---|
| **AI intern** | The owner's message, and later the owner's 3 answers | The reply or post. It never invents facts that weren't given. With answers, it tags every phrase with the answer it came from (`<a1>…</a1>`), which drives the colour linking. |
| **Coach** | The owner's message | Which of the four essentials (what, who, tone, goal) it already covers, 3 onboarding questions for the missing ones, and tappable example answers. Returned as structured JSON via tool use. |
| **Lesson** | Message, answers, both outputs | A reusable onboarding note with `[blanks]`, what changed and why, and a one-line takeaway. Structured JSON via tool use. |

- Model: `claude-sonnet-5-5` via the Anthropic API (configurable with `CLAUDE_MODEL`).
- Structured output: the coach and lesson each get one strict JSON-schema tool, and the server validates every answer (exactly 3 questions, numbers 1 to 3, 2 to 3 suggestions each). Anything that doesn't pass falls back to demo data.
- Safeguards: no invented facts, an inline warning when the message contains an email address or phone number, malformed tags fall back to plain text, and if a live call fails the app shows clearly labelled demo data instead of an error.
- Cost guard for the public link: a per-instance cap of `MAX_REQUESTS_PER_HOUR` (default 200) and a 4,000-character limit on what the owner types, both with a friendly message.
- Does onboarding actually help? We ran 10 Instagram briefs through the live app and had a separate Claude judge (Opus 5.5) score the posts blind. The onboarded post won 10 of 10, and "specific" went from 1.0 to 4.5 out of 5. Method, numbers and limits: [`eval/RESULTS.md`](eval/RESULTS.md) (`npm run eval`).
- The owner always stays in control: they copy the result themselves; nothing is posted automatically.

## How to run it

```bash
cp .env.example .env    # paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev             # open http://localhost:3000
```

No key? Run `npm run mock` (or set `MOCK=1` in `.env`) to run the whole flow on demo data for all three presets.

**Live link:** https://pomelo-weld.vercel.app

## Screenshots / demo

TODO: 2-minute demo video link, plus screenshots of the compare screen and the note.

## Evidence so far

We didn't get to test with a real café owner on the day, so we won't claim a reaction we don't have. What we can show:

- **A blind test of the outputs.** 10 Instagram briefs ran through the live app, and a separate Claude judge scored the posts without knowing which came first. The onboarded post won 10 of 10, and "specific" went from 1.0 to 4.5 out of 5. See [`eval/RESULTS.md`](eval/RESULTS.md).
- **A visible learning signal.** The meter shows how many of the four things a new employee needs were in the owner's message: 1 of 4 at the start of the review demo, 4 of 4 in the note they take away.
- **Next step:** try it with owners in the AI workshops that chambers and craft associations already run (IHK, Handwerkskammer, Mittelstand-Digital Zentren) and record whether they reuse the note.

## Team: Pomelo

| Name | Role / background |
|---|---|
| [Name](https://www.linkedin.com/in/your-profile) | Builder |
| [Name](https://www.linkedin.com/in/your-profile) | Product or design |
| [Name](https://www.linkedin.com/in/your-profile) | Domain expert (education) |
| [Name](https://www.linkedin.com/in/your-profile) | Founder |
| [Name](https://www.linkedin.com/in/your-profile) | |

## Credits

- [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com) (MIT)
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) (MIT)
- Hosted on [Vercel](https://vercel.com)
- [Itim](https://fonts.google.com/specimen/Itim) and [Mali](https://fonts.google.com/specimen/Mali) (SIL Open Font License); visual style from our own Paper prototype
- "AI as an intern" idea popularised by Ethan Mollick
