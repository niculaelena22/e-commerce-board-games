import { Dices, Heart, Rabbit, Spade } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getStoreName } from "@/lib/store";

interface HeroSectionProps {
  basePath: string;
  locale: string;
}

export async function HeroSection({ basePath, locale }: HeroSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const storeName = getStoreName();

  return (
    <section className="home-hero-pattern relative isolate overflow-hidden border-b border-primary-100 bg-[#eef6fa]">
      <div className="container mx-auto grid items-center gap-6 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8 md:min-h-[500px] md:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)] md:gap-10 md:py-12 lg:px-8">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-primary-800 shadow-sm">
            <Rabbit className="size-4 text-[#c67c73]" aria-hidden="true" />
            {t("qualityProducts")}
          </div>
          <h1 className="font-display mt-5 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
            {t("welcome", { storeName })}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-gray-600 md:text-lg">
            {t("heroDescription")}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild className="rounded-full px-6 shadow-sm">
              <Link href={`${basePath}/products`}>{t("shopNow")}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-full border-primary-200 bg-white/80 px-6 text-primary-800 hover:bg-primary-50"
            >
              <Link href="#featured-games">{t("featuredProducts")}</Link>
            </Button>
          </div>
        </div>

        <div
          className="relative mx-auto aspect-[1.4/1] w-full max-w-[520px] md:aspect-[1.15/1]"
          aria-hidden="true"
        >
          <div className="absolute inset-[8%] rotate-[-3deg] rounded-[30px] border-[8px] border-white/80 bg-[#d7eaf1] p-3 shadow-[0_24px_60px_rgb(45_77_94/16%)] sm:p-4">
            <div className="grid h-full grid-cols-4 grid-rows-3 gap-2 sm:gap-3">
              {Array.from({ length: 12 }, (_, index) => {
                const isStart = index === 0;
                const isFinish = index === 11;
                const colors = [
                  "bg-[#f8e6dc]",
                  "bg-white/80",
                  "bg-[#e9f1e8]",
                  "bg-[#f8f3df]",
                ];
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center rounded-xl border border-white/80 text-sm font-semibold text-primary-800 sm:rounded-2xl sm:text-base ${colors[index % colors.length]}`}
                  >
                    {isStart ? (
                      <Spade className="size-5 text-primary-600 sm:size-6" />
                    ) : isFinish ? (
                      <Heart className="size-5 text-[#c67c73] sm:size-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute left-[3%] top-[8%] flex h-[112px] w-[78px] rotate-[-12deg] items-center justify-center rounded-2xl border border-primary-100 bg-white text-[#c67c73] shadow-lg sm:left-[5%] sm:h-[136px] sm:w-[94px]">
            <div className="absolute left-3 top-2 text-sm leading-none">♥</div>
            <Heart className="size-8" strokeWidth={1.5} />
            <div className="absolute bottom-2 right-3 rotate-180 text-sm leading-none">
              ♥
            </div>
          </div>

          <div className="absolute right-[1%] top-[1%] flex size-20 rotate-[8deg] items-center justify-center rounded-full border-[6px] border-white bg-[#e6f0e8] text-[#527767] shadow-md sm:right-[4%] sm:top-[2%] sm:size-24">
            <Rabbit className="size-12 sm:size-14" strokeWidth={1.5} />
          </div>

          <div className="absolute bottom-[4%] right-[7%] flex size-[76px] rotate-[8deg] items-center justify-center rounded-2xl border border-[#d6b780] bg-[#f7edcf] text-[#9b7545] shadow-md sm:bottom-[5%] sm:right-[10%] sm:size-[92px]">
            <Dices className="size-11 sm:size-14" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </section>
  );
}
