export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="@container relative h-screen w-full overflow-hidden">
      {children}
    </div>
  );
}
