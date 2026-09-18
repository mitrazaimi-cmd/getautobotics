// The Auto Botics Method — brand guide §05.

import type { IconName } from "@/components/ui/Icon";

export type MethodStep = {
  name: string;
  description: string;
  icon: IconName;
};

export const methodSteps: MethodStep[] = [
  {
    name: "Understand",
    description: "Your business, goals, customers, tools, constraints, and workflows.",
    icon: "search",
  },
  {
    name: "Diagnose",
    description: "Find repetitive, slow, error-prone, or opportunity-losing work.",
    icon: "diagnose",
  },
  {
    name: "Prioritize",
    description: "Select the highest-value automation opportunities.",
    icon: "target",
  },
  {
    name: "Design",
    description: "Build a customized AI and automation system around your business.",
    icon: "design",
  },
  {
    name: "Integrate",
    description: "Connect your existing tools and keep your working environment intact.",
    icon: "integrate",
  },
  {
    name: "Implement",
    description: "Launch carefully, test, train, and document.",
    icon: "implement",
  },
  {
    name: "Optimize",
    description: "Measure real-world results and keep improving.",
    icon: "optimize",
  },
];
