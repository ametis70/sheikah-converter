import { basename, dirname, relative, resolve } from "node:path";
import { existsSync, Mode, MakeDirectoryOptions, PathLike } from "node:fs";
import {
  copyFile,
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
} from "@sheikah-converter/lib";

export enum OutputDirectoryValidation {
  NOT_EXISTS,
  NOT_DIR,
  DIR_EMPTY,
  DIR_NOT_EMPTY,
}

export class CLI extends Command {
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
    dry: Flags.boolean({
      char: "d",
      description: "Dry run (do not write files)",
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Print verbose output",
    }),
  };

  private _verbose = false;
  private _force = false;
  private _dry = false;
  private _dryDirectorySet = new Set();

  private inputDir = "";
  private outputDir = "";

  /**
   * Only log when verbose flag is passed
   * @param args Arguments to pass to log function
   * @returns void
   */
  private verbose(...args: any[]): void {
    if (!this._verbose) {
      return;
    }

    this.log(...args);
  }

  /**
   * Generate a filename for the output directory based on the current date and time
   * @returns string in the form of botw-YYYY-MM-DD_HH-MM-SS
   */
  private generateOutputDirName = (): string =>
    `botw-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", "_")
      .replace(/:/g, "-")}`;

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

      const gameDataPath = resolve(dir, saveDir, "game_data.sav");
      saveFilesPromises.push(
        readFile(gameDataPath).then((data) => [gameDataPath, data])
      );
      const captionPath = resolve(dir, saveDir, "caption.sav");
      saveFilesPromises.push(
        readFile(captionPath).then((data) => [captionPath, data])
      );
    }

    if (noSaveDirectories) {
      this.error(`Missing save slot directories or files in "${dir}"`);
    }

    if (files.includes("tracker")) {
      const trackblocks = await readdir(resolve(dir, "tracker"));

      for (const trackblock of trackblocks) {
        const trackblockPath = resolve(dir, "tracker", trackblock);
        saveFilesPromises.push(
          readFile(trackblockPath).then((data) => [trackblockPath, data])
        );
      }
    }

    const saveFiles = await Promise.all(saveFilesPromises);
    const saveTypes = new Set();

    for (const [path, saveFile] of saveFiles) {
      if (path.includes("trackblock")) {
        continue;
      }

      const { type, version } = getSaveType(saveFile);
      saveTypes.add(type);
      this.verbose(
        `Found ${getPrettySaveType(type)} save file (${version}) in ${path}`
      );
    }

    if (saveTypes.size > 1) {
      this.error(
        "Mixed save types. Please ensure there is only one type of save file in input directory."
      );
    }

    return saveFiles;
  }

  /**
   * Wrapper function for mkdir to allow skipping directories when dry flag is on
   *
   * @param path The path to create
   * @param options The options to pass to mkdir
   *
   * @returns A promise that resolves to the path of the created directory or undefined if it failed
   */
  private async createDirectory(
    path: PathLike,
    options?: Mode | MakeDirectoryOptions | null
  ): Promise<string | undefined> {
    if (this._dry) {
      if (this._dryDirectorySet.has(path.toString())) {
        return;
      }

      this._dryDirectorySet.add(path.toString());
      this.log(`Should create directory "${path}"`);
      return;
    }

    if (this._verbose) {
      this.log(`Creating directory "${path}"`);
    }

    return mkdir(path, options);
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
      throw new Error(`No options.sav file found in "${dir}"`);
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
  private async validateOutputDirectory(): Promise<OutputDirectoryValidation> {
    if (!existsSync(this.outputDir)) {
      return OutputDirectoryValidation.NOT_EXISTS;
    }

    const stat = await lstat(this.outputDir);

    if (!stat.isDirectory()) {
      return OutputDirectoryValidation.NOT_DIR;
    }

    const contents = await readdir(this.outputDir);

    if (contents.length === 0) {
      return OutputDirectoryValidation.DIR_EMPTY;
    }

    return OutputDirectoryValidation.DIR_NOT_EMPTY;
  }

  /**
   * This will prompt to remove the output directory if force is true
   *
   * @returns void
   */
  private async handleForceFlag() {
    if (!this._force) {
      this.error("Set -f to allow deleting files");
    }

    if (await ux.confirm(`Remove ${this.outputDir}?`)) {
      await rm(this.outputDir, { force: true, recursive: true });
      await this.createDirectory(this.outputDir);
    } else {
      this.exit(1);
    }
  }

  /**
   * Validate the output directory and create it if it doesn't exist
   *
   * @returns void resolving promise
   */
  private async validateAndCreateOutputDirectory() {
    const outputValidation = await this.validateOutputDirectory();

    switch (outputValidation) {
      case OutputDirectoryValidation.NOT_EXISTS:
        this.verbose(`Creating dir "${this.outputDir}"`);
        await this.createDirectory(this.outputDir);
        break;

      case OutputDirectoryValidation.NOT_DIR:
        this.warn(`"${this.outputDir}" exists but is not a directory`);
        await this.handleForceFlag();
        break;

      case OutputDirectoryValidation.DIR_NOT_EMPTY:
        this.warn(`"${this.outputDir}" exists but is not empty`);
        await this.handleForceFlag();
        break;

      case OutputDirectoryValidation.DIR_EMPTY:
        this.verbose(`Using existing empty dir "${this.outputDir}"`);
        break;
    }
  }

  /**
   * Convert and write the save file to the output directory
   *
   * @param savePath The path to the save file
   * @param saveBuffer The buffer of the original save file
   * @returns void resolving promise
   */
  private async convertAndWrite(
    savePath: string,
    saveBuffer: ArrayBufferLike
  ): Promise<void> {
    const relativePath = relative(this.inputDir, savePath);
    const directoryName = dirname(relativePath);
    const dirPath = resolve(this.outputDir, directoryName);
    const fileName = basename(relativePath);
    const outputPath = resolve(this.outputDir, directoryName, fileName);

    if (!existsSync(dirPath)) {
      await this.createDirectory(dirPath, { recursive: true });
    }

    if (this._dry) {
      this.log(`Should convert and write "${savePath}" to "${outputPath}"`);
      return;
    }

    if (this._verbose) {
      this.verbose(`Converting "${savePath}"`);
    }

    const convertedBuffer = convertSaveFile(
      saveBuffer,
      savePath.includes("trackblock")
    );

    if (this._verbose) {
      this.verbose(`Writing "${savePath}" to "${outputPath}"`);
    }

    return writeFile(outputPath, Buffer.from(convertedBuffer));
  }

  /**
   * Copy file from images directory
   *
   * @param dir The directory to copy from
   * @param filename The filename to copy
   * @returns void resolving promise
   */
  private async copyImage(dir: string, filename: string): Promise<void> {
    const inputPath = resolve(this.inputDir, dir, filename);
    const outputPath = resolve(this.outputDir, dir, filename);
    if (this._dry) {
      this.log(`Should copy "${inputPath}" to "${outputPath}"`);
      return;
    }

    if (this._verbose) {
      this.verbose(`Copying "${inputPath}" to "${outputPath}"`);
    }

    if (!existsSync(inputPath)) {
      this.verbose(`File "${inputPath}" does not exist"`);
      return;
    }

    return copyFile(inputPath, outputPath);
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CLI);

    if (flags.verbose) {
      this._verbose = true;
      this.log("Verbose output enabled");
    }

    if (flags.force) {
      this._force = true;
    }

    if (flags.dry) {
      this._dry = true;
      this.log("Running in dry mode");
    }

    this.outputDir =
      args.output ?? resolve(process.cwd(), this.generateOutputDirName());

    this.inputDir = args.input;

    await this.validateAndCreateOutputDirectory();

    // Read and validate save files
    const saveFiles = await this.getSaveFiles(args.input);
    const optionFile = await this.getOptionFile(args.input);

    // Trigger buffers conversion
    const convertPromises: Promise<void>[] = [];
    const saveFileDirs = new Set<string>();

    for (const [savePath, saveBuffer] of saveFiles) {
      convertPromises.push(this.convertAndWrite(savePath, saveBuffer));
      saveFileDirs.add(relative(this.inputDir, dirname(savePath)));
    }

    saveFileDirs.delete("tracker");

    convertPromises.push(
      this.convertAndWrite(resolve(args.input, "option.sav"), optionFile)
    );

    // Trigger image copying
    const copyPromises: Promise<void>[] = [];

    for (const saveFileDir of saveFileDirs) {
      copyPromises.push(this.copyImage(saveFileDir, "caption.jpg"));
    }

    const inputPictBookDir = resolve(this.inputDir, "pict_book");
    if (existsSync(inputPictBookDir)) {
      await this.createDirectory(resolve(this.outputDir, "pict_book"));
      const pictBookFiles = await readdir(inputPictBookDir);
      for (const imageName of pictBookFiles) {
        copyPromises.push(this.copyImage("pict_book", imageName));
      }
    }

    const inputAlbumDir = resolve(this.inputDir, "album");
    if (existsSync(inputPictBookDir)) {
      await this.createDirectory(resolve(this.outputDir, "album"));
      const albumFiles = await readdir(inputAlbumDir);
      for (const imageName of albumFiles) {
        copyPromises.push(this.copyImage("album", imageName));
      }
    }

    // Wait for all to finish
    await Promise.all([...convertPromises, ...copyPromises]);

    this.log("Finished!");
  }
}
