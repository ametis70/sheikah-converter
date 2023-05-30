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

const Items: string[] = [
  "Item",
  "Weap",
  "Armo",
  "Fire",
  "Norm",
  "IceA",
  "Elec",
  "Bomb",
  "Anci",
  "Anim",
  "Obj_",
  "Game",
  "Dm_N",
  "Dm_A",
  "Dm_E",
  "Dm_P",
  "FldO",
  "Gano",
  "Gian",
  "Grea",
  "KeyS",
  "Kokk",
  "Liza",
  "Mann",
  "Mori",
  "Npc_",
  "OctO",
  "Octa",
  "Octa",
  "arro",
  "Pict",
  "PutR",
  "Rema",
  "Site",
  "TBox",
  "TwnO",
  "Prie",
  "Dye0",
  "Dye1",
  "Map",
  "Play",
  "Oasi",
  "Cele",
  "Wolf",
  "Gata",
  "Ston",
  "Kaka",
  "Soji",
  "Hyru",
  "Powe",
  "Lana",
  "Hate",
  "Akka",
  "Yash",
  "Dung",
  "BeeH",
  "Boar",
  "Boko",
  "Brig",
  "DgnO",
  "RomH",
];

const Hashes: number[] = [
  0x7b74e117, 0x17e1747b, 0xd913b769, 0x69b713d9, 0xb666d246, 0x46d266b6,
  0x021a6ff2, 0xf26f1a02, 0xff74960f, 0x0f9674ff, 0x8932285f, 0x5f283289,
  0x3b0a289b, 0x9b280a3b, 0x2f95768f, 0x8f76952f, 0x9c6cfd3f, 0x3ffd6c9c,
  0xbbac416b, 0x6b41acbb, 0xccab71fd, 0xfd71abcc, 0xcbc6b5e4, 0xe4b5c6cb,
  0x2cadb0e7, 0xe7b0ad2c, 0xa6eb3ef4, 0xf43eeba6, 0x21d4cffa, 0xfacfd421,
  0x22a510d1, 0xd110a522, 0x98d10d53, 0x530dd198, 0x55a22047, 0x4720a255,
  0xe5a63a33, 0x333aa6e5, 0xbec65061, 0x6150c6be, 0xbc118370, 0x708311bc,
  0x0e9d0e75, 0x750e9d0e, 0x96b647c2, 0xc247b696,
];

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

function* getBytes(
  buffer: ArrayBufferLike,
  step = 4
): Generator<[number, Uint8Array]> {
  let position = 0;
  const bytes = new Uint8Array(buffer);
  while (position < buffer.byteLength) {
    const slice = bytes.slice(position, position + step);
    yield [position, slice];
    position += step;
  }
}

export const convertSaveFile = (buffer: ArrayBufferLike): ArrayBufferLike => {
  const converted = new ArrayBuffer(buffer.byteLength);
  const convertedDataView = new DataView(converted);
  const textDecoder = new TextDecoder("utf-8");

  const write = (dv: DataView, position: number) => {
    convertedDataView.setUint32(position, dv.getUint32(0));
  };

  const reverseAndWrite = (
    dv: DataView,
    position: number,
    data: Uint8Array
  ) => {
    data.reverse();
    write(dv, position);
  };

  let dontReverseNext = false;

  for (const [position, data] of getBytes(buffer)) {
    const dv = new DataView(data.buffer);
    const dataUint32 = dv.getUint32(0);

    if (dontReverseNext) {
      dontReverseNext = false;
      write(dv, position);
      continue;
    }

    if (Hashes.includes(dataUint32)) {
      reverseAndWrite(dv, position, data);
      dontReverseNext = true;
      continue;
    }

    const str = textDecoder.decode(data);

    if (Items.includes(str)) {
      write(dv, position);
    } else {
      reverseAndWrite(dv, position, data);
    }
  }

  return converted;
};
