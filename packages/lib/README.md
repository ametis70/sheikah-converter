# `@sheikah-converter/lib`

> Library to convert The Legend of Zelda: Breath of the Wild game saves between console formats (Wii U to Switch and viceversa)

## Usage (Node.js)

```ts
import fs from "node:fs/promises";
import path from "node:path";

import { getSaveType, convertSaveFile, getPrettySaveType } from '@sheikah-converter/lib';

const convert = async () => {
    await file = fs.read(path.resolve('directory', 'that', 'contains', 'save', '0', 'game_data.sav'));
    const { type, version } = getSaveType(file);

    console.log(getPrettySave(type), version) // prints "Switch, 1.6"

    const convertedBuffer = convertSaveFile(file);

    return writeFile(path.resolve('output', 'directory', '0', 'game_data.sav'), Buffer.from(convertedBuffer));
}

convert();
```

## API

### `getSaveType(buffer) -> { type: number, version: string }`

This function returns an object with the console (type) and version number for the save file. It does not work with trackblock files

| Parameter | Description             | Required | Default |
| --------- | ----------------------- | -------- | ------- |
| `buffer`  | Bytes from a save file. | `true`   |         |


### `convertSaveFile(buffer, trackblock) -> ArrayBuffer`

Convert a save file from a console format to the other.

| Parameter    | Description                                                                             | Required | Default |
| ------------ | --------------------------------------------------------------------------------------- | -------- | ------- |
| `buffer`     | Bytes from a save file.                                                                 | `true`   |         |
| `trackblock` | Boolean flag to use special logic when a file is of trackblock (Hero's Path functionality) type | `false`  | `false` |

### `getPrettySaveType(type) -> string`

Get the name of the console as a string. This function is meant to be used with `getSaveType`.

| Parameter | Description                                                               | Required | Default |
| --------- | ------------------------------------------------------------------------- | -------- | ------- |
| `type`    | Number that represents that represents the console in the `SaveType` enum | `true`   |         |
