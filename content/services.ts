// ─────────────────────────────────────────────────────────────
// Service areas and packages — brand guide §04.
// Presented as business outcomes, not a technology menu.
// `icon` must be a name registered in components/ui/Icon.tsx.
// ─────────────────────────────────────────────────────────────

import type { IconName } from "@/components/ui/Icon";

export type Service = {
  title: string;
  outcome: string;
  description: string;
  icon: IconName;
};

export const services: Service[] = [
  {
    title: "AI Agents",
    outcome: "Hand off defined work with confidence",
    description:
      "Handle defined tasks, workflows, research, follow-up, and operational work with clear rules and human checkpoints.",
    icon: "bot",
  },
  {
    title: "AI Chatbots",
    outcome: "Answer customers faster",
    description: "Answer questions, qualify leads, guide visitors, and improve customer response time.",
    icon: "chatbot",
  },
  {
    title: "Workflow Automation",
    outcome: "Remove repetitive handoffs",
    description: "Connect your tools and eliminate repetitive handoffs and manual steps.",
    icon: "workflow",
  },
  {
    title: "Email Automation",
    outcome: "Keep your inbox under control",
    description: "Route, respond, follow up, and nurture with consistent logic and timing.",
    icon: "mail",
  },
  {
    title: "Lead Generation & Follow-Up",
    outcome: "Miss fewer opportunities",
    description: "Reduce missed opportunities and improve speed-to-lead.",
    icon: "growth",
  },
  {
    title: "CRM Automation",
    outcome: "Keep customer data organized",
    description: "Keep customer and lead information organized and workflows moving.",
    icon: "crm",
  },
  {
    title: "Customer Service Automation",
    outcome: "Respond faster, keep the human touch",
    description: "Improve response speed while preserving escalation to people.",
    icon: "handoff",
  },
  {
    title: "Appointment Automation",
    outcome: "Stop the scheduling back-and-forth",
    description: "Reduce back-and-forth and simplify scheduling.",
    icon: "calendar",
  },
  {
    title: "Marketing Automation",
    outcome: "Turn marketing tasks into systems",
    description: "Turn repeatable marketing tasks into reliable systems.",
    icon: "automation",
  },
  {
    title: "Website & AI Integration",
    outcome: "Make your website do real work",
    description: "Make the website part of the business workflow rather than a static brochure.",
    icon: "globe",
  },
];

export type ServicePackage = {
  name: string;
  summary: string;
  bestFor: string;
  includes: string[];
};

/** No prices are shown. Add pricing only when it is confirmed. */
export const packages: ServicePackage[] = [
  {
    name: "AI Starter",
    summary: "A practical entry point for a focused AI or automation need.",
    bestFor: "Businesses ready to automate one clear, repetitive task first.",
    includes: [
      "One focused workflow or chatbot",
      "Built around the tools you already use",
      "Testing, training, and documentation",
    ],
  },
  {
    name: "AI Growth",
    summary: "Lead management, customer experience, marketing, and growth workflows.",
    bestFor: "Businesses that want faster responses and more consistent follow-up.",
    includes: [
      "Lead capture and follow-up automation",
      "Customer experience workflows",
      "Marketing task automation",
    ],
  },
  {
    name: "AI Automation",
    summary: "Broader business automation and connected AI workflows.",
    bestFor: "Businesses ready to connect several processes into one system.",
    includes: [
      "Connected AI agents and workflows",
      "Integration across your core tools",
      "Ongoing measurement and optimization",
    ],
  },
];
