import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ScrollLink } from "@/components/ScrollLink";
import { ehsLinkClass } from "@/lib/ehs-classes";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-ehs-light-bg min-h-screen">
      <header className="border-ehs-border border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" aria-label="Neptune home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <article className="text-ehs-gray flex flex-col gap-8 text-sm leading-relaxed">
          {children}
        </article>
      </main>

      <footer className="border-ehs-border border-t px-6 py-6 text-center">
        <p className="text-ehs-muted-text text-sm">
          <ScrollLink href="/tos" className={ehsLinkClass}>
            Terms & Conditions
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
