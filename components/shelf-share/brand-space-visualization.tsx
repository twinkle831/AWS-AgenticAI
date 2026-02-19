import type { BrandOccupancy } from "@/lib/types"

interface BrandSpaceVisualizationProps {
  brands: BrandOccupancy[]
}

export function BrandSpaceVisualization({ brands }: BrandSpaceVisualizationProps) {
  return (
    <div className="flex flex-col gap-4">
      {brands.map((brand) => (
        <div key={brand.brand_name} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{brand.brand_name}</span>
            <span className="text-sm font-bold text-primary">{brand.percentage}%</span>
          </div>
          <div className="h-8 w-full rounded-md bg-secondary/50 overflow-hidden border border-border">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${brand.percentage}%`,
                backgroundColor: brand.color,
              }}
            />
          </div>
        </div>
      ))}
      
      <div className="mt-4 p-4 rounded-lg bg-card border border-border/50">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Total Coverage</p>
        <div className="h-6 w-full rounded-md bg-secondary/50 overflow-hidden border border-border flex">
          {brands.map((brand) => (
            <div
              key={brand.brand_name}
              className="h-full transition-all duration-500"
              style={{
                width: `${brand.percentage}%`,
                backgroundColor: brand.color,
              }}
              title={`${brand.brand_name}: ${brand.percentage}%`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
