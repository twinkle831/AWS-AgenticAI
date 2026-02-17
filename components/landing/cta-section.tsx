"use client"

import Link from "next/link"
import { useScrollAnimate } from "@/hooks/use-scroll-animate"

export function CTASection() {
  const { ref, isVisible } = useScrollAnimate<HTMLElement>(0.2)

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden">
      {/* Large glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00f0b5]/5 blur-[150px]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2
          className={`text-4xl font-bold text-[#e0e0e0] mb-4 md:text-5xl text-balance transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Ready to automate the floor?
        </h2>
        <p
          className={`text-base text-[#8a9bb0] mb-10 transition-all duration-700 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          Implementation in as little as 40 hours.
        </p>
        <div
          className={`transition-all duration-700 delay-400 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2 rounded-lg bg-[#00f0b5] px-8 py-4 text-base font-bold text-[#060b12] transition-all hover:shadow-[0_0_40px_rgba(0,240,181,0.4)] hover:scale-[1.02]"
          >
            Get Started with Agentic Ops
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
