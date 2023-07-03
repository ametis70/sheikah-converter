# `@sheikah-converter/test`

> Test utilities and data to use in other packages

## API

### `getTempSaveDir(type) -> Promise<string>`

This function will copy a save directory to a temporary directory to make it available to other packages

| Parameter | Description                                               | Required | Default |
| --------- | --------------------------------------------------------- | -------- | ------- |
| `type`    | String used to select between Wii U and Switch save files | `true`   |         |

#### Other utilitary functions

##### `copyDir(src, dest) -> Promise<void>`

Recursively copy directory

| Parameter | Description               | Required | Default |
| --------- | ------------------------- | -------- | ------- |
| `src`     | Path of directory to copy         | `true`   |         |
| `dest`    | Destionation path to copy the directory | `true`   |         |

##### `createEmptyFile(path) -> Promise<void>`

Creates an empty file

| Parameter | Description                         | Required | Default |
| --------- | ----------------------------------- | -------- | ------- |
| `path`    | Path where the file will be created | `true`   |         |
