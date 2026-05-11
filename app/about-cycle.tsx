"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { row1, row2, TileVisual } from "./about-shared";

const tiles = [...row1, ...row2];
const SPRING = { type: "spring", stiffness: 280, damping: 32, mass: 0.9 } as const;
const ANIM_MS = 650;

export default function AboutCycle({ variant }: { variant: string }) {
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: tiles.length }, (_, i) => i),
  );
  const canTrigger = useRef(true);
  const isAnimating = useRef(false);
  const cursorInside = useRef(false);
  const animTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (animTimer.current !== null) window.clearTimeout(animTimer.current);
    },
    [],
  );

  const promote = (tileId: number) => {
    if (!canTrigger.current) return;
    if (isAnimating.current) return;
    if (tiles[tileId].kind === "white") return;

    const idx = order.indexOf(tileId);
    const nextOrder =
      idx === 0
        ? [...order.slice(1), order[0]]
        : [...order.slice(idx), ...order.slice(0, idx)];

    setOrder(nextOrder);
    canTrigger.current = false;
    isAnimating.current = true;

    if (animTimer.current !== null) window.clearTimeout(animTimer.current);
    animTimer.current = window.setTimeout(() => {
      isAnimating.current = false;
      if (!cursorInside.current) canTrigger.current = true;
      animTimer.current = null;
    }, ANIM_MS);
  };

  const handleGridEnter = () => {
    cursorInside.current = true;
  };

  const handleGridLeave = () => {
    cursorInside.current = false;
    if (!isAnimating.current) canTrigger.current = true;
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
        onPointerEnter={handleGridEnter}
        onPointerLeave={handleGridLeave}
        className="grid gap-[16px] w-[1320px]"
        style={{
          gridTemplateColumns: "207px 206px 207px 207px 206px 207px",
          gridTemplateRows: "258px 258px",
        }}
      >
        {order.map((tileId) => (
          <motion.div
            key={tileId}
            layout
            transition={SPRING}
            onPointerEnter={() => promote(tileId)}
            className="relative w-full h-full"
          >
            <TileVisual tile={tiles[tileId]} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
