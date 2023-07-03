import fs from "fs/promises";
import path from "path";

import { getTempSaveDir } from "@sheikah-converter/test";

import { SaveType } from "../src/data";
import { convertSaveFile, getSaveType, getPrettySaveType } from "../src/lib";

import { compareArrays } from "./utils";

let wiiUDir: string;
let switchDir: string;

describe("library", () => {
  beforeAll(async () => {
    wiiUDir = await getTempSaveDir("wiiu");
    switchDir = await getTempSaveDir("switch");
  });

  afterAll(async () => {
    await fs.rm(wiiUDir, { recursive: true });
    await fs.rm(switchDir, { recursive: true });
  });

  it("Should return the correct save type and version when given a Wii U option.save file", async () => {
    const file = await fs.readFile(path.resolve(wiiUDir, "option.sav"));
    const saveType = getSaveType(file.buffer);
    expect(saveType).toStrictEqual({ type: SaveType.WiiU, version: "v1.5" });
  });

  it("Should return the correct save type and version when given a Switch option.save file", async () => {
    const file = await fs.readFile(path.resolve(switchDir, "option.sav"));
    const saveType = getSaveType(file.buffer);
    expect(saveType).toStrictEqual({ type: SaveType.Switch, version: "v1.5" });
  });

  it("Should throw a type error when given an invalid file", async () => {
    // Load this same file, any file will do
    const file = await fs.readFile(path.resolve(__dirname, "lib.spec.ts"));
    expect(() => {
      getSaveType(file.buffer);
    }).toThrow(TypeError);
  });

  it("Should convert a Wii U game_data.sav file to Switch correctly", async () => {
    const wiiUFile = await fs.readFile(
      path.resolve(wiiUDir, "0", "game_data.sav")
    );

    const result = convertSaveFile(wiiUFile);

    const switchReferenceFile = await fs.readFile(
      path.resolve(switchDir, "0", "game_data.sav")
    );

    const wiiUArr = new Uint8Array(wiiUFile);
    const resultArr = new Uint8Array(result);
    const switchReferenceArr = new Uint8Array(switchReferenceFile);

    expect(() =>
      compareArrays(resultArr, switchReferenceArr, wiiUArr)
    ).not.toThrow();
  });

  it("Should convert a Switch game_data.sav file to WiiU correctly", async () => {
    const switchFile = await fs.readFile(
      path.resolve(switchDir, "0", "game_data.sav")
    );

    const result = convertSaveFile(switchFile);

    const wiiUReferenceFile = await fs.readFile(
      path.resolve(wiiUDir, "0", "game_data.sav")
    );

    const switchArr = new Uint8Array(switchFile);
    const resultArr = new Uint8Array(result);
    const wiiUReferenceArr = new Uint8Array(wiiUReferenceFile);

    expect(() =>
      compareArrays(resultArr, wiiUReferenceArr, switchArr)
    ).not.toThrow();
  });

  it("Should convert a Wii U caption.sav file to Switch correctly", async () => {
    const wiiUFile = await fs.readFile(
      path.resolve(wiiUDir, "0", "caption.sav")
    );

    const result = convertSaveFile(wiiUFile);

    const switchReferenceFile = await fs.readFile(
      path.resolve(switchDir, "0", "caption.sav")
    );

    const wiiUArr = new Uint8Array(wiiUFile);
    const resultArr = new Uint8Array(result);
    const switchReferenceArr = new Uint8Array(switchReferenceFile);

    expect(() =>
      compareArrays(resultArr, switchReferenceArr, wiiUArr)
    ).not.toThrow();
  });

  it("Should convert a Switch caption.sav file to WiiU correctly", async () => {
    const switchFile = await fs.readFile(
      path.resolve(switchDir, "0", "caption.sav")
    );

    const result = convertSaveFile(switchFile);

    const wiiUReferenceFile = await fs.readFile(
      path.resolve(wiiUDir, "0", "caption.sav")
    );

    const switchArr = new Uint8Array(switchFile);
    const resultArr = new Uint8Array(result);
    const wiiUReferenceArr = new Uint8Array(wiiUReferenceFile);

    expect(() =>
      compareArrays(resultArr, wiiUReferenceArr, switchArr)
    ).not.toThrow();
  });

  it("Should convert a Wii U trackblockXX.sav file to Switch correctly", async () => {
    const wiiUFile = await fs.readFile(
      path.resolve(wiiUDir, "tracker", "trackblock00.sav")
    );

    const result = convertSaveFile(wiiUFile, true);

    const switchReferenceFile = await fs.readFile(
      path.resolve(switchDir, "tracker", "trackblock00.sav")
    );

    const wiiUArr = new Uint8Array(wiiUFile);
    const resultArr = new Uint8Array(result);
    const switchReferenceArr = new Uint8Array(switchReferenceFile);

    expect(() =>
      compareArrays(resultArr, switchReferenceArr, wiiUArr)
    ).not.toThrow();
  });

  it("Should convert a Switch trackblockXX.sav file to WiiU correctly", async () => {
    const switchFile = await fs.readFile(
      path.resolve(switchDir, "tracker", "trackblock00.sav")
    );

    const result = convertSaveFile(switchFile, true);

    const wiiUReferenceFile = await fs.readFile(
      path.resolve(wiiUDir, "tracker", "trackblock00.sav")
    );

    const switchArr = new Uint8Array(switchFile);
    const resultArr = new Uint8Array(result);
    const wiiUReferenceArr = new Uint8Array(wiiUReferenceFile);

    expect(() =>
      compareArrays(resultArr, wiiUReferenceArr, switchArr)
    ).not.toThrow();
  });

  it("Should print Wii U pretty name correctly", async () => {
    expect(getPrettySaveType(SaveType.WiiU)).toBe("Wii U");
  });

  it("Should print Switch pretty name correctly", async () => {
    expect(getPrettySaveType(SaveType.Switch)).toBe("Switch");
  });

  it("Should handle printing wrong save type", async () => {
    expect(getPrettySaveType(-1 as SaveType)).toBe("Unknown");
  });
});
