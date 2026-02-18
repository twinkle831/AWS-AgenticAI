import { CommandCenter } from "@/components/commander/command-center"
import { PageHeader } from "@/components/page-header"

export default function CommanderPage() {
  return (
    <div className="relative flex h-[calc(100vh-7rem)] flex-col gap-4">
      {/* Sci-fi background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(109, 92, 255, 0.04) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <PageHeader
          title="Neural Commander"
          description="Speak to your AI agents. Ask questions, give directives, and watch them collaborate in real-time."
        />
      </div>
      <div className="relative z-10 flex-1 min-h-0">
        <CommandCenter />
      </div>
    </div>
  )
}
