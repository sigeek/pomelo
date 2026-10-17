# Goal: win the Claude Impact Lab Berlin (team Pomelo)

Product: **AI Intern**. One line: *Onboard your AI intern like a new employee, and it starts sounding like your shop.*

When in doubt, choose whatever makes the 2-minute demo video and the README stronger. Not more features.

## The three sentences (CLAUDE.md asks for these)

1. **Audience:** owners of small cafés, bakeries and shops in Berlin (1 to 10 staff) who answer reviews and post online themselves.
2. **Their problem with AI today:** they try once, type one vague line, get generic text that doesn't sound like them, and decide AI isn't for them. In Germany only 19% of firms with fewer than 5 employees used AI (KfW Mittelstandspanel 2025, covering 2022 to 2024); lack of skills and lack of time are the top barriers.
3. **What our demo lets them do:** in 3 minutes, on a real task (replying to a 1-star review), the owner onboards an AI intern like a new employee, sees exactly how their 3 answers turned a stock reply into their own voice, and leaves with a reusable note.

## Hero scenario (be specific, always demo this one)

- **Persona (fictional):** Mira owns Kiez Café in Neukölln, with two baristas. She tried ChatGPT once and got corporate-sounding text.
- **Moment:** Sunday night. A 1-star Google review: *"Waited 20 minutes for one coffee. Never again."* She has been staring at it for 20 minutes.
- **Fear (what she is afraid of losing):** her reputation, and her own voice. Stock AI replies sound fake.
- **What she wants instead:** a reply that sounds like her, in minutes, and the know-how to do it again herself.
- Instagram post and job ad exist as secondary presets only to show it generalises.

## How judging actually works (from the event repo)

- Judges **watch the 2-minute demo video first**, then read the README.
- Round one at 16:05: two groups of three judges each score half the teams. Top 3 per group go to the finals.
- Finals at 16:40: **6 min demo + 4 min Q&A**, scored by all six judges.
- Impact 40 ("Does it help a real audience learn or use AI? **Would they actually use it?**"), Working demo 20, Technical quality 20, Creativity 20. Ties go to the higher Impact score.

So for round one, the video and the README *are* the product.

## What wins (patterns from other Impact Labs and Claude hackathons)

- One specific person in one specific moment beats a broad audience.
- Real-world evidence (a real user's reaction, adoption interest) beats claims.
- Domain experts framing the problem from their own field.
- Demos that are interactive and readable at a glance.

## Our plan per criterion

**Impact (40)**
- Specific persona and hero moment, told in the first 10 seconds of the video.
- **Learning meter:** "Your first message covered 1 of 4 things a new employee needs. Your note covers 4 of 4." Proof that they learned, not just that they got output. Our education expert explains why this matters.
- **One real owner's reaction today** (a nearby shop, or a teammate's contact by phone). Quote in README and video, only with consent; otherwise "a florist in Kreuzberg".
- **Would they use it:** no login, phone first, solves today's task first, learning is the by-product.
- **Adoption path:** a 3-minute hands-on module for the AI workshops that chambers and craft associations already run (IHK, Handwerkskammer, Mittelstand-Digital Zentren).

**Working demo (20)**
- Public URL, real Claude API, all three presets work live.
- Never breaks: if a live call fails, fall back to labelled demo data instead of an error screen.

**Technical quality (20)**
- Three Claude roles with clear contracts (AI intern, coach, lesson), structured output via tool use, answer-to-phrase tagging.
- Guardrails: the AI intern never invents facts, personal data warning, malformed tags fall back to plain text.
- Prompts live in `prompts/`. The README section "How Claude is used" explains all of this in plain words.

**Creativity (20)**
- Ethan Mollick's well-known "AI is an intern" idea, made tangible.
- Colour-linked before/after: each answer and the sentences it produced share a colour and a number.
- Be honest if asked: prompt-coaching tools exist (DataCamp, Mindstone). Ours is audience-specific, jargon-free, score-free, 3 minutes, on the owner's own task.

## Priorities (cut from the bottom when late)

- **P0, by 14:45:** 4-step flow running with the real API on a public URL; review hero preset; colour-linked compare screen.
- **P1, by 15:00:** learning meter; tappable suggestion chips under each question; copy buttons for the reply and the note.
- **P2, only if P0 and P1 are deployed:** share button for the note; personal data warning; demo data for the other two presets; German UI toggle.

Never start a P2 item while a P0 item is broken.

## Definition of done (by 15:45)

- [ ] Public repo `pomelo`, README filled in (one line, problem, what it does, how Claude is used, how to run, live link, screenshots, team with roles, credits)
- [ ] 2-minute demo video, link opens for anyone
- [ ] No keys in Git, `.env` ignored, no real personal data anywhere
- [ ] One person submitted the form: https://tally.so/r/1WPr9Q

## Timeline

| Time | What |
|---|---|
| 13:45 | Build P0 |
| 14:15 | Show the compare screen to a Claude ambassador or mentor, ask what would make it stronger |
| 14:45 | P0 deployed |
| 15:00 | Feature freeze, record the demo video |
| 15:20 | README final |
| 15:45 | Submit |
| 16:05 | Rehearse the 6-minute finals pitch while round one runs |

## 2-minute demo video script

| Time | Screen | Voice-over |
|---|---|---|
| 0:00–0:12 | Stat, then Mira's review | "In Germany, about four in five micro businesses don't use AI. The biggest reasons: no skills, no time. Meet Mira. It's Sunday night, and she has a 1-star review to answer." |
| 0:12–0:25 | Step 1 to first try | "She asks an AI, like most owners do. One line. She gets a stock apology that could come from any chain." |
| 0:25–1:05 | Onboarding, chips, compare screen | "So she onboards her AI intern like a new barista. Three questions, a few taps. Now every answer shows up in the reply, in its own colour. It sounds like her." |
| 1:05–1:25 | Learning meter, note | "Her first message covered one of four things a new employee needs. Her note covers all four. She can reuse it in any AI chat." |
| 1:25–1:45 | Owner quote, workshop slide | "[Real reaction from today.] Chambers and craft associations already run AI workshops. This is the three-minute hands-on part." |
| 1:45–2:00 | How Claude is used, end card | "Three Claude roles, no invented facts, nothing posted without the owner. AI Intern, by team Pomelo." |

## Finals: 6 min demo + 4 min Q&A

- 0:00–0:45 Mira's story (told by the domain expert or founder)
- 0:45–3:30 Live demo on the review preset (backup: play the video)
- 3:30–4:30 Evidence: owner reaction, learning meter, the KfW number
- 4:30–5:30 How it reaches owners, what's next (German UI, voice input)
- 5:30–6:00 Close: "Every owner has onboarded a new employee. That's the only skill they need to use AI well."

Q&A one-liners:
- **Why not just ChatGPT?** "We want them to use ChatGPT. This fixes the first experience that makes them quit."
- **How do you know they learned?** "Their message goes from 1 of 4 to 4 of 4 essentials, and they keep the note."
- **How do owners find it?** "Through the chamber and craft association workshops that already teach AI."
- **Privacy?** "We warn before personal data, store nothing, and nothing gets posted automatically."
- **Isn't this just a prompt coach?** "Prompt coaches score you in AI jargon. We use the language owners already speak: onboarding a new employee."

## Decisions log

- Audience narrowed from "small business owners" to Berlin café, bakery and shop owners. Hero task: replying to a 1-star review.
- Always say "AI intern", never "intern" alone.
- English UI for judging; German UI is a stretch goal and a "next step" in the pitch.
