"use client"

import { useState, useCallback } from "react"
import { PageHeader } from "@/components/page-header"
import { KPICard } from "@/components/kpi-card"

interface Shift {
  id: string
  employee: string
  role: string
  day: string
  startTime: string
  endTime: string
  aiSuggested?: boolean
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const ROLES = ["Cashier", "Floor Staff", "Warehouse", "Manager", "Security"]

const INITIAL_SHIFTS: Shift[] = [
  { id: "s1", employee: "Alice Johnson", role: "Cashier", day: "Monday", startTime: "09:00", endTime: "17:00" },
  { id: "s2", employee: "Bob Smith", role: "Floor Staff", day: "Monday", startTime: "10:00", endTime: "18:00" },
  { id: "s3", employee: "Carol Davis", role: "Manager", day: "Monday", startTime: "08:00", endTime: "16:00" },
  { id: "s4", employee: "Dan Wilson", role: "Warehouse", day: "Tuesday", startTime: "06:00", endTime: "14:00" },
  { id: "s5", employee: "Eve Martinez", role: "Cashier", day: "Tuesday", startTime: "14:00", endTime: "22:00" },
  { id: "s6", employee: "Alice Johnson", role: "Cashier", day: "Wednesday", startTime: "09:00", endTime: "17:00" },
  { id: "s7", employee: "Frank Lee", role: "Security", day: "Wednesday", startTime: "18:00", endTime: "02:00" },
  { id: "s8", employee: "Bob Smith", role: "Floor Staff", day: "Thursday", startTime: "10:00", endTime: "18:00" },
  { id: "s9", employee: "Carol Davis", role: "Manager", day: "Friday", startTime: "08:00", endTime: "16:00" },
  { id: "s10", employee: "Dan Wilson", role: "Warehouse", day: "Friday", startTime: "06:00", endTime: "14:00" },
  { id: "s11", employee: "Eve Martinez", role: "Cashier", day: "Saturday", startTime: "09:00", endTime: "17:00" },
  { id: "s12", employee: "Alice Johnson", role: "Cashier", day: "Saturday", startTime: "12:00", endTime: "20:00", aiSuggested: true },
  { id: "s13", employee: "Frank Lee", role: "Security", day: "Sunday", startTime: "10:00", endTime: "18:00" },
]

const CONFLICTS = [
  { employee: "Eve Martinez", day: "Saturday", issue: "Double shift within 8 hours of Friday closing shift" },
  { employee: "Frank Lee", day: "Sunday", issue: "Only 1 security staff scheduled - minimum 2 required" },
]

const ROLE_COLORS: Record<string, string> = {
  Cashier: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Floor Staff": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Warehouse: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Manager: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  Security: "bg-red-500/15 text-red-400 border-red-500/30",
}

function estimateWeeklyCost(shifts: Shift[]): number {
  return shifts.reduce((total, shift) => {
    const start = parseInt(shift.startTime.split(":")[0])
    const end = parseInt(shift.endTime.split(":")[0])
    const hours = end > start ? end - start : 24 - start + end
    const rate = shift.role === "Manager" ? 35 : shift.role === "Security" ? 28 : 22
    return total + hours * rate
  }, 0)
}

export default function StaffPage() {
  const [shifts] = useState<Shift[]>(INITIAL_SHIFTS)
  const [selectedDay, setSelectedDay] = useState<string>("all")

  const displayedShifts = selectedDay === "all" ? shifts : shifts.filter((s) => s.day === selectedDay)

  const uniqueEmployees = new Set(shifts.map((s) => s.employee)).size
  const totalHours = shifts.reduce((acc, s) => {
    const start = parseInt(s.startTime.split(":")[0])
    const end = parseInt(s.endTime.split(":")[0])
    return acc + (end > start ? end - start : 24 - start + end)
  }, 0)
  const weeklyCost = estimateWeeklyCost(shifts)

  const getShiftsForDayAndRole = useCallback(
    (day: string, role: string) => shifts.filter((s) => s.day === day && s.role === role),
    [shifts]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff & Operations"
        description="Manage shift scheduling with AI-suggested optimal coverage and conflict detection."
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Active Staff" value={uniqueEmployees} variant="neutral" subtitle="Unique employees" />
        <KPICard label="Weekly Hours" value={totalHours} variant="info" subtitle="Total scheduled" />
        <KPICard
          label="Conflicts"
          value={CONFLICTS.length}
          variant={CONFLICTS.length > 0 ? "danger" : "success"}
          subtitle={CONFLICTS.length > 0 ? "Needs attention" : "All clear"}
        />
        <KPICard label="Est. Labor Cost" value={`$${weeklyCost.toLocaleString()}`} variant="warning" subtitle="Weekly projection" />
      </div>

      {/* Shift Conflict Detector */}
      {CONFLICTS.length > 0 && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-danger">Shift Conflicts Detected</h3>
          <div className="flex flex-col gap-2">
            {CONFLICTS.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-md bg-danger/10 px-3 py-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-danger">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <div>
                  <span className="text-sm font-medium text-foreground">{c.employee}</span>
                  <span className="mx-2 text-xs text-muted-foreground">{c.day}</span>
                  <p className="text-xs text-muted-foreground">{c.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Calendar Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Schedule</h2>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            <button
              onClick={() => setSelectedDay("all")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedDay === "all" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Days
            </button>
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selectedDay === d ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {selectedDay === "all" ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  {DAYS.map((d) => (
                    <th key={d} className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROLES.map((role) => (
                  <tr key={role} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[role] || ""}`}>
                        {role}
                      </span>
                    </td>
                    {DAYS.map((day) => {
                      const dayShifts = getShiftsForDayAndRole(day, role)
                      return (
                        <td key={day} className="px-3 py-3 text-center">
                          {dayShifts.length > 0 ? (
                            <div className="flex flex-col items-center gap-1">
                              {dayShifts.map((s) => (
                                <div
                                  key={s.id}
                                  className={`rounded px-2 py-1 text-xs ${
                                    s.aiSuggested
                                      ? "bg-primary/15 text-primary border border-dashed border-primary/40"
                                      : "bg-secondary text-foreground"
                                  }`}
                                >
                                  <span className="font-medium">{s.employee.split(" ")[0]}</span>
                                  <br />
                                  <span className="text-muted-foreground">
                                    {s.startTime}-{s.endTime}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayedShifts.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No shifts scheduled for {selectedDay}</div>
            ) : (
              displayedShifts.map((shift) => (
                <div
                  key={shift.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                    shift.aiSuggested ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                      {shift.employee
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {shift.employee}
                        {shift.aiSuggested && (
                          <span className="ml-2 text-xs text-primary">(AI Suggested)</span>
                        )}
                      </p>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${ROLE_COLORS[shift.role] || ""}`}>
                        {shift.role}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-medium text-foreground">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <p className="text-xs text-muted-foreground">{shift.day}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* AI Coverage Legend */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium text-foreground">Legend</h3>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-secondary" />
            <span className="text-muted-foreground">Manually Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded border border-dashed border-primary/40 bg-primary/15" />
            <span className="text-muted-foreground">AI Suggested Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-danger" />
            <span className="text-muted-foreground">Scheduling Conflict</span>
          </div>
        </div>
      </div>
    </div>
  )
}
