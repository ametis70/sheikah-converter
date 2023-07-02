import fs from "node:fs/promises";
import fsSync from "node:fs"
import path from "node:path";
import os from "node:os";

import { stdout, stderr } from "stdout-stderr";

import { getTempSaveDir } from '@sheikah-converter/test'

import { CLI } from "../src";
import { getSaveType, SaveType } from "@sheikah-converter/lib";

let wiiUDir: string;
let switchDir: string;


describe("botwc CLI", () => {
  beforeAll(async () => {
    wiiUDir = await getTempSaveDir('wiiu')
    switchDir = await getTempSaveDir('switch')
  })

  afterAll(async () => {
    await fs.rm(wiiUDir, { recursive: true });
    await fs.rm(switchDir, { recursive: true });
  })


  beforeEach(() => {
    stdout.start();
    stderr.start();
  });

  afterEach(() => {
    stdout.stop();
    stderr.stop();
  });

  it("Should fail if no input directory is provided", async () => {
    expect(CLI.run([])).rejects.toThrow();
  });

  it("Should convert and copy the new files correctly", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const originalOptionFile = await fs.readFile(path.resolve(wiiUDir, "option.sav"));

    const { type: originalType } = getSaveType(originalOptionFile);

    expect(originalType).toBe(SaveType.WiiU);

    await CLI.run([wiiUDir, outDir]);

    const convertedOptionFile = await fs.readFile(path.resolve(outDir, "option.sav"));

    const { type: convertedType } = getSaveType(convertedOptionFile);

    expect(convertedType).toBe(SaveType.Switch);

    expect(fsSync.existsSync(path.resolve(outDir, "0", "game_data.sav"))).toBe(true);
    expect(fsSync.existsSync(path.resolve(outDir, "0", "caption.sav"))).toBe(true);
    expect(fsSync.existsSync(path.resolve(outDir, "tracker", "trackblock00.sav"))).toBe(true);

  });
});
