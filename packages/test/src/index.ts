import { mkdtemp, copyFile, readdir, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { tmpdir } from "node:os";

async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name[0] === ".") continue;

    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await copyFile(srcPath, destPath);
  }
}

export const getTempSaveDir = async (
  type: "wiiu" | "switch"
): Promise<string> => {
  const tmpDir = await mkdtemp(resolve(tmpdir(), `sc-${type}-`));

  await copyDir(resolve(__dirname, "..", "data", type), tmpDir);

  return tmpDir;
};
