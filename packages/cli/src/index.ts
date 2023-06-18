import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { readdir, readFile, lstat, mkdir, rm } from "node:fs/promises";

import { Command, Args, Flags, ux } from "@oclif/core";

import { getSaveType, getPrettySaveType } from "@sheikah-translator/lib";

export enum OutputDirectoryValidation {
  NOT_EXISTS,
  NOT_DIR,
  DIR_EMPTY,
  DIR_NOT_EMPTY,
}

export class Convert extends Command {
  static summary = "Converts a BotW save";
  static description = `
This program converts a BotW save directory to from one console format to another. This works with Wii U and Switch saves up to version 1.6 of the game. Version 1.5 and 1.6 are compatible and should load on both platforms.
`;

  static args = {
    input: Args.directory({
      required: true,
      description: "The directory containing the save to convert",
    }),
    output: Args.directory({
      required: false,
      description: "The directory to write the converted save to",
    }),
  };

  static flags = {
    force: Flags.boolean({
      char: "f",
      description: "Overwrite existing output directory",
    }),
  };

  private async getSaveFiles(dir: string): Promise<[string, Buffer][]> {
    const files = await readdir(dir);

    console.log(files);

    let noSaveDirectories = true;
    const saveFilesPromises: Promise<[string, Buffer]>[] = [];

    for (const saveDir of [0, 1, 2, 3, 4, 5, 6, 7].map((n) => String(n))) {
      if (!files.includes(saveDir)) {
        break;
      }

      noSaveDirectories = false;

      const path = resolve(dir, saveDir, "game_data.sav");
      saveFilesPromises.push(readFile(path).then((data) => [path, data]));
    }

    if (noSaveDirectories) {
      throw new Error("Missing save directories files");
    }

    const saveFiles = await Promise.all(saveFilesPromises);

    for (const [path, saveFile] of saveFiles) {
      const { type, version } = getSaveType(saveFile);
      console.log(
        `Found ${getPrettySaveType(type)} save file (${version}) in ${path}`
      );
    }

    return saveFiles;
  }

  private async getOptionFile(dir: string): Promise<Buffer> {
    const files = await readdir(dir);

    if (!files.includes("option.sav")) {
      throw new Error(`No options.sav file found in ${dir}`);
    }

    const path = resolve(dir, "option.sav");
    const optionFile = await readFile(path);

    const { type, version } = getSaveType(optionFile);
    console.log(
      `Found ${getPrettySaveType(type)} option file (${version}) in ${path}`
    );

    return optionFile;
  }

  validateOutputDirectory = async (
    dir: string
  ): Promise<OutputDirectoryValidation> => {
    if (!existsSync(dir)) {
      return OutputDirectoryValidation.NOT_EXISTS;
    }

    const stat = await lstat(dir);

    if (!stat.isDirectory()) {
      return OutputDirectoryValidation.NOT_DIR;
    }

    const contents = await readdir(dir);

    if (contents.length === 0) {
      return OutputDirectoryValidation.DIR_EMPTY;
    }

    return OutputDirectoryValidation.DIR_NOT_EMPTY;
  };

  generateOutputDirFilename(): string {
    return `botw-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "_")
      .replace(/:/g, "-")}`;
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Convert);

    const outputDir =
      args.output ?? resolve(process.cwd(), this.generateOutputDirFilename());

    const outputValidation = await this.validateOutputDirectory(outputDir);

    const handleForceFlag = async () => {
      if (!flags.force) {
        this.error("Set -f to allow deleting files");
      }

      if (await ux.confirm(`Remove ${outputDir}?`)) {
        await rm(outputDir, { force: true, recursive: true });
        await mkdir(outputDir);
      } else {
        this.exit(1);
      }
    };

    switch (outputValidation) {
      case OutputDirectoryValidation.NOT_EXISTS:
        this.log(`Creating dir "${outputDir}"`);
        await mkdir(outputDir);
        break;
      case OutputDirectoryValidation.NOT_DIR:
        this.warn(`"${outputDir}" exists but is not a directory`);
        await handleForceFlag();
        break;

      case OutputDirectoryValidation.DIR_NOT_EMPTY:
        this.warn(`"${outputDir}" exists but is not empty`);
        await handleForceFlag();
        break;

      case OutputDirectoryValidation.DIR_EMPTY:
        this.log(`Using existing empty dir "${outputDir}"`);
        break;
    }

    await this.getSaveFiles(args.input);
    await this.getOptionFile(args.input);
  }
}
