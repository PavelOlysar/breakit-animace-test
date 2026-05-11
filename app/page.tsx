import { row1, row2, TileEl } from "./about-shared";
import AboutMagnetic from "./about-magnetic";
import AboutCycle from "./about-cycle";
import AboutScroll from "./about-scroll";

function AboutSection({ variant }: { variant: string }) {
  return (
    <section className="flex flex-col gap-[60px] items-center py-[160px] w-[1320px] max-w-full">
      <div className="flex items-end justify-between w-[1320px]">
        <div className="flex flex-col items-start w-[652px]">
          <div className="flex flex-col gap-[24px] items-start w-full">
            <div className="flex gap-[10px] items-center justify-center">
              <p className="font-mono font-medium text-[14px] leading-[18px] tracking-[0.56px] uppercase text-grey-2 whitespace-nowrap">
                {variant}
              </p>
            </div>
            <h1 className="font-rethink font-semibold text-[60px] leading-[64px] tracking-[-0.6px] text-black">
              Jsme seniorní tým
              <br aria-hidden="true" />
              s chutí bořit průměr
            </h1>
          </div>
        </div>

        <button
          type="button"
          className="bg-brand-blue h-[50px] flex items-center justify-center px-[24px] rounded-[1px] cursor-pointer"
        >
          <span className="font-inter font-semibold text-[16px] leading-[18px] text-white whitespace-nowrap">
            Poznejte nás
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-[16px] items-start w-[1320px]">
        <div className="flex gap-[16px] items-center w-full">
          {row1.map((tile, i) => (
            <TileEl key={`r1-${i}`} tile={tile} />
          ))}
        </div>
        <div className="flex gap-[16px] items-center w-full">
          {row2.map((tile, i) => (
            <TileEl key={`r2-${i}`} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="bg-white w-full flex flex-col items-center">
      <AboutMagnetic variant="O nás" />
      <AboutCycle variant="O nás" />
      <AboutScroll variant="O nás" />
      <div aria-hidden="true" className="h-screen w-full" />
    </main>
  );
}
