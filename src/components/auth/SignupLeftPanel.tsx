import { Icon } from "@iconify/react";
import { Logo } from "../Logo";
import { ShadeBall } from "../ShadeBall";

const features = [
  {
    title: "Incident Management",
    description: "Report and close incidents faster",
  },
  {
    title: "Compliance Audits",
    description: "300+ templates, audit-ready instantly",
  },
  {
    title: "Sustainability & ESG",
    description: "Track emissions, generate GRI reports",
  },
  {
    title: "SOC 2 Type II",
    description: "Enterprise-grade security, always on",
  },
] as const;

export default function SignupLeftPanel() {
  return (
    <div className="from-ehs-light-blue to-ehs-light-blue/60 scrollbar-hidden relative hidden h-full flex-col justify-center bg-linear-to-br via-white p-8 lg:flex">
      <ShadeBall
        positionAsClassName="bottom-[-150px] right-[-150px]"
        blur={120}
      />
      <div className="relative z-10 flex flex-col gap-6">
        <Logo />

        <div className="flex max-w-sm flex-col gap-6">
          <h1 className="text-ehs-darker md:tex-2xl text-xl leading-tight font-bold lg:text-3xl">
            Safety management, finally unified.
          </h1>
          <p className="text-ehs-muted-text text-sm leading-relaxed">
            Join 2,400+ sites using Neptune to manage incidents, audits, CAPAs,
            and sustainability — all in one place.
          </p>
        </div>

        <ul className="flex max-w-lg flex-col gap-3">
          {features.map((item) => (
            <li key={item.title} className="flex flex-col gap-1">
              <p className="text-ehs-darker text-sm font-semibold">
                {item.title}
              </p>
              <p className="text-ehs-muted-text text-sm">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ehs-normal-blue/15 relative z-10 mt-2 rounded-xl px-3 py-3 backdrop-blur-lg">
        <p className="text-ehs-darker text-sm font-semibold">
          30-day free trial, full access
        </p>
        <p className="text-ehs-muted-text mt-1 text-sm">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
