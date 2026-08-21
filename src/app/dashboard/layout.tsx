import { AppShell } from "@/components/AppShell";
import { RequireCapability } from "@/components/auth/RequireCapability";

/**
 * Every dashboard route, guarded in one place.
 *
 * `RequireCapability` reads the requirement from the nav entry the current path belongs to,
 * so a route and its sidebar item are gated by the same rule and cannot drift apart. Routes
 * with no nav entry behind them — the profile pages, Settings, Chat — carry no capability
 * and pass through, which is correct: every user needs them.
 *
 * It sits inside `AppShell` so a refused page keeps its sidebar and header. Someone who has
 * landed somewhere they cannot go needs the navigation to leave, not a bare page.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      <RequireCapability>{children}</RequireCapability>
    </AppShell>
  );
}
