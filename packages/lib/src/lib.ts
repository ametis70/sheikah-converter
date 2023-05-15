export enum SaveType {
  WiiU = 0x1b470000,
  Switch = 0x0000471b,
}

export const getSaveType = (buffer: ArrayBuffer): SaveType => {
  const type = new Uint32Array(buffer, 0, 4);

  if (!Object.values(SaveType).includes(type[0])) {
    throw new TypeError("The provided input is not a a valid option.sav file");
  }

  return type[0];
};
