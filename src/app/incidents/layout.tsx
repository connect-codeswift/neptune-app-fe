import { AppShell } from "@/components/AppShell";

export default function IncidentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
