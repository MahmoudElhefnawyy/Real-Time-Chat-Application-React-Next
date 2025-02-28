
import { ThemeToggle } from "./ThemeToggle";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Real-Time Chat</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
