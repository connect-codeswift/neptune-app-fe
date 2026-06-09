export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="bg-ehs-light-bg min-h-screen w-full">{children}</div>;
}
