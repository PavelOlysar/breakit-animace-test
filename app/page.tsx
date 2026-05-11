import AboutMagnetic, { type SlotTile } from "./about-magnetic";
import { row1, row2, type Tile } from "./about-shared";

let _idSeed = 0;
const idStamp = (tile: Tile): SlotTile => ({ id: _idSeed++, tile });

const whiteToBlue = (t: Tile): Tile =>
  t.kind === "white" ? { kind: "blue", width: t.width } : t;

const blueToWhite = (t: Tile): Tile =>
  t.kind === "blue" ? { kind: "white", width: t.width } : t;

const initialV1: SlotTile[] = [...row1, ...row2].map(blueToWhite).map(idStamp);
const initialV2: SlotTile[] = [...row1, ...row2].map(whiteToBlue).map(idStamp);

export default function Home() {
  return (
    <main className="bg-white w-full flex flex-col items-center">
      <AboutMagnetic
        variant="O nás"
        initialTiles={initialV1}
        bluesClickable={true}
      />
      <AboutMagnetic
        variant="O nás"
        initialTiles={initialV2}
        bluesClickable={true}
      />
    </main>
  );
}
