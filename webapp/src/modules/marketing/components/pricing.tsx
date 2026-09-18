import { ArrowDown, ArrowRight, Check, Minus, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaqSection } from "@/modules/marketing/components/faq";
import { Section } from "@/modules/marketing/components/section";
import {
  COMPARISON_ROWS,
  FAMILY_CIRCLE,
  FAMILY_PLAN,
  INDIVIDUAL_PLANS,
  ORG_PLANS,
  ORG_PRICING_DISCLAIMER,
  PRICING_FAQS,
  SPONSORED_CAPABILITIES,
  SPONSORED_STEPS,
} from "@/modules/marketing/pricing-config";

function PlanCard({
  name,
  monthlyLabel,
  period,
  annualLabel,
  subtitle,
  badge,
  featured,
  cta,
  href,
  includesPrior,
  features,
}: {
  name: string;
  monthlyLabel: string;
  period: string;
  annualLabel?: string | null;
  subtitle: string;
  badge?: string | null;
  featured?: boolean;
  cta: string;
  href: string;
  includesPrior?: string;
  features: readonly string[];
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-[16px] border bg-white p-6 sm:p-7",
        featured
          ? "border-[#2563EB] shadow-[0_8px_30px_rgba(37,99,235,0.12)] ring-1 ring-[#2563EB]/20"
          : "border-[rgba(15,23,42,0.08)] shadow-[0_1px_3px_rgba(15,23,42,0.06)]",
      )}
    >
      <div className="flex min-h-8 items-start justify-between gap-2">
        <h3 className="font-display text-xl font-semibold tracking-tight text-[#0F172A]">
          {name}
        </h3>
        {badge ? (
          <span className="rounded-full bg-[#2563EB]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#2563EB]">
            {badge}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-[#64748B]">{subtitle}</p>
      <p className="mt-5 font-display text-4xl font-semibold tracking-tight text-[#0F172A]">
        {monthlyLabel}
        {period ? (
          <span className="ml-1 text-base font-normal text-[#64748B]">
            {period}
          </span>
        ) : null}
      </p>
      {annualLabel ? (
        <p className="mt-1 text-sm text-[#64748B]">
          {annualLabel}
          <span className="ml-1 text-xs">Save with annual billing.</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-transparent">.</p>
      )}
      <Link
        to={href}
        className={cn(
          buttonVariants({ variant: featured ? "default" : "outline" }),
          "mt-6 w-full rounded-[14px]",
        )}
      >
        {cta}
      </Link>
      {includesPrior ? (
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          {includesPrior}
        </p>
      ) : (
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
          Includes
        </p>
      )}
      <ul className="mt-3 flex-1 space-y-2.5 text-sm text-[#0F172A]/85">
        {features.map((f) => (
          <li key={f} className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function PricingSection() {
  return (
    <div>
      <section className="relative overflow-hidden pb-12 pt-8 sm:pb-16 sm:pt-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_-10%,rgba(37,99,235,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_0%,rgba(20,184,166,0.10),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
            Healthcare continuity should be accessible to everyone.
          </p>
          <h1 className="font-display mx-auto mt-3 max-w-3xl text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
            Healthcare that stays with you.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#64748B] sm:text-lg">
            Affordable continuity-of-care support for patients, families and
            healthcare organizations.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#64748B]">
            From daily care and medication reminders to AI-powered assistance
            and caregiver support, HealNexus helps keep healthcare connected
            beyond hospital walls.
          </p>
          <p className="mt-5 text-xs font-medium tracking-wide text-[#0F172A]/70">
            AI-assisted · Doctor-supervised · Privacy-conscious
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className={cn(buttonVariants({ size: "lg" }), "rounded-[14px]")}
            >
              Get Started Free
            </Link>
            <a
              href="#individual-plans"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-[14px]",
              )}
            >
              Explore Plans
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <Section
        id="individual-plans"
        eyebrow="For Individuals"
        title="Start free. Upgrade when you need more personalized assistance."
        description="₹0 for essential care · ₹99 for personal AI support · ₹199 for the family."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {INDIVIDUAL_PLANS.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      </Section>

      <Section
        id="compare"
        eyebrow="Compare"
        title="What’s included"
        description="A simple view of Free, Care and Family."
      >
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[520px] border-collapse overflow-hidden rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-white text-sm">
            <thead>
              <tr className="border-b border-[rgba(15,23,42,0.08)] bg-[#FAFCFF] text-left">
                <th className="px-4 py-3 font-semibold text-[#0F172A]">
                  Feature
                </th>
                <th className="px-4 py-3 font-semibold text-[#0F172A]">Free</th>
                <th className="px-4 py-3 font-semibold text-[#2563EB]">Care</th>
                <th className="px-4 py-3 font-semibold text-[#0F172A]">
                  Family
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-[rgba(15,23,42,0.06)] last:border-0"
                >
                  <td className="px-4 py-2.5 text-[#0F172A]">{row.feature}</td>
                  <td className="px-4 py-2.5">
                    <Cell on={row.free} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Cell on={row.care} />
                  </td>
                  <td className="px-4 py-2.5">
                    <Cell on={row.family} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <section
        id="family"
        className="scroll-mt-24 bg-[#F8FAFC] py-14 sm:py-16"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#14B8A6]">
              Family
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
              One family. One connected care circle.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#64748B] sm:text-base">
              Keep track of important care tasks for the people who matter to
              you — without taking control away from them.
            </p>
            <p className="mt-5 font-display text-2xl font-semibold text-[#0F172A]">
              {FAMILY_PLAN.monthlyLabel}
            </p>
            <p className="text-sm text-[#64748B]">{FAMILY_PLAN.seats}</p>
            <Link
              to={FAMILY_PLAN.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 rounded-[14px]",
              )}
            >
              Start Family Plan
            </Link>
          </div>
          <div className="rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-soft">
              <Users className="h-7 w-7" />
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-[#0F172A]">
              HealNexus
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {FAMILY_CIRCLE.map((role) => (
                <div
                  key={role}
                  className="rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-[#FAFCFF] px-3 py-4 text-center text-sm font-medium text-[#0F172A]"
                >
                  {role}
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-[#64748B]">
              Connected through HealNexus — each person keeps their own
              passport and care tasks.
            </p>
          </div>
        </div>
      </section>

      <Section
        id="organizations"
        eyebrow="For Hospitals & Healthcare Organizations"
        title="Extend your care beyond the hospital."
        description="Organization plans for clinics, hospitals and care networks."
      >
        <p className="mb-6 text-center text-xs text-[#64748B]">
          {ORG_PRICING_DISCLAIMER}
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {ORG_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              monthlyLabel={plan.priceLabel}
              period={plan.period}
              subtitle={plan.capacity}
              badge={plan.badge}
              featured={plan.featured}
              cta={plan.cta}
              href={plan.href}
              includesPrior={"includesPrior" in plan ? plan.includesPrior : undefined}
              features={plan.features}
            />
          ))}
        </div>
      </Section>

      <section
        id="sponsored"
        className="scroll-mt-24 py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-[16px] border border-[#14B8A6]/25 bg-gradient-to-br from-[#F0FDFA] to-white p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">
              Sponsored community access
            </p>
            <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-[#0F172A] sm:text-4xl">
              Healthcare access shouldn’t depend on income.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base">
              Designed for potential deployment through hospitals, NGOs, CSR
              programs and public-health initiatives that sponsor HealNexus
              access for underserved communities. We do not claim existing
              government partnerships.
            </p>
            <ol className="mt-8 grid gap-3 sm:grid-cols-4">
              {SPONSORED_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="relative rounded-[14px] border border-[rgba(15,23,42,0.08)] bg-white px-3 py-4 text-center text-sm font-medium text-[#0F172A]"
                >
                  <span className="mb-2 block text-xs font-semibold text-[#14B8A6]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SPONSORED_CAPABILITIES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-[#0F172A]"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 rounded-[14px]",
              )}
            >
              Partner with HealNexus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Section
        title="Built for real people, not just premium healthcare users."
        description="Organizations can sponsor access for communities that need additional support."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              price: "₹0",
              text: "Basic continuity of care remains accessible.",
            },
            {
              price: "₹99",
              text: "Advanced AI assistance for individual users.",
            },
            {
              price: "₹199",
              text: "Affordable family-centered care.",
            },
          ].map((item) => (
            <div
              key={item.price}
              className="rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-white p-5 text-center"
            >
              <p className="font-display text-3xl font-semibold text-[#2563EB]">
                {item.price}
              </p>
              <p className="mt-2 text-sm text-[#64748B]">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <FaqSection
        items={[...PRICING_FAQS]}
        eyebrow="FAQ"
        title="Common questions"
        description="Transparent answers about plans, AI, and what HealNexus does — and does not — do."
      />

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-[16px] bg-[#0F172A] px-6 py-12 text-center sm:px-12">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Care shouldn’t stop at discharge.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
              Start building a more connected healthcare journey with HealNexus.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex h-11 items-center rounded-[14px] bg-white px-6 text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center rounded-[14px] border border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                Talk to HealNexus
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/50">
              AI assists. Clinicians decide.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="h-4 w-4 text-emerald-600" aria-label="Included" />
  ) : (
    <Minus className="h-4 w-4 text-[#94A3B8]" aria-label="Not included" />
  );
}
