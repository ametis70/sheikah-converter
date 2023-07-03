import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";

import { ux } from "@oclif/core";
import { stdout, stderr } from "stdout-stderr";

import {
  copyDir,
  getTempSaveDir,
  createEmptyFile,
} from "@sheikah-converter/test";
import { getSaveType, SaveType } from "@sheikah-converter/lib";

import { CLI } from "../src";

let wiiUDir: string;
let switchDir: string;

describe("botwc CLI", () => {
  beforeAll(async () => {
    wiiUDir = await getTempSaveDir("wiiu");
    switchDir = await getTempSaveDir("switch");
  });

  afterAll(async () => {
    await fs.rm(wiiUDir, { recursive: true });
    await fs.rm(switchDir, { recursive: true });
  });

  beforeEach(() => {
    stdout.start();
    stderr.start();
  });

  afterEach(() => {
    stdout.stop();
    stderr.stop();
  });

  it("Should fail if no input directory is provided", async () => {
    try {
      await CLI.run([]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(
        (e as Error).message.includes("Missing 1 required arg")
      ).toBeTruthy();
    }
  });

  it("Should convert and copy the new files correctly", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const originalOptionFile = await fs.readFile(
      path.resolve(wiiUDir, "option.sav")
    );

    const { type: originalType } = getSaveType(originalOptionFile);

    expect(originalType).toBe(SaveType.WiiU);

    await CLI.run([wiiUDir, outDir]);

    const convertedOptionFile = await fs.readFile(
      path.resolve(outDir, "option.sav")
    );

    const { type: convertedType } = getSaveType(convertedOptionFile);

    expect(convertedType).toBe(SaveType.Switch);

    expect(
      fsSync.existsSync(path.resolve(outDir, "0", "game_data.sav"))
    ).toBeTruthy();
    expect(
      fsSync.existsSync(path.resolve(outDir, "0", "caption.sav"))
    ).toBeTruthy();
    expect(
      fsSync.existsSync(path.resolve(outDir, "tracker", "trackblock00.sav"))
    ).toBeTruthy();
    expect(stdout.output).toEqual("Finished!\n");
  });

  it("Should copy images if they exist", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const modifiedInputDir = await fs.mkdtemp(
      path.resolve(os.tmpdir(), `sc-input-`)
    );
    await copyDir(wiiUDir, modifiedInputDir);

    const pictBookDir = path.resolve(modifiedInputDir, "pict_book");
    await fs.mkdir(pictBookDir);
    await createEmptyFile(path.resolve(pictBookDir, "AncientArrow.jpg"));

    const albumDir = path.resolve(modifiedInputDir, "album");
    await fs.mkdir(albumDir);
    await createEmptyFile(path.resolve(albumDir, "pict_000.jpg"));

    await CLI.run([modifiedInputDir, outDir]);

    expect(
      fsSync.existsSync(path.resolve(outDir, "pict_book", "AncientArrow.jpg"))
    ).toBeTruthy();
    expect(
      fsSync.existsSync(path.resolve(outDir, "album", "pict_000.jpg"))
    ).toBeTruthy();
  });

  it("Should print more information when verbose output is enabled", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    await CLI.run([wiiUDir, outDir, "-v"]);

    const lines = stdout.output.split("\n");

    expect(
      lines.splice(
        lines.findIndex((l) => l === "Verbose output enabled"),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex((l) => l === `Using existing empty dir "${outDir}"`),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Found Wii U save file (v1.5) in ${path.resolve(
              wiiUDir,
              "0",
              "game_data.sav"
            )}`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Found Wii U save file (v1.5) in ${path.resolve(
              wiiUDir,
              "0",
              "caption.sav"
            )}`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Found Wii U option file (v1.5) in ${path.resolve(
              wiiUDir,
              "option.sav"
            )}`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) => l === `Creating directory "${path.resolve(outDir, "0")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) => l === `Creating directory "${path.resolve(outDir, "tracker")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) => l === `Converting "${path.resolve(wiiUDir, "option.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Writing "${path.resolve(
              wiiUDir,
              "option.sav"
            )}" to "${path.resolve(outDir, "option.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Copying "${path.resolve(
              wiiUDir,
              "0",
              "caption.jpg"
            )}" to "${path.resolve(outDir, "0", "caption.jpg")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `File "${path.resolve(
              wiiUDir,
              "0",
              "caption.jpg"
            )}" does not exist"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l === `Converting "${path.resolve(wiiUDir, "0", "caption.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Writing "${path.resolve(
              wiiUDir,
              "0",
              "caption.sav"
            )}" to "${path.resolve(outDir, "0", "caption.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Converting "${path.resolve(
              wiiUDir,
              "tracker",
              "trackblock00.sav"
            )}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Writing "${path.resolve(
              wiiUDir,
              "tracker",
              "trackblock00.sav"
            )}" to "${path.resolve(outDir, "tracker", "trackblock00.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l === `Converting "${path.resolve(wiiUDir, "0", "game_data.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex(
          (l) =>
            l ===
            `Writing "${path.resolve(
              wiiUDir,
              "0",
              "game_data.sav"
            )}" to "${path.resolve(outDir, "0", "game_data.sav")}"`
        ),
        1
      )
    ).toBeTruthy();
    expect(
      lines.splice(
        lines.findIndex((l) => l === `Finished!`),
        1
      )
    ).toBeTruthy();
  });

  it("Shouldn't create files when dry mode is enabled", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    await CLI.run([wiiUDir, outDir, "-d"]);

    stdout.stop();
    const lines = stdout.output.split("\n");

    expect(
      lines
        .filter(Boolean)
        .every(
          (l) =>
            l.includes("Should") ||
            l === "Running in dry mode" ||
            l === "Finished!"
        )
    ).toBeTruthy();

    const outFiles = await fs.readdir(outDir);
    expect(outFiles.length).toBe(0);
  });

  it("Should generate a directory with the current date and time when output dir is not specifiied", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const mockDate = new Date(0);
    jest.spyOn(global, "Date").mockImplementationOnce(() => mockDate);
    jest.spyOn(process, "cwd").mockImplementation(() => outDir);

    await CLI.run([wiiUDir, "-d"]);

    stdout.stop();
    const lines = stdout.output.split("\n");
    expect(lines[1]).toBe(
      `Should create directory "${outDir}/botw-1970-01-01_00-00-00"`
    );
  });

  it("Should fail when no game_data.sav files exist in the input directory", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const modifiedInputDir = await fs.mkdtemp(
      path.resolve(os.tmpdir(), `sc-input-`)
    );

    await copyDir(wiiUDir, modifiedInputDir);
    await fs.rm(path.resolve(modifiedInputDir, "0"), { recursive: true });

    try {
      await CLI.run([modifiedInputDir, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(e.message).toBe(
        `Missing save slot directories or files in "${modifiedInputDir}"`
      );
    }
  });

  it("Should fail when no option.sav file exist in the input directory", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const modifiedInputDir = await fs.mkdtemp(
      path.resolve(os.tmpdir(), `sc-input-`)
    );

    await copyDir(wiiUDir, modifiedInputDir);
    await fs.rm(path.resolve(modifiedInputDir, "option.sav"));

    try {
      await CLI.run([modifiedInputDir, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(e.message).toBe(
        `No options.sav file found in "${modifiedInputDir}"`
      );
    }
  });

  it("Should fail when the input path does not exist", async () => {
    const inputDir = path.resolve("/doesnotexist");
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));

    try {
      await CLI.run([inputDir, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(e.message).toBe(`Input path "${inputDir}" does not exist`);
    }
  });

  it("Should fail when the input path is not a directory", async () => {
    const inputDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-in-`));
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const file = path.resolve(inputDir, "test");

    await createEmptyFile(file);

    try {
      await CLI.run([file, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(e.message).toBe(`Input path "${file}" is not a directory`);
    }
  });

  it("Should fail when the output path is not a directory", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const file = path.resolve(outDir, "test");

    await createEmptyFile(file);

    try {
      await CLI.run([wiiUDir, file]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(stdout.output).toBe(
        `Output path "${file}" exists but is not a directory\n`
      );
      expect(e.message).toBe(`Set -f to allow deleting files`);
    }
  });

  it("Should fail when the output path is not empty", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const file = path.resolve(outDir, "test");

    await createEmptyFile(file);

    try {
      await CLI.run([wiiUDir, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect(stdout.output).toBe(
        `Output path "${outDir}" exists but is not empty\n`
      );
      expect(e.message).toBe(`Set -f to allow deleting files`);
    }
  });

  // Test that is run with force flag
  it("Should fail when the output path is not empty", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const file = path.resolve(outDir, "test");

    jest
      .spyOn(ux, "confirm")
      .mockImplementationOnce(() => new Promise((resolve) => resolve(true)));

    await createEmptyFile(file);

    await CLI.run([wiiUDir, outDir, "-f"]);

    stdout.stop();
    stderr.stop();

    const lines = stdout.output.split("\n");

    expect(lines[0]).toBe(`Output path "${outDir}" exists but is not empty`);
    expect(lines[1]).toBe("Finished!");
  });

  it("Should exit when -f flag is passed but the deletion is not confirmed", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const file = path.resolve(outDir, "test");

    jest
      .spyOn(ux, "confirm")
      .mockImplementationOnce(() => new Promise((resolve) => resolve(false)));

    await createEmptyFile(file);

    try {
      await CLI.run([wiiUDir, outDir, "-f"]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();
      expect((e as Error).message).toBe(`EEXIT: 1`);
    }
  });

  it("Should fail when mixed save types exist in input directory", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));
    const modifiedInputDir = await fs.mkdtemp(
      path.resolve(os.tmpdir(), `sc-input-`)
    );
    await copyDir(wiiUDir, modifiedInputDir);

    const switchSaveSlot = path.resolve(modifiedInputDir, "1");
    await copyDir(path.resolve(switchDir, "0"), switchSaveSlot);

    try {
      await CLI.run([modifiedInputDir, outDir]);
    } catch (e: any) {
      stdout.stop();
      stderr.stop();

      expect((e as Error).message).toBe(
        "Mixed save types. Please ensure there is only one type of save file in input directory."
      );
    }
  });

  it("Should print save type and exit when check flag is used", async () => {
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `sc-out-`));

    try {
      await CLI.run([wiiUDir, outDir, "-c"]);
    } catch (e: any) {
      expect((e as Error).message).toBe("EEXIT: 0");
    }

    try {
      await CLI.run([switchDir, outDir, "-c"]);
    } catch (e: any) {
      expect((e as Error).message).toBe("EEXIT: 0");
    }

    stdout.stop();
    stderr.stop();

    const lines = stdout.output.split("\n");

    expect(lines[0]).toBe(`Wii U`);
    expect(lines[1]).toBe(`Switch`);

    const dirContents = await fs.readdir(outDir);
    expect(dirContents).toHaveLength(0);
  });
});
