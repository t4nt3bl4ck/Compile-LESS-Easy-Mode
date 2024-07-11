# Overview

Simplify your workflow with .LESS files in Visual Studio Code.

Automatically compile your [.LESS stylesheets](http://lesscss.org/) upon saving, without the need for a build task.

## When To Use

Use this extension when you want to compile your `.less` files to `.css` files automatically on save.

You can use this extension right out of the box without any configuration. However, you also have the option to customize the settings to suit your personal preferences.

Check the Configuration process [Here](#configuration).


---

## Requirements

Make sure [LESS](http://lesscss.org/) is installed in your machine.


---

# Features

This extension is onfigurable at multiple levels: workspace, user, and individual file.

This flexibility allows you to tailor settings to meet specific project needs or personal preferences. 


- Compile `.less` files to `.css`:
  
  - From the command palette with "Compile LESS Easy Mode: Compile". [How To](#how-to)

  - Automatically on save, keeping the same base name.

      for example: `styles.less` --> `styles.css`.

- Compress the `.css`.

  remove unnecessary white-spaces from the compiled file.

- Change the extension to which the `.less` file is compiled.

  for example: `.wxss` instead of `.css`.

- Support for `main` file.

- Alternative output file.

- Suppress the compilation for the `.css` file.


## Included Features

- The standard _Errors and Warnings_ list manages the compilation errors.

- [autoprefixer](https://github.com/postcss/autoprefixer) plugin included.

- IE8 Compatibility included.


---

# Default Settings

- The compilation on save occurs for every `.less` file in the project.
- Output Extension: `.css`.
- Output Path: `null`.
  - The `.css` file is compiled in the same directory of the `.less` file.
- Source maps creation (`.css.map` files): `disabled`.
- Keep Folder Structure: `disabled`.
- CSS sub-folder: `disabled`. 
- Compression: `disabled`.
- Relative URLs: `disabled`.
- Inline Javascript: `disabled`.
- Auto prefixer: `disabled`.
- IE8 Compatibility: `enabled`.


---

# Basic Usage

1.  Create a `.less` file.
2.  Save your file using:

      `CMD + S` on Mac.

      `CTRL + S` on Windows.

      Or from the command palette: "Compile LESS Easy Mode: Compile". [How To](#how-to)

3.  A `.css` file is automatically generated. 

      The default extension is `.css`.
4.  If everything went right you should see a temporary message in the status bar:

      **LESS file compiled in _X_ ms,**


---

# Advanced Usage

## Configuration

To configure this extension, follow these steps:

1. Open the Command Palette. [How To](#how-to)
2. Type `Preferences: Open Settings (UI)` and select it.
3. In the settings UI, search for `Compile LESS Easy Mode`.

For more detailed information on configuring settings in Visual Studio Code, refer to the [User and Workspace Settings documentation](https://code.visualstudio.com/docs/getstarted/settings).


---

## Project-Wide Settings 

- Project-wide settings are configured using the standard `settings.json` file at the root level of your project., searching for it using the Command Palette ([How To](#how-to)).

  But if you don't want to get your hands dirty writing code, you can follow the Configuration process [Above](#configuration).

- The properties with a default value should not be visible inside the `settings.json` file.

- If instead you like getting your hands dirty writing code, use the `"compileLessEasyMode.compile.property"` key changing `property` with any of the following properties:
  
`outputPath: { boolean | filepath: string | folderpath: string }`

- outputPath: `false` -> don't compile the `.css` file.
- outputPath: `true/null` -> compile the `.css` file in the same folder as the `.less` file.
- outputPath: `folderPath` -> compile the `.css` file with the same `.less` base name.

  - _NOTE_: A folder path must end with a `/` (or `\` for Windows).

    for example: `../css/` not `../css`

- Filepath is relative to the current file, so relative paths can be used, e.g. `../../styles.css`
- `folderPath` can contain any of these:
  - `${workspaceFolder}` — the root folder for the VS Code project containing the `.less` file.
  - `$1` is the "base" name of the `.less` file.
  
    for example: `styles.css`, `$1` would be `styles`.
  - `$2` is the extension of the css file, usually `.css` unless `outputExtension` is used.
- Example: `${workspaceFolder}/style/css/style-$1$2`

`outputExtension: { string }`

- Default value: `.css`.
- Allows you to specify a different file extension for the output file.

  for example: `.wxss` instead of `.css`
- This applies also the `.map` file

  for example: `.wxss.map`

`sourceMap: { boolean }`

- Enables generation of source map files.
- When enabled:
  - A `.css.map` file will be compiled in the same folder as the `.css` file.
  - `outputPath` setting is respected.

`compress: { boolean }`

- Compresses the compiled file by removing surplus white spaces.

`sameBaseWithCssFolder: { boolean }`

- Compiles the file in a 'css' folder inside the same .less file folder.
- When enabled:
  - `outputPath` property must be null/true. (null meaning there is no `outputPath` property inside settings.json). 
  - This setting will be ignored if `outputPath` is NOT null/true.

`keepFolderStructure: { boolean }`

- Compiles the file inside the specified `outputPath` keeping the same folder structure as the `.less` file.
- When enabled:
  - `outputPath` property must be a valid path (string).
  - This setting will be ignored if `outputPath` is NOT a valid path (string).

`relativeUrls: { boolean }`

- Specifies whether URLs in `@import` inside of compiled file, should be rewritten relative to the importing file.
- Has no effect on the `outputPath` parameter.

  /main.less:

  ```less
    // relativeUrls: true
    @import 'css/feature/feature.less';
  ```

`autoprefixer: { string | string[] }`

- Enables the [autoprefixer plugin for less](https://github.com/postcss/autoprefixer).
  - Automatically adds or removes vendor-prefixes needed to support a set of browsers specified in the `settings.json` file.
- The `autoprefixer` option can be:
  - A the comma-separated list of `browsers`.
  - A string array of this list.
- Example of `autoprefixer`:

  ```json
    "compileLessEasyMode.compile.autoprefixer": "> 5%, last 2 Chrome versions, not ie 6-9" // Value set by default
  ```

- See [browserslist](https://github.com/ai/browserslist#queries) documentation for further examples of browser queries.
- If used as per-file configuration, the browsers listed has to be semi-colon separated

  for example using <br/>

  `// autoprefixer: "> 5%; last 2 Chrome versions; not ie 6-9", sourceMap: true, out: "../css/style.css"`

`ie8Compatibility: { boolean }`

- When:
  - `true`: prevents inlining of `data-uri` that exceed 32KB.
  - `false`: removes restriction on `data-uri` size.

`javascriptEnabled: { boolean }`

- Enables inline javascript inside less files.
- Usage: backticks (`): 

  `` font-weight: `10+10`px'; ``

`math: { "parens-division" | "parens" | "always" | "strict" | "strict-legacy" }`

- Controls the `math` option [used by the less compiler](http://lesscss.org/usage/#less-options-math).
- By default is set to `parens-division`.


---

## Per-File Configuration

Per-file configuration is possible, but the settings available in the _User Workspace_, as described in the [Configuration Process](#configuration), should manage most, if not all, cases you might encounter.

So I would suggest first to try them, and if they do not meet your needs, use this setting, or if you have any suggestion, feel free to [ask me](https://github.com/t4nt3bl4ck/Questions).

Otherwise about per-file configuration:

- Settings can also be specified per `.less` file as a comment on the _first_ line.
- Settings are comma-separated and strings are _not_ "quoted".
- Example:

  ```less
  // out: "../dist/app.css", compress: true, sourceMap: false

  body,
  html {
    ...;
  }
  ```


---

# Settings Cascade Order

Settings are applied in the following order:

1.  User Settings
2.  Workspace Settings (`settings.json`)
3.  Per-file Settings


---

# Acknowledgements

- Configuration borrowed from the `Easy LESS` _**Extension**_ made by [mrcrowl](https://github.com/mrcrowl/vscode-easy-less)


---

# How To

## Mac

Open Command Palette on Mac: `CMD + SHIFT + P`;


---

## windows

Open Command Palette on Windows: `CTRL + SHIFT + P`;

