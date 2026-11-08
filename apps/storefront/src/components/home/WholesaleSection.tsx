import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { isWholesaleEnabled } from "@/lib/spree";

interface WholesaleSectionProps {
  basePath: string;
  locale: string;
}

/**
 * Trade portal pitch on the homepage. Static by design — no data fetching, so
 * the statically prerendered homepage stays static. The slate band matches the
 * wholesale portal's chrome, tying the two surfaces together.
 */
export async function WholesaleSection({
  basePath,
  locale,
}: WholesaleSectionProps) {
  // Opt-in addon: no wholesale pitch on DTC-only storefronts.
  if (!isWholesaleEnabled()) return null;

  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  const benefits = [
    {
      title: t("wholesaleBenefitPricingTitle"),
      description: t("wholesaleBenefitPricingDescription"),
    },
    {
      title: t("wholesaleBenefitQuickOrderTitle"),
      description: t("wholesaleBenefitQuickOrderDescription"),
    },
    {
      title: t("wholesaleBenefitOrdersTitle"),
      description: t("wholesaleBenefitOrdersDescription"),
    },
  ];

  return (
    <section className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Pitch + CTAs */}
          <div>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-primary-100">
              {t("wholesaleBadge")}
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white">
              {t("wholesaleTitle")}
            </h2>
            <p className="mt-4 text-primary-100">{t("wholesaleDescription")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                asChild
                className="bg-white text-primary-900 hover:bg-primary-50"
              >
                <Link href={`${basePath}/wholesale`}>
                  {t("wholesaleCtaPrimary")}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={`${basePath}/wholesale/apply`}>
                  {t("wholesaleCtaSecondary")}
                </Link>
              </Button>
            </div>
          </div>

          {/* What approved buyers get — two-up on tablets so it doesn't look sparse */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4"
              >
                <h3 className="font-semibold text-white">{benefit.title}</h3>
                <p className="mt-1 text-sm text-primary-100">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
