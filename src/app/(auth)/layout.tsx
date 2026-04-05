export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="bg-primary/15 absolute top-0 left-0 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-accent/10 absolute right-0 bottom-0 h-72 w-72 rounded-full blur-3xl" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
