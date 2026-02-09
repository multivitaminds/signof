export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign<span className="text-accent">Of</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Living Commitments Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
