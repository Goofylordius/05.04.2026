"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactCurrency } from "@/lib/format";

type RevenueDatum = {
  month: string;
  revenue: number;
  forecast: number;
};

type SyncDatum = {
  label: string;
  success: number;
  pending: number;
};

type StageDatum = {
  stage: string;
  value: number;
};

type ForecastDatum = {
  week: string;
  pipeline: number;
};

export function RevenueForecastChart({ data }: { data: RevenueDatum[] }) {
  return (
    <ChartContainer
      className="h-[310px] w-full"
      config={{
        revenue: { label: "Ist", color: "var(--color-chart-1)" },
        forecast: { label: "Forecast", color: "var(--color-chart-2)" },
      }}
    >
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.32}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => formatCompactCurrency(value * 100)} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="revenue"
          fill="url(#revenueFill)"
          stroke="var(--color-revenue)"
          strokeWidth={2.5}
          type="monotone"
        />
        <Line
          dataKey="forecast"
          dot={false}
          stroke="var(--color-forecast)"
          strokeDasharray="6 4"
          strokeWidth={2}
          type="monotone"
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export function SyncObservabilityChart({ data }: { data: SyncDatum[] }) {
  return (
    <ChartContainer
      className="h-[280px] w-full"
      config={{
        success: { label: "Sync Erfolgsrate", color: "var(--color-chart-2)" },
        pending: { label: "Pending Events", color: "var(--color-chart-4)" },
      }}
    >
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="success"
          fill="var(--color-success)"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="pending"
          fill="var(--color-pending)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function DealMixChart({ data }: { data: StageDatum[] }) {
  return (
    <ChartContainer
      className="mx-auto h-[260px] max-w-[300px]"
      config={{
        lead: { label: "Lead", color: "var(--color-chart-5)" },
        qualified: { label: "Qualified", color: "var(--color-chart-4)" },
        proposal: { label: "Proposal", color: "var(--color-chart-3)" },
        negotiation: { label: "Negotiation", color: "var(--color-chart-2)" },
        won: { label: "Won", color: "var(--color-chart-1)" },
        lost: { label: "Lost", color: "oklch(0.68 0.22 25)" },
      }}
    >
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          innerRadius={62}
          outerRadius={96}
          paddingAngle={4}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}

export function ForecastMomentumChart({ data }: { data: ForecastDatum[] }) {
  return (
    <ChartContainer
      className="h-[280px] w-full"
      config={{
        pipeline: { label: "Forecast", color: "var(--color-chart-1)" },
      }}
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="week" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="pipeline"
          dot={{ r: 4 }}
          stroke="var(--color-pipeline)"
          strokeWidth={2.5}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  );
}
