export type AgentId = "inventory" | "pricing" | "maintenance" | "customer" | "logistics"

export interface AgentProfile {
  id: AgentId
  name: string
  role: string
  color: string
  voicePitch: number
  voiceRate: number
  personality: string
}

export const AGENTS: Record<AgentId, AgentProfile> = {
  inventory: {
    id: "inventory",
    name: "Inventory Manager",
    role: "Stock tracking & auto-ordering",
    color: "#22c55e",
    voicePitch: 0.85,
    voiceRate: 0.95,
    personality: "methodical and data-driven",
  },
  pricing: {
    id: "pricing",
    name: "Pricing Analyst",
    role: "Dynamic pricing & promotions",
    color: "#3b82f6",
    voicePitch: 1.15,
    voiceRate: 1.05,
    personality: "analytical and profit-focused",
  },
  maintenance: {
    id: "maintenance",
    name: "Maintenance Coordinator",
    role: "Predictive equipment maintenance",
    color: "#f59e0b",
    voicePitch: 0.75,
    voiceRate: 0.88,
    personality: "cautious and safety-first",
  },
  customer: {
    id: "customer",
    name: "Customer Service",
    role: "Loyalty & customer support",
    color: "#a855f7",
    voicePitch: 1.05,
    voiceRate: 1.0,
    personality: "empathetic and customer-focused",
  },
  logistics: {
    id: "logistics",
    name: "Logistics Coordinator",
    role: "Route optimization & deliveries",
    color: "#06b6d4",
    voicePitch: 1.1,
    voiceRate: 1.08,
    personality: "efficient and timeline-driven",
  },
}

export type CommandCategory = "query" | "directive" | "analysis" | "multi-agent"

export interface ConversationMessage {
  id: string
  agentId: AgentId | "user" | "system"
  text: string
  type: "response" | "debate" | "agreement" | "override" | "user" | "system"
  timestamp: number
}

export interface DebateExchange {
  agentId: AgentId
  text: string
  type: "position" | "argument" | "counter" | "concession" | "resolution"
}

export interface Scenario {
  keywords: string[]
  category: CommandCategory
  primaryAgent: AgentId
  involvedAgents: AgentId[]
  hasDebate: boolean
  responses: ConversationMessage[]
  debate?: DebateExchange[]
}

let messageCounter = 0
function msgId(): string {
  return `msg-${Date.now()}-${messageCounter++}`
}

