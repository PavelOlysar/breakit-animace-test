"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  TileVisual,
  TILE_HEIGHT,
  TILE_GAP,
  ROW_GAP,
  type Tile,
} from "./about-shared";

const RADIUS = 280;
const MAX_PUSH = 60;
const MAX_ROTATE_DEG = 6;
const MAGNETIC_SPRING = { stiffness: 180, damping: 18, mass: 0.6 } as const;
const LAYOUT_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.7,
} as const;
const FAR_AWAY = 99999;

const SLOT_WIDTHS = [207, 206, 207, 207, 206, 207];

export type SlotTile = { id: number; tile: Tile };

let _nextId = 1_000_000;
const nextId = () => _nextId++;

function centerForSlot(idx: number) {
  const rowIdx = Math.floor(idx / 6);
  const colIdx = idx % 6;
  let x = 0;
  for (let i = 0; i < colIdx; i++) x += SLOT_WIDTHS[i] + TILE_GAP;
  x += SLOT_WIDTHS[colIdx] / 2;
  const y = rowIdx * (TILE_HEIGHT + ROW_GAP) + TILE_HEIGHT / 2;
  return { x, y };
}

function MagneticInner({
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
    },
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
    },
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
    },
  );

  const x = useSpring(rawX, MAGNETIC_SPRING);
  const y = useSpring(rawY, MAGNETIC_SPRING);
  const rotate = useSpring(rawRot, MAGNETIC_SPRING);

  return (
    <motion.div
      className="w-full h-full will-change-transform"
      style={{ x, y, rotate }}
    >
      <TileVisual tile={tile} />
    </motion.div>
  );
}

function isImageKind(kind: Tile["kind"]) {
  return kind === "image" || kind === "image-offset";
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function AboutMagnetic({
  variant,
  initialTiles,
  bluesClickable,
}: {
  variant: string;
  initialTiles: SlotTile[];
  bluesClickable: boolean;
}) {
  const [tiles, setTiles] = useState<SlotTile[]>(initialTiles);
  const [animatedIds, setAnimatedIds] = useState<Set<number>>(new Set());
  const initialIdsRef = useRef<Set<number>>(
    new Set(initialTiles.map((t) => t.id)),
  );
  const cursorX = useMotionValue(FAR_AWAY);
  const cursorY = useMotionValue(FAR_AWAY);
  const fieldRef = useRef<HTMLDivElement | null>(null);

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

  const onClick = (slot: number) => {
    const t = tiles[slot].tile;
    const clickedIsImage = isImageKind(t.kind);
    const clickedIsBlue = t.kind === "blue";

    if (!clickedIsImage && !(bluesClickable && clickedIsBlue)) return;

    setTiles((prev) => {
      const next = prev.slice();

      if (clickedIsImage) {
        const whites = prev
          .map((s, i) => (s.tile.kind === "white" ? i : -1))
          .filter((i) => i >= 0);

        if (whites.length > 0) {
          const target = pickRandom(whites)!;
          const moving = next[slot];
          next[target] = moving;
          next[slot] = {
            id: nextId(),
            tile: { kind: "blue", width: moving.tile.width },
          };
          return next;
        }

        const blues = prev
          .map((s, i) => (s.tile.kind === "blue" ? i : -1))
          .filter((i) => i >= 0 && i !== slot);
        if (blues.length === 0) return prev;
        const target = pickRandom(blues)!;
        [next[slot], next[target]] = [next[target], next[slot]];
        return next;
      }

      // clicked a blue (only reachable when bluesClickable)
      const images = prev
        .map((s, i) => (isImageKind(s.tile.kind) ? i : -1))
        .filter((i) => i >= 0 && i !== slot);
      if (images.length === 0) return prev;
      const target = pickRandom(images)!;
      [next[slot], next[target]] = [next[target], next[slot]];
      return next;
    });
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
        className="grid gap-[16px] w-[1320px]"
        style={{
          gridTemplateColumns: "207px 206px 207px 207px 206px 207px",
          gridTemplateRows: "258px 258px",
          touchAction: "none",
        }}
      >
        {tiles.map((slot, i) => {
          const { x, y } = centerForSlot(i);
          const isClickable =
            isImageKind(slot.tile.kind) ||
            (bluesClickable && slot.tile.kind === "blue");
          const isSpawned = !initialIdsRef.current.has(slot.id);
          const shouldAnimate = isSpawned && !animatedIds.has(slot.id);
          return (
            <motion.div
              key={slot.id}
              layout
              transition={{ layout: LAYOUT_SPRING }}
              onClick={() => onClick(i)}
              className={`relative ${isClickable ? "cursor-pointer" : ""}`}
            >
              <div
                className={`w-full h-full ${shouldAnimate ? "tile-spawn" : ""}`}
                onAnimationEnd={
                  shouldAnimate
                    ? () =>
                        setAnimatedIds((prev) => {
                          if (prev.has(slot.id)) return prev;
                          const next = new Set(prev);
                          next.add(slot.id);
                          return next;
                        })
                    : undefined
                }
              >
                <MagneticInner
                  tile={slot.tile}
                  centerX={x}
                  centerY={y}
                  cursorX={cursorX}
                  cursorY={cursorY}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
