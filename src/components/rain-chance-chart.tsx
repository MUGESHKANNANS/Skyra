
"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts"
import { Droplet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { HourlyForecast } from "@/lib/types"

interface RainChanceChartProps {
  data: HourlyForecast[];
}

const chartConfig = {
  precipitation: {
    label: "Rain Chance (%)",
    color: "hsl(var(--chart-2))",
  },
}

export function RainChanceChart({ data }: RainChanceChartProps) {
  const chartData = data.map(item => ({
    time: item.time,
    precipitation: item.precipitation,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rain Chance</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
                <XAxis
                    dataKey="time"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis hide domain={[0, 100]} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        hideLabel 
                        hideIndicator
                        formatter={(value, name, props) => (
                           <div className="flex items-center gap-2">
                                <Droplet className="w-4 h-4" style={{ color: "hsl(var(--chart-2))" }} />
                                <div>
                                    <p className="font-bold">{value}%</p>
                                    <p className="text-xs">{props.payload.time}</p>
                                </div>
                           </div>
                        )}
                    />}
                />
                <Bar
                    dataKey="precipitation"
                    fill={chartConfig.precipitation.color}
                    radius={5}
                >
                  <LabelList
                    dataKey="precipitation"
                    position="top"
                    offset={8}
                    className="fill-foreground text-xs"
                    formatter={(value: number) => `${value}%`}
                  />
                </Bar>
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
