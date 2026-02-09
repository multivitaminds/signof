export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-semibold tracking-tight">
          Sign<span className="text-accent">Of</span>
        </span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
