# `@sheikah-converter/cli`

> CLI to convert The Legend of Zelda: Breath of the Wild game saves between console formats (Wii U to Switch and viceversa)

```man
USAGE
  $ botwc INPUT [OUTPUT] [-f] [-d] [-v]

ARGUMENTS
  INPUT   The directory containing the save to convert
  OUTPUT  The directory to write the converted save to

FLAGS
  -d, --dry      Dry run (do not write files)
  -f, --force    Overwrite existing output directory
  -v, --verbose  Print verbose output

DESCRIPTION
  Converts a BotW saves

  This program converts a BotW save directory to from one console format to another.

  This works with Wii U and Switch saves up to version 1.6 of the game.

  Version 1.5 and 1.6 are compatible and should work interchangeably on both platforms.
```

# Example

The following example will convert the save files in the directory `./original/save/backup` and write them to the `./converted` direcetory. If the directory already exists and is not empty, the command will fail (use `-f` to enable prompting for deleting files).

```
botwc ./original/save/backup/ ./converted
```
