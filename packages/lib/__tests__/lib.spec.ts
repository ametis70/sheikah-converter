import fs from "fs/promises";
import path from "path";

import { SaveType } from "../src/data";
import { convertSaveFile, getSaveType } from "../src/lib";

import { compareArrays } from "./utils";

describe("library", () => {
  it("should return the correct save type and version when given a Wii U option.save file", async () => {
    const file = await fs.readFile(
      path.resolve(__dirname, "data", "wiiu", "option.sav")
    );
    const saveType = getSaveType(file.buffer);
    expect(saveType).toStrictEqual({ type: SaveType.WiiU, version: "v1.5" });
  });

  it("should return the correct save type and version when given a Switch option.save file", async () => {
    const file = await fs.readFile(
      path.resolve(__dirname, "data", "switch", "option.sav")
    );
    const saveType = getSaveType(file.buffer);
    expect(saveType).toStrictEqual({ type: SaveType.Switch, version: "v1.5" });
  });

  it("should throw a type error when given an invalid file", async () => {
    // Load this same file, any file will do
    const file = await fs.readFile(path.resolve(__dirname, "lib.spec.ts"));
    expect(() => {
      getSaveType(file.buffer);
    }).toThrow(TypeError);
  });

  it("should should convert a Wii U game_data.sav file to Switch correctly", async () => {
    const wiiUFile = await fs.readFile(
      path.resolve(__dirname, "data", "wiiu", "0", "game_data.sav")
    );

    const result = convertSaveFile(wiiUFile);

    const switchReferenceFile = await fs.readFile(
      path.resolve(__dirname, "data", "switch", "0", "game_data.sav")
    );

    const wiiUArr = new Uint8Array(wiiUFile);
    const resultArr = new Uint8Array(result);
    const switchReferenceArr = new Uint8Array(switchReferenceFile);

    expect(() =>
      compareArrays(resultArr, switchReferenceArr, wiiUArr)
    ).not.toThrow();
  });

  it("should should convert a Switch game_data.sav file to WiiU correctly", async () => {
    const switchFile = await fs.readFile(
      path.resolve(__dirname, "data", "switch", "0", "game_data.sav")
    );

    const result = convertSaveFile(switchFile);

    const wiiUReferenceFile = await fs.readFile(
      path.resolve(__dirname, "data", "wiiu", "0", "game_data.sav")
    );

    const switchArr = new Uint8Array(switchFile);
    const resultArr = new Uint8Array(result);
    const wiiUReferenceArr = new Uint8Array(wiiUReferenceFile);

    expect(() =>
      compareArrays(resultArr, wiiUReferenceArr, switchArr)
    ).not.toThrow();
  });
});
