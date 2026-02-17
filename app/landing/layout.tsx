import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "StoreOps AI - The Store That Runs Itself",
  description:
    "Deploy a multi-agent AI ecosystem that orchestrates inventory, pricing, logistics in real-time. Built with CrewAI and AWS Step Functions.",
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
