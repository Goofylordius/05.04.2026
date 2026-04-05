import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/types";

type MetricCardProps = {
  metric: DashboardMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.trend.startsWith("-") ? TrendingDown : TrendingUp;

  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center justify-between text-sm font-medium">
          {metric.label}
          <ArrowUpRight className="text-primary size-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-foreground text-3xl font-semibold tracking-tight">
          {metric.value}
        </div>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{metric.detail}</span>
          <span className="border-border/80 text-foreground inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <Icon className="size-3.5" />
            {metric.trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
