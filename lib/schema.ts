// Shared types for the API route and the page. See docs/spec.md.

export type Element = "what" | "who" | "tone" | "goal";
export const ELEMENTS: Element[] = ["what", "who", "tone", "goal"];

export type AnswerNumber = 1 | 2 | 3;

export type Task = "review" | "post" | "job" | "custom";

export type Answer = { n: AnswerNumber; question: string; answer: string };

export type CoachQuestion = {
  n: AnswerNumber;
  element: Element;
  question: string;
  suggestions: string[];
};

export type CoachResult = {
  feedback: string;
  covered: Element[];
  questions: CoachQuestion[];
};

export type LessonResult = {
  improvedBrief: string;
  whatChanged: { n: AnswerNumber; text: string }[];
  takeaway: string;
};

export type InternResult = { output: string };

export type InternRequest = { mode: "intern"; task: Task; brief: string; answers?: Answer[] };
export type CoachRequest = { mode: "coach"; task: Task; brief: string };
export type LessonRequest = {
  mode: "lesson";
  task: Task;
  brief: string;
  answers: Answer[];
  outputV1: string;
  outputV2: string;
};
export type GenerateRequest = InternRequest | CoachRequest | LessonRequest;

// Every successful response may carry demo: true when it is demo data, not a live answer.
export type WithDemo<T> = T & { demo?: boolean };

// Friendly, user-facing error (rate limit, too long, bad input).
export type ErrorResponse = { error: string };
