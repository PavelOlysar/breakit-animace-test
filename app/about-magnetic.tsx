"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  row1,
  row2,
  TileVisual,
  TILE_HEIGHT,
  TILE_GAP,
  ROW_GAP,
  type Tile,
} from "./about-shared";

const RADIUS = 280;
const MAX_PUSH = 60;
const MAX_ROTATE_DEG = 6;
const SPRING = { stiffness: 180, damping: 18, mass: 0.6 } as const;
const FAR_AWAY = 99999;

function centerFor(rowIdx: number, colIdx: number, widths: number[]) {
  let x = 0;
  for (let i = 0; i < colIdx; i++) x += widths[i] + TILE_GAP;
  x += widths[colIdx] / 2;
  const y = rowIdx * (TILE_HEIGHT + ROW_GAP) + TILE_HEIGHT / 2;
  return { x, y };
}

function MagneticTile({
  tile,
  centerX,
  centerY,
  cursorX,
  cursorY,
}: {
  tile: Tile;
  centerX: number;
  centerY: number;
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
}) {
  const rawX = useTransform<number, number>(
    [cursorX, cursorY],
    (latest) => {
      const [cx, cy] = latest as [number, number];
      const dx = centerX - cx;
      const dy = centerY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) return 0;
      const falloff = (1 - dist / RADIUS) ** 2;
      const ux = dx / (dist || 1);
      return ux * MAX_PUSH * falloff;
    }
  );
  const rawY = useTransform<number, number>(
    [cursorX, cursorY],
    (latest) => {
      const [cx, cy] = latest as [number, number];
      const dx = centerX - cx;
      const dy = centerY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) return 0;
      const falloff = (1 - dist / RADIUS) ** 2;
      const uy = dy / (dist || 1);
      return uy * MAX_PUSH * falloff;
    }
  );
  const rawRot = useTransform<number, number>(
    [cursorX, cursorY],
    (latest) => {
      const [cx, cy] = latest as [number, number];
      const dx = centerX - cx;
      const dy = centerY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > RADIUS) return 0;
      const falloff = (1 - dist / RADIUS) ** 2;
      const ux = dx / (dist || 1);
      return ux * MAX_ROTATE_DEG * falloff;
    }
  );

  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  const rotate = useSpring(rawRot, SPRING);

  return (
    <motion.div
      className="relative shrink-0 will-change-transform"
      style={{
        width: tile.width,
        height: TILE_HEIGHT,
        x,
        y,
        rotate,
      }}
    >
      <TileVisual tile={tile} />
    </motion.div>
  );
}

export default function AboutMagnetic({ variant }: { variant: string }) {
  const cursorX = useMotionValue(FAR_AWAY);
  const cursorY = useMotionValue(FAR_AWAY);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  const widthsRow1 = row1.map((t) => t.width);
  const widthsRow2 = row2.map((t) => t.width);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = fieldRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    cursorX.set(e.clientX - rect.left);
    cursorY.set(e.clientY - rect.top);
  };

  const handleLeave = () => {
    cursorX.set(FAR_AWAY);
    cursorY.set(FAR_AWAY);
  };

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

      <div
        ref={fieldRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="flex flex-col gap-[16px] items-start w-[1320px]"
        style={{ touchAction: "none" }}
      >
        <div className="flex gap-[16px] items-center w-full">
          {row1.map((tile, i) => {
            const { x, y } = centerFor(0, i, widthsRow1);
            return (
              <MagneticTile
                key={`r1-${i}`}
                tile={tile}
                centerX={x}
                centerY={y}
                cursorX={cursorX}
                cursorY={cursorY}
              />
            );
          })}
        </div>
        <div className="flex gap-[16px] items-center w-full">
          {row2.map((tile, i) => {
            const { x, y } = centerFor(1, i, widthsRow2);
            return (
              <MagneticTile
                key={`r2-${i}`}
                tile={tile}
                centerX={x}
                centerY={y}
                cursorX={cursorX}
                cursorY={cursorY}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
