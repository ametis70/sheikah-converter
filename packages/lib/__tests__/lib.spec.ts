import fs from "fs/promises";
import path from "path";

import { SaveType, getSaveType } from "../src/lib";

describe("library", () => {
  it("should return the correct save type when given a Wii U option.save file", async () => {
    const file = await fs.readFile(
      path.resolve(__dirname, "data", "wiiu", "option.sav")
    );
    const saveType = getSaveType(file.buffer);
    expect(saveType).toBe(SaveType.WiiU);
  });

  it("should return the correct save type when given a Switch option.save file", async () => {
    const file = await fs.readFile(
      path.resolve(__dirname, "data", "switch", "option.sav")
    );
    const saveType = getSaveType(file.buffer);
    expect(saveType).toBe(SaveType.Switch);
  });

  it("should throw a type error when given an invalid file", async () => {
    // Load this same file, any file will do
    const file = await fs.readFile(path.resolve(__dirname, "lib.spec.ts"));
    expect(() => {
      getSaveType(file.buffer);
    }).toThrow(TypeError);
  });
});
