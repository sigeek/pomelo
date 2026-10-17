// Demo data: the review scenario from docs/spec.md. Used when there is no API key,
// when MOCK=1, or when a live call fails (then the UI shows a "demo data" label).
import type { CoachResult, InternResult, LessonResult, Task } from "./schema";

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

// ---------- Instagram post (demo data) ----------

const POST_INTERN_V1: InternResult = {
  output:
    "Something sweet just arrived! 🎂 Our new cake is here and we can't wait for you to try it. Perfect for any occasion. Come by and treat yourself! #NewCake #Bakery #Yummy",
};

const POST_COACH: CoachResult = {
  feedback: "A new employee couldn't describe a cake they've never tasted. Three quick questions:",
  covered: [],
  questions: [
    {
      n: 1,
      element: "what",
      question: "What's special about this cake?",
      suggestions: [
        "Plum crumble with plums from Brandenburg, €4.20 a slice",
        "Vegan chocolate cake, baked fresh every morning",
        "My grandmother's cheesecake recipe",
      ],
    },
    {
      n: 2,
      element: "who",
      question: "Who reads our posts, and in which language?",
      suggestions: [
        "Neighbours and regulars, German and English",
        "Mostly German-speaking locals",
        "Students and expats, in English",
      ],
    },
    {
      n: 3,
      element: "goal",
      question: "What should people do after reading it?",
      suggestions: [
        "Come by this weekend before it's gone",
        "Pre-order a whole cake by message",
        "Tag a friend to share a slice with",
      ],
    },
  ],
};

const POST_INTERN_V2: InternResult = {
  output:
    "Neu bei uns / New in the café 🍰\n\n<a1>Plum crumble with plums from Brandenburg</a1>. <a1>€4.20 a slice.</a1>\n\n<a2>Für unsere Nachbarn: Pflaumenstreusel, frisch gebacken.</a2>\n\n<a3>Come by this weekend before it's gone!</a3> #Pflaumenkuchen #PlumCake #Kiez",
};

const POST_LESSON: LessonResult = {
  improvedBrief:
    "Write an Instagram post about our new [product]. What's special: [what makes it special and the price]. It's for our neighbours and regulars, in German and English. I'd like people to [what they should do next].",
  whatChanged: [
    { n: 1, text: "It names the real cake, the local plums and the price." },
    { n: 2, text: "It speaks to the neighbours in German and English." },
    { n: 3, text: "It ends with a clear reason to come by this weekend." },
  ],
  takeaway: "You told your AI intern what a new employee would need. That's the whole skill.",
};

// ---------- Job ad (demo data) ----------

const JOB_INTERN_V1: InternResult = {
  output:
    "We are looking for a motivated part-time barista to join our dynamic team. You are passionate about coffee and customer service. We offer a great work environment. Apply now!",
};

const JOB_COACH: CoachResult = {
  feedback: "You'd tell a new hire what the job really looks like. Your AI intern needs that too:",
  covered: ["what"],
  questions: [
    {
      n: 1,
      element: "what",
      question: "Which shifts, and what's the pay?",
      suggestions: [
        "Weekend mornings, 15 hours a week, €14 an hour",
        "Weekday afternoons, flexible hours",
        "Saturdays only, 7 to 3",
      ],
    },
    {
      n: 2,
      element: "who",
      question: "Who would fit in well here?",
      suggestions: [
        "Friendly people, no experience needed, we train you",
        "Someone with barista experience who speaks German",
        "Students who want a steady side job",
      ],
    },
    {
      n: 3,
      element: "goal",
      question: "How should people apply?",
      suggestions: [
        "Drop by for a coffee and ask for Mira",
        "Send a short message, no CV needed",
        "Email us with two lines about yourself",
      ],
    },
  ],
};

const JOB_INTERN_V2: InternResult = {
  output:
    "Barista wanted ☕\n\n<a1>Weekend mornings, 15 hours a week, €14 an hour.</a1> <a2>No experience needed: we train you. You just need to be friendly.</a2>\n\n<a3>Drop by for a coffee and ask for Mira.</a3>",
};

const JOB_LESSON: LessonResult = {
  improvedBrief:
    "Write a job ad for a [role]. Shifts and pay: [shifts, hours, pay]. We're looking for friendly people, no experience needed. To apply, people should [how to apply].",
  whatChanged: [
    { n: 1, text: "It states the real shifts, hours and pay." },
    { n: 2, text: "It welcomes beginners instead of asking for a 'dynamic' superstar." },
    { n: 3, text: "It tells people exactly how to apply." },
  ],
  takeaway: "You briefed your AI intern like a new manager would. You already know how.",
};

type MockSet = { v1: InternResult; coach: CoachResult; v2: InternResult; lesson: LessonResult };

const MOCKS: Record<"review" | "post" | "job", MockSet> = {
  review: { v1: MOCK_INTERN_V1, coach: MOCK_COACH, v2: MOCK_INTERN_V2, lesson: MOCK_LESSON },
  post: { v1: POST_INTERN_V1, coach: POST_COACH, v2: POST_INTERN_V2, lesson: POST_LESSON },
  job: { v1: JOB_INTERN_V1, coach: JOB_COACH, v2: JOB_INTERN_V2, lesson: JOB_LESSON },
};

/** Demo data for a task. Free-text tasks fall back to the review scenario. */
export function getMock(task: Task | undefined): MockSet {
  return task && task !== "custom" ? MOCKS[task] : MOCKS.review;
}
