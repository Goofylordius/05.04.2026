"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

type RingMetricProps = {
  label: string;
  value: number;
  helper: string;
};

export function RingMetric({ label, value, helper }: RingMetricProps) {
  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ChartContainer
          className="mx-auto max-w-[220px]"
          config={{
            value: {
              label,
              color: "var(--color-chart-1)",
            },
          }}
        >
          <RadialBarChart
            cx="50%"
            cy="50%"
            data={[{ name: label, value, fill: "var(--color-value)" }]}
            endAngle={90}
            innerRadius={68}
            outerRadius={104}
            startAngle={450}
          >
            <PolarAngleAxis domain={[0, 100]} tick={false} type="number" />
            <RadialBar background cornerRadius={18} dataKey="value" />
          </RadialBarChart>
        </ChartContainer>
        <div className="text-center">
          <p className="text-foreground text-4xl font-semibold">{value}%</p>
          <p className="text-muted-foreground mt-1 text-sm">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}
