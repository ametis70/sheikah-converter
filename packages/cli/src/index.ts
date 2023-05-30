import { resolve } from "node:path";
import { Command, Args, Flags } from "@oclif/core";

import { getOptionFile, getSaveFiles, validateOutputDirectory } from "./utils";

export class Convert extends Command {
  static summary = "Converts a BotW save";
  static description = `
This program converts a BotW save directory to from one console format to another. This works with Wii U and Switch saves up to version 1.6 of the game. Version 1.5 and 1.6 are compatible and should load on both consoles.
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
    const { args } = await this.parse(Convert);

    validateOutputDirectory(
      args.output ?? resolve(process.cwd(), `botw-${new Date().toISOString()}`)
    );

    await getSaveFiles(args.input);
    await getOptionFile(args.input);
  }
}
