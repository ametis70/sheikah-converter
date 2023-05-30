import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getSaveType } from "@sheikah-translator/lib";

export const getSaveFiles = async (
  dir: string
): Promise<[string, Buffer][]> => {
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
    console.log(`Found ${type} save file (${version}) in ${path}`);
  }

  return saveFiles;
};

export const getOptionFile = async (dir: string): Promise<Buffer> => {
  const files = await readdir(dir);

  if (!files.includes("option.sav")) {
    throw new Error(`No options.sav file found in ${dir}`);
  }

  const path = resolve(dir, "option.sav");
  const optionFile = await readFile(path);

  const { type, version } = getSaveType(optionFile);
  console.log(`Found ${type} option file (${version}) in ${path}`);

  return optionFile;
};

export const validateOutputDirectory = async (
  dir: string
): Promise<boolean> => {
  return (
    !existsSync(dir) || (existsSync(dir) && (await readdir(dir)).length === 0)
  );
};
