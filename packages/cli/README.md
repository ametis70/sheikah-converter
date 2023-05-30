oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![GitHub license](https://img.shields.io/github/license/oclif/hello-world)](https://github.com/oclif/hello-world/blob/main/LICENSE)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cli
$ sheikahcli COMMAND
running command...
$ sheikahcli (--version)
cli/0.0.0 darwin-arm64 node-v14.20.0
$ sheikahcli --help [COMMAND]
USAGE
  $ sheikahcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sheikahcli hello PERSON`](#sheikahcli-hello-person)
* [`sheikahcli hello world`](#sheikahcli-hello-world)
* [`sheikahcli help [COMMANDS]`](#sheikahcli-help-commands)
* [`sheikahcli plugins`](#sheikahcli-plugins)
* [`sheikahcli plugins:install PLUGIN...`](#sheikahcli-pluginsinstall-plugin)
* [`sheikahcli plugins:inspect PLUGIN...`](#sheikahcli-pluginsinspect-plugin)
* [`sheikahcli plugins:install PLUGIN...`](#sheikahcli-pluginsinstall-plugin-1)
* [`sheikahcli plugins:link PLUGIN`](#sheikahcli-pluginslink-plugin)
* [`sheikahcli plugins:uninstall PLUGIN...`](#sheikahcli-pluginsuninstall-plugin)
* [`sheikahcli plugins:uninstall PLUGIN...`](#sheikahcli-pluginsuninstall-plugin-1)
* [`sheikahcli plugins:uninstall PLUGIN...`](#sheikahcli-pluginsuninstall-plugin-2)
* [`sheikahcli plugins update`](#sheikahcli-plugins-update)

## `sheikahcli hello PERSON`

Say hello

```
USAGE
  $ sheikahcli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/ametis70/sheikah-translator/blob/v0.0.0/dist/commands/hello/index.ts)_

## `sheikahcli hello world`

Say hello world

```
USAGE
  $ sheikahcli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ sheikahcli hello world
  hello world! (./src/commands/hello/world.ts)
```

## `sheikahcli help [COMMANDS]`

Display help for sheikahcli.

```
USAGE
  $ sheikahcli help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sheikahcli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `sheikahcli plugins`

List installed plugins.

```
USAGE
  $ sheikahcli plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ sheikahcli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `sheikahcli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sheikahcli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sheikahcli plugins add

EXAMPLES
  $ sheikahcli plugins:install myplugin 

  $ sheikahcli plugins:install https://github.com/someuser/someplugin

  $ sheikahcli plugins:install someuser/someplugin
```

## `sheikahcli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ sheikahcli plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ sheikahcli plugins:inspect myplugin
```

## `sheikahcli plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sheikahcli plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sheikahcli plugins add

EXAMPLES
  $ sheikahcli plugins:install myplugin 

  $ sheikahcli plugins:install https://github.com/someuser/someplugin

  $ sheikahcli plugins:install someuser/someplugin
```

## `sheikahcli plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ sheikahcli plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ sheikahcli plugins:link myplugin
```

## `sheikahcli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sheikahcli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sheikahcli plugins unlink
  $ sheikahcli plugins remove
```

## `sheikahcli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sheikahcli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sheikahcli plugins unlink
  $ sheikahcli plugins remove
```

## `sheikahcli plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sheikahcli plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sheikahcli plugins unlink
  $ sheikahcli plugins remove
```

## `sheikahcli plugins update`

Update installed plugins.

```
USAGE
  $ sheikahcli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
