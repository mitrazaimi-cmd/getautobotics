// ─────────────────────────────────────────────────────────────
// Portfolio / case studies.
//
// ⚠ These are PLACEHOLDERS. Brand guide §12: never fabricate case studies,
// client names, logos, metrics, or testimonials. Replace each entry with a real
// project (with the client's permission) and set `placeholder: false`.
//
// Structure follows brand guide §10:
// Problem → Workflow → Solution → Implementation → Result → Lesson
// ─────────────────────────────────────────────────────────────

import type { IconName } from "@/components/ui/Icon";

export type CaseStudy = {
  slug: string;
  /** While true, the card and page show a visible placeholder badge and are excluded from the sitemap. */
  placeholder: boolean;
  title: string;
  /** Industry or business type — no client name unless you have permission. */
  businessType: string;
  summary: string;
  icon: IconName;
  tools: string[];
  problem: string;
  workflow: string[];
  solution: string;
  implementation: string[];
  /** Only real, measured results. Say what the result depends on. */
  result: string;
  lesson: string;
};

export const PLACEHOLDER_LABEL = "[Placeholder — replace with real project]";

export const caseStudies: CaseStudy[] = [
  {
    slug: "lead-follow-up-placeholder",
    placeholder: true,
    title: "[Project title — e.g. Automated lead follow-up]",
    businessType: "[Business type — e.g. professional services firm]",
    summary:
      "[One-sentence summary: which repetitive work was automated and what became better for the business.]",
    icon: "growth",
    tools: ["[Tool 1]", "[Tool 2]"],
    problem: "[Describe the business problem in the owner’s words. What was slow, manual, or getting missed?]",
    workflow: [
      "[Step 1 of the workflow before automation]",
      "[Step 2 — where time was lost or leads slipped]",
      "[Step 3]",
    ],
    solution: "[What you designed: the agent, chatbot, or automation and where human checkpoints stayed.]",
    implementation: ["[How it was connected to existing tools]", "[How it was tested]", "[How the team was trained]"],
    result: "[Real, measured result only — e.g. response time before/after. Note what the result depended on.]",
    lesson: "[One practical lesson another business owner could use.]",
  },
  {
    slug: "customer-support-placeholder",
    placeholder: true,
    title: "[Project title — e.g. Customer questions chatbot with human handoff]",
    businessType: "[Business type — e.g. local service business]",
    summary: "[One-sentence summary of the project and the business outcome.]",
    icon: "chatbot",
    tools: ["[Tool 1]", "[Tool 2]"],
    problem: "[Describe the business problem.]",
    workflow: ["[Workflow step 1]", "[Workflow step 2]", "[Workflow step 3]"],
    solution: "[Describe the solution and escalation rules.]",
    implementation: ["[Implementation step 1]", "[Implementation step 2]"],
    result: "[Real, measured result only.]",
    lesson: "[Lesson learned.]",
  },
  {
    slug: "scheduling-placeholder",
    placeholder: true,
    title: "[Project title — e.g. Appointment scheduling and reminders]",
    businessType: "[Business type — e.g. consulting practice]",
    summary: "[One-sentence summary of the project and the business outcome.]",
    icon: "calendar",
    tools: ["[Tool 1]", "[Tool 2]"],
    problem: "[Describe the business problem.]",
    workflow: ["[Workflow step 1]", "[Workflow step 2]", "[Workflow step 3]"],
    solution: "[Describe the solution.]",
    implementation: ["[Implementation step 1]", "[Implementation step 2]"],
    result: "[Real, measured result only.]",
    lesson: "[Lesson learned.]",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
