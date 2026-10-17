// Demo data: the review scenario from docs/spec.md. Used when there is no API key,
// when MOCK=1, or when a live call fails (then the UI shows a "demo data" label).
import type { CoachResult, InternResult, LessonResult } from "./schema";

export const MOCK_BRIEF =
  'Reply to this 1-star review: "Waited 20 minutes for one coffee. Never again."';

export const MOCK_INTERN_V1: InternResult = {
  output:
    "Dear guest, we are sorry to hear about your experience. We always strive to provide excellent service and will take your feedback into account. We hope to welcome you again soon.",
};

export const MOCK_COACH: CoachResult = {
  feedback:
    "A new barista wouldn't know what happened that day either. Three quick questions:",
  covered: ["who"],
  questions: [
    {
      n: 1,
      element: "what",
      question: "What actually happened that day?",
      suggestions: [
        "Saturday rush, one of my two baristas was sick",
        "Our espresso machine broke down",
        "No idea, it was a normal day",
      ],
    },
    {
      n: 2,
      element: "tone",
      question: "How do you want to sound?",
      suggestions: [
        "Honest and warm, sign it with my name, Mira",
        "Short and professional",
        "Friendly, like I talk to regulars",
      ],
    },
    {
      n: 3,
      element: "goal",
      question: "What do you want this guest to do?",
      suggestions: [
        "Come back, their next coffee is on me",
        "Message me directly",
        "Just feel heard",
      ],
    },
  ],
};

export const MOCK_INTERN_V2: InternResult = {
  output:
    "Hi, you're right: 20 minutes is far too long for one coffee, and I'm sorry. <a1>Last Saturday one of our two baristas was sick, so I was alone behind the counter during the rush.</a1> <a2>That's not an excuse, just the honest story.</a2> <a3>Come back any time and your next coffee is on me. Just mention this review.</a3> <a2>Mira, owner of Kiez Café</a2>",
};

export const MOCK_LESSON: LessonResult = {
  improvedBrief:
    "Reply to this review: [review]. What happened: [what happened]. Sound [how I want to sound] and sign with my name. I'd like the guest to [what they should do next].",
  whatChanged: [
    { n: 1, text: "It tells the real story of that Saturday, not a stock apology." },
    { n: 2, text: "It sounds like Mira: honest, warm and signed with her name." },
    { n: 3, text: "It gives the guest a clear reason to come back." },
  ],
  takeaway:
    "You didn't learn anything new. You onboarded your AI intern like you'd onboard a new barista.",
};
