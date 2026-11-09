import type { Category } from "@spree/sdk";
import { Rabbit } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { isWholesaleEnabled } from "@/lib/spree";
import { CurrentYear } from "./CurrentYear";

const storeName = "TOKI";

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.map((category) => (
    <li key={category.id}>
      <Link
        href={`${basePath}/c/${category.permalink}`}
        className="text-sm text-primary-100 transition-colors hover:text-white"
      >
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const t = await getTranslations({
    locale,
    namespace: "footer",
  });

  const tp = await getTranslations({
    locale,
    namespace: "policies",
  });

  const wholesaleEnabled = isWholesaleEnabled();

  return (
    <footer className="bg-primary-900 text-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* TOKI - Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="font-display inline-flex items-center gap-2 text-2xl font-semibold text-white">
              <Rabbit className="size-5 text-primary-200" aria-hidden="true" />
              {storeName}
            </span>

            <p className="mt-4 text-sm text-primary-100">{t("description")}</p>
          </div>

          {/* Magazin */}
          <div>
            <h3 className="text-sm font-medium text-primary-100">
              {t("shop")}
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/products`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("allProducts")}
                </Link>
              </li>

              {categoryLinks}
            </ul>
          </div>

          {/* Contul meu */}
          <div>
            <h3 className="text-sm font-medium text-primary-100">
              {t("account")}
            </h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/account`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("myAccount")}
                </Link>
              </li>

              <li>
                <Link
                  href={`${basePath}/account/orders`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("orderHistory")}
                </Link>
              </li>

              <li>
                <Link
                  href={`${basePath}/cart`}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {t("cart")}
                </Link>
              </li>

              {wholesaleEnabled && (
                <li>
                  <Link
                    href={`${basePath}/wholesale`}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {t("wholesale")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Informatii utile */}
          <div>
            <h3 className="text-sm font-medium text-primary-100">
              {t("policies")}
            </h3>

            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((policy) => (
                <li key={policy.slug}>
                  <Link
                    href={`${basePath}/policies/${policy.slug}`}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    {tp(policy.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/15 pt-8 text-center text-xs text-primary-200">
          <p>
            © <CurrentYear /> {storeName}. Toate drepturile rezervate.
          </p>
        </div>
      </div>
    </footer>
  );
}
