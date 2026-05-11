import Image from "next/image";

export type Tile =
  | { kind: "image"; src: string; alt: string; width: number }
  | { kind: "image-offset"; src: string; alt: string; width: number }
  | { kind: "blue"; width: number }
  | { kind: "white"; width: number };

export const TILE_HEIGHT = 258;
export const TILE_GAP = 16;
export const ROW_GAP = 16;

export const row1: Tile[] = [
  { kind: "image", src: "/team/r1c1.png", alt: "", width: 207 },
  { kind: "blue", width: 206 },
  { kind: "image", src: "/team/r1c3.png", alt: "", width: 207 },
  { kind: "image", src: "/team/r1c4.png", alt: "", width: 207 },
  { kind: "white", width: 206 },
  { kind: "image", src: "/team/r1c6.png", alt: "", width: 207 },
];

export const row2: Tile[] = [
  { kind: "image", src: "/team/r2c1.png", alt: "", width: 207 },
  { kind: "image", src: "/team/r2c2.png", alt: "", width: 206 },
  { kind: "white", width: 207 },
  { kind: "blue", width: 207 },
  { kind: "image", src: "/team/r2c5.png", alt: "", width: 206 },
  { kind: "image-offset", src: "/team/r2c6.png", alt: "", width: 207 },
];

export function TileVisual({ tile }: { tile: Tile }) {
  switch (tile.kind) {
    case "image":
      return (
        <div className="relative w-full h-full rounded-[4px] overflow-hidden">
          <Image
            src={tile.src}
            alt={tile.alt}
            fill
            sizes="207px"
            className="object-cover pointer-events-none select-none"
            priority
          />
        </div>
      );
    case "image-offset":
      return (
        <div className="relative w-full h-full rounded-[4px]">
          <div className="absolute inset-0 rounded-[4px] bg-[#b6b6b6]" />
          <div className="absolute inset-0 overflow-hidden rounded-[4px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt={tile.alt}
              className="absolute h-[122.51%] left-[-26.5%] top-[0.1%] w-[153%] max-w-none object-cover pointer-events-none select-none"
            />
          </div>
        </div>
      );
    case "blue":
      return <div className="w-full h-full rounded-[4px] bg-brand-blue" />;
    case "white":
      return null;
  }
}

export function TileEl({ tile }: { tile: Tile }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: tile.width, height: TILE_HEIGHT }}
    >
      <TileVisual tile={tile} />
    </div>
  );
}
