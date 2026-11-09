import {
  Castle,
  Compass,
  Ghost,
  Rocket,
  Search,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

const themes = [
  {
    label: "Fantezie",
    slug: "tematici/fantezie",
    Icon: WandSparkles,
    color: "#f3dfeb",
  },
  {
    label: "Horror",
    slug: "tematici/horror",
    Icon: Ghost,
    color: "#e6dff0",
  },
  {
    label: "Aventură",
    slug: "tematici/aventura",
    Icon: Compass,
    color: "#dcece6",
  },
  {
    label: "Science-fiction",
    slug: "tematici/science-fiction",
    Icon: Rocket,
    color: "#e0ecfa",
  },
  {
    label: "Mister",
    slug: "tematici/mister",
    Icon: Search,
    color: "#f7e9ce",
  },
  {
    label: "Regate & magie",
    slug: "tematici/regate-and-magie",
    Icon: Castle,
    color: "#e4e6f4",
  },
];

export function TokiThemes({ basePath }: { basePath: string }) {
  return (
    <section
      aria-labelledby="toki-themes-title"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14"
    >
      <h2
        id="toki-themes-title"
        className="font-display text-center text-2xl font-bold text-[#195e8b] sm:text-3xl"
      >
        Alege-ți aventura
      </h2>

      <p className="mt-2 text-center text-sm text-gray-600">
        Descoperă jocurile după tematica preferată
      </p>

      <div className="mt-7 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6">
        {themes.map(({ label, slug, Icon, color }) => (
          <Link
            key={label}
            href={`${basePath}/c/${slug}`}
            className="group flex flex-col items-center gap-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#126ca6]"
          >
            <span
              className="flex aspect-square w-full max-w-32 items-center justify-center rounded-full border-2 border-[#b4d7e9] shadow-sm transition-transform duration-200 group-hover:-translate-y-1"
              style={{ backgroundColor: color }}
            >
              <Icon
                className="h-10 w-10 text-[#126ca6] sm:h-12 sm:w-12"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>

            <span className="text-xs font-semibold text-[#245572] sm:text-sm">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
