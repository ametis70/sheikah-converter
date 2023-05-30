export enum SaveType {
  WiiU,
  Switch,
}

const Versions: Record<number, string> = {
  0x24e2: "v1.0",
  0x24ee: "v1.1",
  0x2588: "v1.2",
  0x29c0: "v1.3",
  0x3ef8: "v1.3.3",
  0x471a: "v1.4",
  0x471b: "v1.5",
  0x471e: "v1.6",
};

export const getSaveType = (
  buffer: ArrayBufferLike
): {
  type: SaveType;
  version: string;
} => {
  const header = new Uint8Array(buffer).slice(0, 4);
  const dv = new DataView(header.buffer);
  const getBytes = () => [dv.getUint16(0), dv.getUint16(2)];

  let [leftBytes, rightBytes] = getBytes();

  if (leftBytes === 0 && rightBytes in Versions) {
    return { type: SaveType.WiiU, version: Versions[rightBytes] };
  }

  header.reverse();
  [leftBytes, rightBytes] = getBytes();

  if (leftBytes === 0 && rightBytes in Versions) {
    return { type: SaveType.Switch, version: Versions[rightBytes] };
  }

  throw new TypeError("Provided input is not a BotW .sav file");
};
}
