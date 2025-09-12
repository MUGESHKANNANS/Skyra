
"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, YAxis, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { Forecast } from "@/lib/types"

interface ForecastChartProps {
  data: Forecast[];
}

const chartConfig = {
  temp_max: {
    label: "High (°C)",
    color: "hsl(var(--destructive))",
  },
  temp_min: {
    label: "Low (°C)",
    color: "hsl(var(--chart-2))",
  },
}

export function ForecastChart({ data }: ForecastChartProps) {
    const chartData = data.map(item => ({
        ...item,
        day: new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    }));
  
    const yDomain = [
        Math.min(...chartData.map(d => d.temp_min)) - 5,
        Math.max(...chartData.map(d => d.temp_max)) + 5
    ];

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                />
                <YAxis
                    domain={yDomain}
                    tickFormatter={(value) => `${value}°C`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={50}
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2, strokeDasharray: "3 3" }}
                    content={<ChartTooltipContent 
                        formatter={(value, name) => `${value}°C`}
                        labelFormatter={(label) => {
                            const fullDate = chartData.find(d => d.day === label);
                            if (fullDate) {
                                return new Date(fullDate.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
                            }
                            return label;
                        }}
                    />}
                />
                <Legend content={<ChartLegendContent />} />
                <Line
                    dataKey="temp_max"
                    type="monotone"
                    stroke={chartConfig.temp_max.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartConfig.temp_max.color }}
                    activeDot={{ r: 6 }}
                    name="High"
                />
                <Line
                    dataKey="temp_min"
                    type="monotone"
                    stroke={chartConfig.temp_min.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartConfig.temp_min.color }}
                    activeDot={{ r: 6 }}
                    name="Low"
                />
            </LineChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
