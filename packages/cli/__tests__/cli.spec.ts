import { stdout, stderr } from "stdout-stderr";
import { CLI } from "../src";

describe("botwc CLI", () => {
  beforeEach(() => {
    stdout.start();
    stderr.start();
  });

  afterEach(() => {
    stdout.stop();
    stderr.stop();
  });

  it("Should fail if no input directory is provided", () => {
    return expect(CLI.run([])).rejects.toThrow();
  });
});
