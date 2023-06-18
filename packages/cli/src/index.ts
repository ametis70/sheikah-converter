import { basename, dirname, relative, resolve } from "node:path";
import { existsSync } from "node:fs";
import {
  readdir,
  readFile,
  lstat,
  mkdir,
  rm,
  writeFile,
} from "node:fs/promises";

import { Command, Args, Flags, ux } from "@oclif/core";

import {
  convertSaveFile,
  getSaveType,
  getPrettySaveType,
} from "@sheikah-translator/lib";

export enum OutputDirectoryValidation {
  NOT_EXISTS,
  NOT_DIR,
  DIR_EMPTY,
  DIR_NOT_EMPTY,
}

export class Convert extends Command {
  static summary = "Converts a BotW saves";
  static description = `This program converts a BotW save directory to from one console format to another.

This works with Wii U and Switch saves up to version 1.6 of the game.

Version 1.5 and 1.6 are compatible and should work interchangeably on both platforms.`;

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
    verbose: Flags.boolean({
      char: "v",
      description: "Print verbose output",
    }),
  };

  private _verbose = false;

  /**
   * Only log when verbose flag is passed
   * @param args Arguments to pass to log function
   * @returns void
   */
  verbose(...args: any[]): void {
    if (!this._verbose) {
      return;
    }

    this.log(...args);
  }

  /**
   * Function to load game_data.sav files from target directory
   *
   * @param dir The directory to load save files from
   * @returns Array of tuples of the save file path and the save file buffer
   */
  private async getSaveFiles(dir: string): Promise<[string, Buffer][]> {
    const files = await readdir(dir);

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
      this.error("Missing save directories files");
    }

    const saveFiles = await Promise.all(saveFilesPromises);

    for (const [path, saveFile] of saveFiles) {
      const { type, version } = getSaveType(saveFile);
      this.verbose(
        `Found ${getPrettySaveType(type)} save file (${version}) in ${path}`
      );
    }

    return saveFiles;
  }

  /**
   * Function to load option.sav file from target directory
   *
   * @param dir The directory to load save files from
   * @returns Buffer from option.sav file
   */
  private async getOptionFile(dir: string): Promise<Buffer> {
    const files = await readdir(dir);

    if (!files.includes("option.sav")) {
      throw new Error(`No options.sav file found in ${dir}`);
    }

    const path = resolve(dir, "option.sav");
    const optionFile = await readFile(path);

    const { type, version } = getSaveType(optionFile);
    this.verbose(
      `Found ${getPrettySaveType(type)} option file (${version}) in ${path}`
    );

    return optionFile;
  }

  /**
   * Validate that the output directory is valid
   *
   * @param dir The directory to validate
   * @returns OutputDirectoryValidation enum value
   */
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

  /**
   * Generate a filename for the output directory based on the current date and time
   * @returns string in the form of botw-YYYY-MM-DD_HH-MM-SS
   */
  generateOutputDirFilename(): string {
    return `botw-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "_")
      .replace(/:/g, "-")}`;
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Convert);

    if (flags.verbose) {
      this._verbose = true;
    }

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
        this.verbose(`Creating dir "${outputDir}"`);
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
        this.verbose(`Using existing empty dir "${outputDir}"`);
        break;
    }

    const saveFiles = await this.getSaveFiles(args.input);
    const optionFile = await this.getOptionFile(args.input);

    const convertPromises: Promise<void>[] = [];

    const convertAndSave = async (
      savePath: string,
      saveBuffer: ArrayBufferLike
    ): Promise<void> => {
      const relativePath = relative(args.input, savePath);
      const directoryName = dirname(relativePath);
      const dirPath = resolve(outputDir, directoryName);
      const fileName = basename(relativePath);
      const outputPath = resolve(outputDir, directoryName, fileName);

      if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
      }

      const convertedBuffer = convertSaveFile(saveBuffer);

      await writeFile(outputPath, Buffer.from(convertedBuffer));
    };

    for (const [savePath, saveBuffer] of saveFiles) {
      convertPromises.push(convertAndSave(savePath, saveBuffer));
    }

    convertPromises.push(
      convertAndSave(resolve(args.input, "options.sav"), optionFile)
    );

    await Promise.all(convertPromises);

    this.log("Finished!");
  }
}
