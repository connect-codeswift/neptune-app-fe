import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-ehs-light-bg flex min-h-screen">
      <Sidebar />
      {children}
    </div>
  );
}
