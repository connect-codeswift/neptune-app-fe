import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScrollLink } from "@/components/ScrollLink";
import { ehsLinkClass } from "@/lib/ehs-classes";

type LegalPageLayoutProps = Readonly<{
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}>;

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-ehs-light-bg min-h-screen">
      <header className="border-ehs-border border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" aria-label="Neptune home">
            <Logo />
          </Link>
          <ScrollLink href="/signup" className={`${ehsLinkClass} font-medium`}>
            Back to sign up
          </ScrollLink>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-ehs-darker text-3xl font-bold">{title}</h1>
        <p className="text-ehs-muted-text mt-2 text-sm">
          Last updated: {lastUpdated}
        </p>
        <article className="text-ehs-gray mt-8 flex flex-col gap-8 text-sm leading-relaxed">
          {children}
        </article>
      </main>

      <footer className="border-ehs-border border-t px-6 py-6 text-center">
        <p className="text-ehs-muted-text text-sm">
          <ScrollLink href="/tos" className={ehsLinkClass}>
            Terms of Service
          </ScrollLink>
          {" · "}
          <ScrollLink href="/privacy" className={ehsLinkClass}>
            Privacy Policy
          </ScrollLink>
        </p>
      </footer>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section>
      <h2 className="text-ehs-darker mb-3 text-lg font-semibold">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