export const SCENARIOS: Scenario[] = [
  // 1. Inventory check with low stock alert
  {
    keywords: ["inventory", "stock", "what do we have", "inventory situation", "stock levels", "how much"],
    category: "query",
    primaryAgent: "inventory",
    involvedAgents: ["inventory", "logistics"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "inventory", text: "Running full inventory scan across all departments. We're tracking 2,847 SKUs currently. Overall stock health is at 87%.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "I've flagged 12 items below reorder threshold. Organic milk is critically low at 15 units -- that's 62% below safety stock. We also have fresh bread flour at 23 units, and cage-free eggs dropping fast.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "logistics", text: "I'm already on it. I've queued emergency restock orders for the top 5 critical items. Estimated delivery: 6 hours for dairy, 14 hours for dry goods. I've rerouted truck 7B from the downtown route to prioritize this.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "Good move. I'll set up automated monitoring on these 12 items with 4-hour check intervals until we're back to safe levels. I recommend we also increase the safety stock multiplier for dairy products -- we've had three stockout events this month.", type: "response", timestamp: 0 },
    ],
  },
  // 2. Dynamic pricing with debate
  {
    keywords: ["sale", "discount", "promotion", "overstock", "clearance", "15%", "mark down", "reduce price"],
    category: "directive",
    primaryAgent: "pricing",
    involvedAgents: ["pricing", "inventory", "customer"],
    hasDebate: true,
    responses: [
      { id: msgId(), agentId: "system", text: "Command received. Routing to Pricing, Inventory, and Customer Service agents for multi-perspective analysis.", type: "system", timestamp: 0 },
      { id: msgId(), agentId: "pricing", text: "I've identified 34 overstock items across 6 categories. A 15% markdown would reduce holding costs by $4,200 this week. The highest impact items are seasonal beverages, imported snacks, and organic produce nearing shelf-life dates.", type: "response", timestamp: 0 },
    ],
    debate: [
      { agentId: "inventory", text: "Hold on -- I need to flag a concern. Three of those items are in our top-20 sellers. If we discount organic almond milk, we'll clear current stock in 2 days, but our next shipment doesn't arrive for 5 days. That's a 3-day stockout risk.", type: "position" },
      { agentId: "pricing", text: "I hear you, but the holding cost on those seasonal beverages is $180 per day. Every day we wait, margin erodes further. I suggest we apply the full 15% to low-velocity items and a smaller 8% to the high-demand products.", type: "argument" },
      { agentId: "customer", text: "I want to weigh in here. Our loyalty members expect consistent availability of organic almond milk -- it's in the top 5 most-purchased items for Gold tier. A stockout would trigger an estimated 23 customer complaints based on historical data.", type: "counter" },
      { agentId: "inventory", text: "Agreed with Customer Service. What if we split it: full 15% on the 28 slow-movers, 5% on the 6 popular items, and I'll expedite a restock order to close the gap?", type: "concession" },
      { agentId: "pricing", text: "That's a reasonable compromise. We'd still recover $3,400 in holding costs while maintaining stock continuity. I'll prepare the price matrix with those tiers. Ready to execute on your approval.", type: "resolution" },
    ],
  },
  // 3. Maintenance analysis
  {
    keywords: ["maintenance", "equipment", "cooler", "broken", "repair", "health", "why", "changed", "price change"],
    category: "analysis",
    primaryAgent: "maintenance",
    involvedAgents: ["maintenance", "pricing", "inventory"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "maintenance", text: "Let me pull up the equipment health dashboard. We have 42 monitored units. Cooler Unit 3 in Aisle B has dropped to 34% health -- its compressor is showing abnormal vibration patterns that predict failure within 72 hours.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "maintenance", text: "I've already scheduled a preemptive replacement for tomorrow at 6 AM, before store opening. The replacement compressor is in warehouse stock. Total downtime estimate: 2.5 hours.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "pricing", text: "That explains the price adjustment you may have noticed. I proactively moved 8 perishable items from Cooler Unit 3 to a dynamic discount tier -- 12% off to accelerate sales before the maintenance window. Better to sell at a discount than risk spoilage.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "I've flagged those 8 items for priority tracking. If the maintenance runs longer than expected, I have contingency orders queued with our secondary cold-storage supplier. We won't lose product.", type: "response", timestamp: 0 },
    ],
  },
  // 4. Customer complaint resolution
  {
    keywords: ["customer", "complaint", "service", "loyalty", "satisfaction", "feedback", "unhappy"],
    category: "query",
    primaryAgent: "customer",
    involvedAgents: ["customer", "inventory", "logistics"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "customer", text: "Current customer satisfaction is at 4.2 out of 5.0 -- down 0.3 points this week. I've identified the root cause: 67% of negative feedback mentions product availability issues, specifically in the dairy and bakery sections.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "customer", text: "I've already implemented two immediate actions: First, proactive SMS notifications to loyalty members when their preferred items are restocked. Second, a 10% goodwill credit for Gold tier members who experienced stockouts.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "The availability issues trace back to our supplier delay last Tuesday. I've diversified our dairy suppliers from 2 to 4 to prevent this from happening again. Projected stockout probability drops from 12% to 3%.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "logistics", text: "I've also added a buffer delivery slot on Tuesdays and Fridays for high-demand perishables. This adds $340 in weekly logistics cost but eliminates the most common gap window.", type: "response", timestamp: 0 },
    ],
  },
  // 5. Logistics rerouting with cost debate
  {
    keywords: ["delivery", "route", "shipping", "logistics", "truck", "transport", "reroute"],
    category: "directive",
    primaryAgent: "logistics",
    involvedAgents: ["logistics", "pricing", "maintenance"],
    hasDebate: true,
    responses: [
      { id: msgId(), agentId: "logistics", text: "Current fleet status: 8 trucks active, 2 in maintenance. Today's delivery efficiency is at 78% -- below our 85% target. The bottleneck is Route 7, which has a 40-minute delay from road construction.", type: "response", timestamp: 0 },
    ],
    debate: [
      { agentId: "logistics", text: "I propose rerouting trucks 4 and 6 through the Highway 9 corridor. It adds 12 miles but saves 35 minutes per trip. Net fuel cost increase: $89 per day.", type: "position" },
      { agentId: "pricing", text: "That $89 daily increase concerns me. Over a month, we're looking at $2,670 in extra logistics costs. Can we offset by consolidating some of the smaller deliveries?", type: "argument" },
      { agentId: "maintenance", text: "I need to flag that Truck 6 is due for tire rotation in 200 miles. Adding highway miles will accelerate that. I'd rather we use Truck 3 instead -- it just had a full service.", type: "counter" },
      { agentId: "logistics", text: "Good catch on Truck 6. Revised plan: Trucks 3 and 4 on the Highway 9 reroute, and I'll batch the smaller deliveries as Pricing suggested. That brings the extra cost down to $52 per day while recovering our delivery targets.", type: "resolution" },
    ],
  },
  // 6. Staff hours reduction debate
  {
    keywords: ["staff", "hours", "reduce", "cut", "schedule", "labor", "workforce", "payroll"],
    category: "directive",
    primaryAgent: "logistics",
    involvedAgents: ["logistics", "customer", "maintenance"],
    hasDebate: true,
    responses: [
      { id: msgId(), agentId: "logistics", text: "Current labor allocation: 142 staff hours per day across all departments. I've identified 18 hours of overlap in the 2-5 PM window where we're overstaffed relative to customer traffic.", type: "response", timestamp: 0 },
    ],
    debate: [
      { agentId: "logistics", text: "Reducing 18 hours in the low-traffic window saves $1,890 per week in labor costs. I recommend shifting 12 of those hours to the 10 AM - 1 PM peak instead of cutting them entirely.", type: "position" },
      { agentId: "customer", text: "I strongly oppose cutting all afternoon staff. Our data shows 2-5 PM is when elderly and loyalty Gold customers prefer to shop -- they value the personal attention. Cutting staff here would disproportionately impact our highest-value segment.", type: "counter" },
      { agentId: "maintenance", text: "From my perspective, the 2-5 PM window is critical for shelf restocking and minor equipment checks. If we reduce staff there, cleaning and maintenance tasks get pushed to evening hours, increasing overtime costs by an estimated $400 per week.", type: "argument" },
      { agentId: "logistics", text: "Both valid points. Let me revise: we shift 8 hours to the morning peak, keep 6 hours in the afternoon for customer-facing roles, and redistribute 4 hours to evening maintenance. Net savings drops to $1,050 per week but we maintain service quality.", type: "resolution" },
    ],
  },
  // 7. Budget allocation debate
  {
    keywords: ["budget", "allocat", "spending", "money", "cost", "expenses", "financial"],
    category: "multi-agent",
    primaryAgent: "pricing",
    involvedAgents: ["pricing", "inventory", "maintenance", "customer", "logistics"],
    hasDebate: true,
    responses: [
      { id: msgId(), agentId: "pricing", text: "Q4 budget review: We have $45,000 in discretionary budget remaining. I recommend allocating 40% to promotional campaigns for the holiday season -- our competitors are already running aggressive Black Friday prep.", type: "response", timestamp: 0 },
    ],
    debate: [
      { agentId: "maintenance", text: "I need to request $12,000 for critical HVAC upgrades. Two units are running at 60% efficiency -- if they fail during holiday rush, we lose an estimated $8,000 per day in spoiled inventory and customer walkouts.", type: "position" },
      { agentId: "inventory", text: "I need at least $8,000 to pre-stock seasonal items. Last year we missed $32,000 in sales because holiday inventory arrived too late. This year I want to order 3 weeks early.", type: "argument" },
      { agentId: "customer", text: "Our loyalty program renewal is due. $5,000 keeps the current tier, but $9,000 unlocks the premium analytics module that would give all of us better demand forecasting.", type: "counter" },
      { agentId: "logistics", text: "I need $6,000 for seasonal temp delivery drivers. Without them, delivery windows stretch to 3 days during peak -- our promise is same-day.", type: "argument" },
      { agentId: "pricing", text: "Total requests: $35,000 minimum. Here's my proposed allocation: Maintenance $12K as it's safety-critical, Inventory $8K for early ordering, Loyalty $9K for the premium module since it benefits everyone, Logistics $6K for temp drivers, and I'll work with the remaining $10K for targeted promotions instead of broad campaigns.", type: "resolution" },
    ],
  },
  // 8. Emergency equipment failure
  {
    keywords: ["emergency", "failure", "urgent", "critical", "alarm", "alert", "broken down"],
    category: "query",
    primaryAgent: "maintenance",
    involvedAgents: ["maintenance", "inventory", "logistics", "customer"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "maintenance", text: "ALERT: Refrigeration Unit 7 in the dairy section just triggered a critical temperature alarm. Internal temp rising from 38F to 47F. We have approximately 4 hours before perishable goods are compromised.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "maintenance", text: "I've dispatched an emergency repair request. Our on-call technician can arrive in 90 minutes. In the meantime, I'm activating the backup cooling protocol -- redistributing cooling load to adjacent units.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "I'm flagging 47 dairy SKUs in Unit 7 for emergency relocation. We have 30% spare capacity in Cooler Units 2 and 5. I need staff to physically move high-value items within the next 45 minutes.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "logistics", text: "I'm holding today's dairy delivery at the warehouse in cold storage until Unit 7 is confirmed repaired. No point delivering product we can't properly store. I'll release it once Maintenance gives the all-clear.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "customer", text: "I'm preparing customer communications. Dairy section shoppers in the next 4 hours will receive a 15% courtesy discount on dairy items from the unaffected coolers. Our messaging: we caught the issue early and took immediate action.", type: "response", timestamp: 0 },
    ],
  },
  // 9. Seasonal demand prep
  {
    keywords: ["season", "holiday", "prepare", "forecast", "demand", "plan ahead", "upcoming"],
    category: "analysis",
    primaryAgent: "inventory",
    involvedAgents: ["inventory", "pricing", "customer", "logistics"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "inventory", text: "Seasonal forecast analysis complete. Based on 3 years of historical data, we're entering our highest-demand period. Projected demand increase: 34% in dairy, 52% in bakery, 28% in beverages, and 41% in snacks.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "inventory", text: "I've already pre-positioned orders for the top 50 seasonal SKUs with a 3-week lead time. Safety stock multipliers have been increased from 1.5x to 2.2x for all category A items.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "pricing", text: "I've prepared a seasonal pricing strategy: premium positioning on exclusive holiday items with 18% higher margins, competitive matching on staples to drive foot traffic, and bundle deals that pair high-margin with high-volume items.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "customer", text: "Loyalty program is ramped up. I've segmented our 12,000 members into 4 holiday personas and prepared targeted promotions for each. Early-bird SMS campaigns launch in 48 hours.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "logistics", text: "Fleet preparation: I've reserved 3 additional temp delivery vehicles for the peak 2-week window. Delivery routes are reconfigured to handle 40% more stops. Warehouse receiving bays are cleared and ready for the incoming bulk orders.", type: "response", timestamp: 0 },
    ],
  },
  // 10. New product launch
  {
    keywords: ["new product", "launch", "introduce", "new item", "add product", "bring in"],
    category: "directive",
    primaryAgent: "inventory",
    involvedAgents: ["inventory", "pricing", "customer", "logistics"],
    hasDebate: false,
    responses: [
      { id: msgId(), agentId: "inventory", text: "New product onboarding initiated. I need the product details to set up SKU tracking, but based on similar launches, I recommend an initial order of 200 units with a 4-week evaluation period before scaling.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "pricing", text: "For new product pricing, I'll run a competitive analysis against similar items in our catalog and 3 local competitors. My initial recommendation: launch at market price for 2 weeks to establish baseline velocity, then optimize based on actual demand data.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "customer", text: "I'll set up a new product spotlight in our loyalty app. First-week exclusive access for Gold and Platinum members drives 3x initial trial rates based on our last 5 launches. I'll also configure post-purchase surveys to gather early feedback.", type: "response", timestamp: 0 },
      { id: msgId(), agentId: "logistics", text: "Shelf space allocation: I'll work with the planogram to identify optimal placement. For new products, end-cap positioning in the first 2 weeks generates 67% more visibility. I'll coordinate the display setup with the overnight stocking team.", type: "response", timestamp: 0 },
    ],
  },
]

// Fallback for unrecognized commands
export const FALLBACK_RESPONSES: ConversationMessage[] = [
  { id: msgId(), agentId: "system", text: "Analyzing your request across all agents...", type: "system", timestamp: 0 },
  { id: msgId(), agentId: "inventory", text: "I've checked inventory systems but this request doesn't match my operational domain. Let me defer to the other agents.", type: "response", timestamp: 0 },
  { id: msgId(), agentId: "pricing", text: "I don't have a direct action for this command, but I'm monitoring for any pricing implications. Could you be more specific about what aspect of store operations you'd like to address?", type: "response", timestamp: 0 },
]

export function matchScenario(command: string): Scenario | null {
  const lower = command.toLowerCase()
  let bestMatch: Scenario | null = null
  let bestScore = 0

  for (const scenario of SCENARIOS) {
    let score = 0
    for (const keyword of scenario.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length // longer keyword matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = scenario
    }
  }

  return bestMatch
}
