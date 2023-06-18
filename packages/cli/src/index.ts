import { resolve } from "node:path";
import { mkdir, rm } from "node:fs/promises";

import { Command, Args, Flags, ux } from "@oclif/core";

import {
  generateOutputDirFilename,
  getOptionFile,
  getSaveFiles,
  OutputDirectoryValidation,
  validateOutputDirectory,
} from "./utils";

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

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Convert);

    const outputDir =
      args.output ?? resolve(process.cwd(), generateOutputDirFilename());

    const outputValidation = await validateOutputDirectory(outputDir);

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

    await getSaveFiles(args.input);
    await getOptionFile(args.input);
  }
}
