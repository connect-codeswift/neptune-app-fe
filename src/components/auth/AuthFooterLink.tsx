import { ScrollLink } from "@/components/ScrollLink";
import { ehsLinkClass } from "@/lib/ehs-classes";

export type AuthFooterLinkProps = Readonly<{
  /** The lead-in, e.g. "Don't have an account?" */
  prompt: string;
  href: string;
  linkLabel: string;
}>;

/** The cross-link under an auth card. Same type and spacing on all four screens. */
export function AuthFooterLink(props: Readonly<AuthFooterLinkProps>) {
  const { prompt, href, linkLabel } = props;

  return (
    <p className="text-ehs-muted-text text-center text-sm">
      {`${prompt} `}
      <ScrollLink href={href} className={`${ehsLinkClass} font-semibold`}>
        {linkLabel}
      </ScrollLink>
    </p>
  );
}
