// Core values — brand guide §02.

import type { IconName } from "@/components/ui/Icon";

export type CoreValue = { name: string; description: string; icon: IconName };

export const coreValues: CoreValue[] = [
  { name: "Freedom", description: "Technology should give people back their time.", icon: "clock" },
  { name: "Understand First", description: "We don’t automate blindly.", icon: "search" },
  {
    name: "Human-Centered AI",
    description: "AI should empower people, not simply replace people.",
    icon: "handoff",
  },
  {
    name: "Simplicity",
    description: "You shouldn’t need to become an AI expert to benefit from AI.",
    icon: "simplicity",
  },
  {
    name: "Trust & Results",
    description: "Technology matters when it solves real business problems and produces measurable results.",
    icon: "trust",
  },
];
