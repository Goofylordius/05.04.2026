import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="border-border/60 flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">
          {eyebrow}
        </p>
        <div className="space-y-1">
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-6">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
