> 📅 Built at the **Claude Impact Lab Berlin, 17 Oct 2026**. Event rules and judging: [claude-impact-lab-berlin-2026-10-17](https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17)
>
> TODO before 15:45: live link, screenshots, demo video link, team table, owner quote (only with consent). Then delete this line.

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
- Safeguards: no invented facts, a reminder never to paste personal data, malformed tags fall back to plain text, and if a live call fails the app shows clearly labelled demo data instead of an error.
- The owner always stays in control: they copy the result themselves; nothing is posted automatically.

## How to run it

```bash
cp .env.example .env    # paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev             # open http://localhost:3000
```

No key? Set `MOCK=1` in `.env` to run the whole flow on demo data.

**Live link:** TODO

## Screenshots / demo

TODO: 2-minute demo video link, plus screenshots of the compare screen and the note.

## Who we talked to

TODO: one real owner's reaction from today (only with consent; otherwise describe them, e.g. "a florist in Kreuzberg").

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
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (SIL Open Font License)
- "AI as an intern" idea popularised by Ethan Mollick
