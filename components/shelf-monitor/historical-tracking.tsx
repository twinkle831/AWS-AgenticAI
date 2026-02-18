'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'

export function HistoricalTracking() {
  // Mock historical data
  const historicalData = [
    { date: 'Jan 15', 'Coca-Cola': 36, 'Pepsi': 32, 'Dr Pepper': 19, 'Sprite': 13 },
    { date: 'Jan 22', 'Coca-Cola': 37, 'Pepsi': 31, 'Dr Pepper': 19, 'Sprite': 13 },
    { date: 'Jan 29', 'Coca-Cola': 38, 'Pepsi': 30, 'Dr Pepper': 18, 'Sprite': 14 },
    { date: 'Feb 5', 'Coca-Cola': 38, 'Pepsi': 31, 'Dr Pepper': 18, 'Sprite': 13 },
    { date: 'Feb 12', 'Coca-Cola': 38, 'Pepsi': 31, 'Dr Pepper': 19, 'Sprite': 12 },
    { date: 'Feb 19', 'Coca-Cola': 38, 'Pepsi': 31, 'Dr Pepper': 18, 'Sprite': 13 },
  ]

  const shelfHistory = [
    {
      id: 'SHELF-001',
      date: 'Feb 19, 2025',
      location: 'Aisle 3A',
      topBrand: 'Coca-Cola',
      topBrandShare: '38%',
      issues: 2,
      status: 'warning',
    },
    {
      id: 'SHELF-002',
      date: 'Feb 18, 2025',
      location: 'Aisle 5B',
      topBrand: 'Pepsi',
      topBrandShare: '42%',
      issues: 0,
      status: 'success',
    },
    {
      id: 'SHELF-003',
      date: 'Feb 17, 2025',
      location: 'Aisle 2C',
      topBrand: 'Coca-Cola',
      topBrandShare: '40%',
      issues: 1,
      status: 'warning',
    },
    {
      id: 'SHELF-004',
      date: 'Feb 16, 2025',
      location: 'Aisle 8D',
      topBrand: 'Sprite',
      topBrandShare: '35%',
      issues: 0,
      status: 'success',
    },
    {
      id: 'SHELF-005',
      date: 'Feb 15, 2025',
      location: 'Aisle 4E',
      topBrand: 'Dr Pepper',
      topBrandShare: '25%',
      issues: 3,
      status: 'danger',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-6">Brand Share Trends Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                  color: '#e5e5e5',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Coca-Cola"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Pepsi"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Dr Pepper"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Sprite"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Scans */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Shelf Scans</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Shelf ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Scan Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Top Brand</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Share</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Issues</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {shelfHistory.map((shelf) => (
                <tr key={shelf.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="py-4 px-4 font-mono text-xs text-primary">{shelf.id}</td>
                  <td className="py-4 px-4 text-foreground">{shelf.location}</td>
                  <td className="py-4 px-4 text-muted-foreground text-xs">{shelf.date}</td>
                  <td className="py-4 px-4 text-foreground font-medium">{shelf.topBrand}</td>
                  <td className="py-4 px-4 text-foreground font-semibold text-primary">
                    {shelf.topBrandShare}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        shelf.issues === 0
                          ? 'bg-success/10 text-success'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {shelf.issues} {shelf.issues === 1 ? 'issue' : 'issues'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        shelf.status === 'success'
                          ? 'bg-success/10 text-success'
                          : shelf.status === 'warning'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {shelf.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
