import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  basePath: string;
  locale: string;
}

export function HeroSection({ basePath }: HeroSectionProps) {
  const productsHref = `${basePath}/products`;

  return (
    <section
      aria-label="Descoperă jocurile TOKI"
      className="w-full overflow-hidden bg-[#fff8ee]"
    >
      {/* Desktop: keep the entire original illustration, without cropping. */}
      <div className="relative hidden w-full md:block">
        <Image
          src="/toki-hero.webp"
          alt="TOKI: jocuri de societate pentru orice aventură, cu iepurașul magazinului"
          width={1920}
          height={819}
          sizes="100vw"
          priority
          className="block h-auto w-full"
        />
        {/* Clickable HTML link aligned over the button painted in the artwork.
            Percentages are relative to the original image. */}
        <Link
          href={productsHref}
          aria-label="Descoperă jocurile din magazinul TOKI"
          className="absolute left-[22%] top-[71%] z-10 h-[13%] w-[25%] rounded-full focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#0c5e94]"
        >
          <span className="sr-only">Descoperă jocurile</span>
        </Link>
      </div>

      {/* Mobile: readable text, uncropped mascot and a genuine HTML button. */}
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-8 text-center md:hidden">
        <h1 className="font-display text-5xl font-bold tracking-wide text-[#126ca6]">
          TOKI
        </h1>
        <p className="mt-3 max-w-sm text-lg font-semibold text-[#175b87]">
          Jocuri de societate pentru orice aventură
        </p>
        <Image
          src="/toki-rabbit.webp"
          alt="Iepurașul TOKI cu vestă albastră și simboluri de cărți de joc"
          width={620}
          height={730}
          sizes="(max-width: 640px) 68vw, 270px"
          priority
          className="mt-4 h-auto w-[min(68vw,270px)] object-contain"
        />
        <Link
          href={productsHref}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#126ca6] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#0b4d80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126ca6]"
        >
          Descoperă jocurile →
        </Link>
      </div>
    </section>
  );
}
