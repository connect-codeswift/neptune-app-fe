import { AppShell } from "@/components/AppShell";

export default function HazcomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
