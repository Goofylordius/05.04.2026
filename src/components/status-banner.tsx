type StatusBannerProps = {
  error?: string | string[] | undefined;
  message?: string | string[] | undefined;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function StatusBanner({ error, message }: StatusBannerProps) {
  const errorText = getFirstValue(error);
  const messageText = getFirstValue(message);

  return (
    <>
      {errorText ? (
        <div className="border-destructive/40 bg-destructive/10 text-foreground rounded-2xl border p-3 text-sm">
          {errorText}
        </div>
      ) : null}

      {messageText ? (
        <div className="border-primary/40 bg-primary/10 text-foreground rounded-2xl border p-3 text-sm">
          {messageText}
        </div>
      ) : null}
    </>
  );
}
