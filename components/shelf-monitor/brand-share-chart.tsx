'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

interface BrandShareChartProps {
  brands: Array<{ name: string; percentage: number; color: string }>
}

export function BrandShareChart({ brands }: BrandShareChartProps) {
  const data = brands.map((brand) => ({
    name: brand.name,
    value: brand.percentage,
    color: brand.color,
  }))

  return (
    <Card className="p-6 flex flex-col">
      <h3 className="font-semibold text-foreground mb-6">Brand Share Distribution</h3>
      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, 'Share']}
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #262626',
                borderRadius: '8px',
                color: '#e5e5e5',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ paddingLeft: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
