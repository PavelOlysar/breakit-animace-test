"use client";

import { useMemo } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { row1, row2, TileVisual, TILE_HEIGHT, type Tile } from "./about-shared";

const V_CLAMP = 2500;
const TRANSLATE_PX = 70;
const ROTATE_DEG = 14;
const SPRING = { stiffness: 120, damping: 18, mass: 0.6 } as const;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ShatterTile({
  tile,
  idx,
  velocity,
}: {
  tile: Tile;
  idx: number;
  velocity: MotionValue<number>;
}) {
  const personality = useMemo(() => {
    const rng = mulberry32(idx * 9973 + 17);
    return {
      dx: rng() * 2 - 1,
      dy: rng() * 2 - 1,
      rot: rng() * 2 - 1,
    };
  }, [idx]);

  const tx = useTransform(velocity, [-V_CLAMP, V_CLAMP], [
    -personality.dx * TRANSLATE_PX,
    personality.dx * TRANSLATE_PX,
  ]);
  const ty = useTransform(velocity, [-V_CLAMP, V_CLAMP], [
    -personality.dy * TRANSLATE_PX,
    personality.dy * TRANSLATE_PX,
  ]);
  const tr = useTransform(velocity, [-V_CLAMP, V_CLAMP], [
    -personality.rot * ROTATE_DEG,
    personality.rot * ROTATE_DEG,
  ]);

  const x = useSpring(tx, SPRING);
  const y = useSpring(ty, SPRING);
  const rotate = useSpring(tr, SPRING);

  return (
    <motion.div
      className="relative shrink-0 will-change-transform"
      style={{ width: tile.width, height: TILE_HEIGHT, x, y, rotate }}
    >
      <TileVisual tile={tile} />
    </motion.div>
  );
}

export default function AboutScroll({ variant }: { variant: string }) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

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
            <ShatterTile key={`r1-${i}`} tile={tile} idx={i} velocity={velocity} />
          ))}
        </div>
        <div className="flex gap-[16px] items-center w-full">
          {row2.map((tile, i) => (
            <ShatterTile
              key={`r2-${i}`}
              tile={tile}
              idx={i + row1.length}
              velocity={velocity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
