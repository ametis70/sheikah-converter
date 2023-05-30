export const arrToHex = (arr: Uint8Array) => {
  return (
    Buffer.from(arr)
      .toString("hex")
      .match(/.{1,2}/g)
      ?.join(" ") ?? ""
  );
};

export const formatArray = (arr: Uint8Array, name: string, i: number) =>
  `${name + arrToHex(arr.slice(i - 4, i))} *${arrToHex(
    arr.slice(i, i + 4)
  )}* ${arrToHex(arr.slice(i + 4, i + 4 + 32))}`;

export const compareArrays = (
  converted: Uint8Array,
  target: Uint8Array,
  original: Uint8Array
) => {
  for (let i = 0; i < converted.length; i++) {
    if (converted[i] !== target[i]) {
      console.log(`Difference found at index: ${i} ${i
        .toString(16)
        .padStart(8, "0")}
${formatArray(original, "[ original ]", i)}
${formatArray(converted, "[ coverted ]", i)}
${formatArray(target, "[  target  ]", i)}`);

      throw new Error("Arrays do not match");
    }
  }
};
