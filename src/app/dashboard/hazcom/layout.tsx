import { HazcomShell } from "@/components/hazcom/shared/HazcomShell";

export default function HazcomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HazcomShell>{children}</HazcomShell>;
}
