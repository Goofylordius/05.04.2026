import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import type { AuditLogEntry } from "@/lib/types";

type ActivityFeedProps = {
  entries: AuditLogEntry[];
};

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <Card className="surface-panel border-border/70 border">
      <CardHeader>
        <CardTitle>Aktivitaetsfeed</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-4">
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                className="border-border/70 bg-background/30 rounded-xl border p-3"
                key={entry.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-foreground text-sm font-medium">
                    {entry.action}
                  </p>
                  <span className="text-muted-foreground text-xs">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {entry.entityType}
                  {entry.entityId ? ` / ${entry.entityId}` : ""}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
