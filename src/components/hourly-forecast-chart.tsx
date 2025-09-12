
"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HourlyForecast } from "@/lib/types"

interface HourlyForecastChartProps {
  data: HourlyForecast[];
}

const chartConfig = {
  temperature: {
    label: "Temp (°C)",
    color: "hsl(var(--chart-1))",
  },
  precipitation: {
    label: "Precipitation (%)",
    color: "hsl(var(--chart-2))",
  },
  wind: {
    label: "Wind (km/h)",
    color: "hsl(var(--chart-3))",
  },
}

export function HourlyForecastChart({ data }: HourlyForecastChartProps) {
  const [activeTab, setActiveTab] = React.useState<keyof typeof chartConfig>("temperature");

  const chartData = data.map(item => ({
    time: item.time,
    temperature: item.temp,
    precipitation: item.precipitation,
    wind: item.wind,
  }));

  const yAxisDomain = {
    temperature: [Math.min(...chartData.map(d => d.temperature)) - 5, Math.max(...chartData.map(d => d.temperature)) + 5],
    precipitation: [0, 100],
    wind: [0, Math.max(...chartData.map(d => d.wind)) + 5],
  }

  const renderTemperatureChart = () => {
    const tempValues = chartData.map(d => d.temperature);
    const minTemp = Math.min(...tempValues);
    const maxTemp = Math.max(...tempValues);

    const getColor = (temp: number) => {
        const range = maxTemp - minTemp;
        if (range === 0) return "#facc15"; // yellow
        const percentage = (temp - minTemp) / range;
        if (percentage < 0.33) return "#4ade80"; // green
        if (percentage < 0.66) return "#facc15"; // yellow
        return "#fb923c"; // orange
    }

    return (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={chartData}>
                <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="1" y2="0">
                        {chartData.map((d, i) => {
                             const offset = (i / (chartData.length - 1)) * 100;
                             return <stop key={i} offset={`${offset}%`} stopColor={getColor(d.temperature)} />
                        })}
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                />
                <YAxis 
                    domain={yAxisDomain.temperature} 
                    hide 
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }}
                    content={({ active, payload, label }) =>
                        active && payload && payload.length ? (
                        <div className="p-2 bg-background border rounded-lg shadow-lg">
                            <p className="font-bold text-lg">{`${payload[0].value}°C`}</p>
                            <p className="text-sm text-muted-foreground">{label}</p>
                        </div>
                        ) : null
                    }
                />
                <Line
                    dataKey="temperature"
                    type="natural"
                    stroke="url(#tempGradient)"
                    strokeWidth={3}
                    dot={({ cx, cy, payload }) => (
                        <circle cx={cx} cy={cy} r={5} fill={getColor(payload.temperature)} stroke="hsl(var(--background))" strokeWidth={2} />
                    )}
                    activeDot={({ cx, cy, payload }) => (
                        <circle cx={cx} cy={cy} r={7} fill={getColor(payload.temperature)} stroke="hsl(var(--background))" strokeWidth={2} />
                    )}
                />
            </LineChart>
      </ChartContainer>
    )
  }
  
  const renderOtherCharts = (datakey: "precipitation" | "wind") => (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <LineChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
            />
            <YAxis 
                domain={yAxisDomain[datakey]} 
                hide 
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent 
                    indicator="dot" 
                    formatter={(value, name) => (
                        <div className="flex flex-col">
                            <span className="font-semibold">{chartData.find(d => (d as any)[datakey] === value)?.time}</span>
                            <span>{`${chartConfig[name as keyof typeof chartConfig].label}: ${value}`}</span>
                        </div>
                    )}
                />}
            />
            <Line
                dataKey={datakey}
                type="natural"
                stroke={chartConfig[datakey].color}
                strokeWidth={2}
                dot={false}
            />
        </LineChart>
    </ChartContainer>
  )

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof typeof chartConfig)} className="w-full">
      <TabsList>
        <TabsTrigger value="temperature">Temperature</TabsTrigger>
        <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
        <TabsTrigger value="wind">Wind</TabsTrigger>
      </TabsList>
      <TabsContent value="temperature" className="pt-4">
        {renderTemperatureChart()}
      </TabsContent>
       <TabsContent value="precipitation" className="pt-4">
        {renderOtherCharts("precipitation")}
      </TabsContent>
       <TabsContent value="wind" className="pt-4">
        {renderOtherCharts("wind")}
      </TabsContent>
    </Tabs>
  )
}
