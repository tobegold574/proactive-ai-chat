import { Sparkles, Brain, Shield, Zap, type LucideIcon } from "lucide-react"

export type FeatureId = "proactive" | "memory" | "local" | "trigger"

export const features: {
  id: FeatureId
  icon: LucideIcon
  gradient: string
}[] = [
  {
    id: "proactive",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "memory",
    icon: Brain,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    id: "local",
    icon: Shield,
    gradient: "from-sky-500 to-blue-500",
  },
  {
    id: "trigger",
    icon: Zap,
    gradient: "from-cyan-500 to-sky-500",
  },
]
