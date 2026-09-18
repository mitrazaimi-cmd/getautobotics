import {
  Bot,
  Calendar,
  ChartLine,
  Clock,
  Contact,
  Globe,
  Handshake,
  Layers,
  MessageSquareMore,
  Plug,
  RefreshCw,
  Rocket,
  Search,
  SearchCheck,
  ShieldCheck,
  Target,
  TrendingUp,
  UserRoundCheck,
  Workflow,
  Mail,
  PenTool,
  type LucideProps,
} from "lucide-react";

/**
 * Brand icon registry (brand guide §09 icon system).
 * Outline only, 1.75px stroke, Deep Navy by default.
 * Icons are decorative (aria-hidden) — always render a visible text label next to them.
 */
const registry = {
  automation: RefreshCw,
  chatbot: MessageSquareMore,
  bot: Bot,
  workflow: Workflow,
  mail: Mail,
  calendar: Calendar,
  growth: TrendingUp,
  clock: Clock,
  handoff: UserRoundCheck,
  crm: Contact,
  globe: Globe,
  search: Search,
  diagnose: SearchCheck,
  target: Target,
  design: PenTool,
  integrate: Plug,
  implement: Rocket,
  optimize: ChartLine,
  simplicity: Layers,
  trust: ShieldCheck,
  partnership: Handshake,
} as const;

export type IconName = keyof typeof registry;

type Props = Omit<LucideProps, "ref"> & { name: IconName };

export function Icon({ name, size = 24, strokeWidth = 1.75, ...rest }: Props) {
  const Component = registry[name];
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...rest} />;
}
