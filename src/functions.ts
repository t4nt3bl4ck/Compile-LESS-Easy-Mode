import * as path from "path";
import * as vscode from "vscode";
import fs from "fs/promises";

import * as Constants from "./constantVariables";
import * as Configuration from "./configuration";
import { CompileLessEasyModeOptions } from "./configuration";

export function chooseOutputFilename(
  options: Configuration.CompileLessEasyModeOptions,
  lessFile: string,
  lessPath: string,
) {
  const out: string | boolean | undefined = options.outputPath;
  const extension: string = chooseExtension(options);
  const filenameNoExtension: string = path.parse(lessFile).name;

  let cssRelativeFilename: string;
  if (typeof out === "string") {
    // Output to the specified directory structure.
    const interpolatedOut = interpolatePath(
      out.replace("$1", filenameNoExtension).replace("$2", extension),
      lessFile,
    );

    cssRelativeFilename = interpolatedOut;

    /**
     * Get the subfolders of the '/less/' folder to then add them
     * to the css out folder
     */
    if (options.keepFolderStructure) {
      const subFolders = getSubfolders(lessPath);
      cssRelativeFilename = `${cssRelativeFilename}${subFolders}`;
    }

    if (isFolder(cssRelativeFilename)) {
      // Folder.
      cssRelativeFilename = `${cssRelativeFilename}${filenameNoExtension}${extension}`;
    } else if (hasNoExtension(cssRelativeFilename)) {
      // No extension, append manually.
      cssRelativeFilename = `${cssRelativeFilename}${extension}`;
    }
  } else {
    // `out` not set: output to '/css/' folder inside the same basename as the less file
    if (options.sameBaseWithCssFolder) {
      lessPath = `${lessPath}/css/`;
    }

    cssRelativeFilename = filenameNoExtension + extension;
  }

  const cssFile = path.resolve(lessPath, cssRelativeFilename);
  return cssFile;
}

export function configureSourceMap(lessFile: string, cssFile: string) {
  // currently just has support for writing .map file to same directory
  const lessPath: string = path.parse(lessFile).dir;
  const cssPath: string = path.parse(cssFile).dir;
  const lessRelativeToCss: string = path.relative(cssPath, lessPath);

  const sourceMapOptions: Less.SourceMapOption = {
    outputSourceFiles: false,
    sourceMapBasepath: lessPath,
    sourceMapRootpath: lessRelativeToCss,
  };

  return sourceMapOptions;
}

export function cleanBrowsersList(autoprefixOption: string | string[]): string[] {
  const browsers: string[] = Array.isArray(autoprefixOption)
    ? autoprefixOption
    : ("" + autoprefixOption).split(/,|;/);

  return browsers.map((browser) => browser.trim());
}

// Writes a file's contents to a path and creates directories if they don't exist.
export async function writeFileContents(filepath: string, content: any): Promise<void> {
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, content.toString());
}

export function checkOptionsSetMessage(options: CompileLessEasyModeOptions) {
  if (options) {
    const { outputPath, keepFolderStructure, sameBaseWithCssFolder } = options;

    if (keepFolderStructure && sameBaseWithCssFolder) {
      if (typeof outputPath !== "string") {
        vscode.window.showWarningMessage(
          "Both 'keepFolderStructure' and 'sameBaseWithCssFolder' are enabled.\n'outputPath' is NOT a string so 'keepFolderStructure' will be ignored.",
        );
      } else {
        vscode.window.showWarningMessage(
          "Both 'keepFolderStructure' and 'sameBaseWithCssFolder' are enabled.\n'outputPath' is NOT true/null so 'sameBaseWithCssFolder' will be ignored.",
        );
      }
    } else {
      if (typeof outputPath !== "string" && keepFolderStructure) {
        vscode.window.showWarningMessage(
          "'keepFolderStructure' is enabled but 'outputPath' is NOT a string.\n'keepFolderStructure' will be ignored.",
        );
      }

      if (typeof outputPath === "string" && sameBaseWithCssFolder) {
        vscode.window.showWarningMessage(
          "'sameBaseWithCssFolder' is enabled but 'outputPath' is NOT true/null.\n'sameBaseWithCssFolder' will be ignored.",
        );
      }
    }
  }
}

export function isLessFile(document: vscode.TextDocument): boolean {
  return document.fileName.endsWith(Constants.LESS_EXTENSION);
}

/**
 *
 * ------------------------------------------------------------------------------
 *
 *
 */

function isFolder(filename: string): filename is `${string}/` | `${string}\\` {
  const lastCharacter = filename.slice(-1);
  return lastCharacter === "/" || lastCharacter === "\\";
}

function hasNoExtension(filename: string): boolean {
  return path.extname(filename) === "";
}

function interpolatePath(path: string, lessFilePath: string): string {
  if (path.includes("${workspaceFolder}")) {
    const lessFileUri = vscode.Uri.file(lessFilePath);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(lessFileUri);
    if (workspaceFolder) {
      path = path.replace(/\$\{workspaceFolder\}/g, workspaceFolder.uri.fsPath);
    }
  }

  if (path.includes("${workspaceRoot}")) {
    if (vscode.workspace.rootPath) {
      path = path.replace(/\$\{workspaceRoot\}/g, vscode.workspace.rootPath);
    }
  }

  return path;
}

function chooseExtension(options: CompileLessEasyModeOptions): string {
  if (options?.outputExtension) {
    if (options.outputExtension === "") {
      // Special case for no extension (no idea if anyone would really want this?).
      return "";
    }

    return ensureDotPrefixed(options.outputExtension) || Constants.DEFAULT_EXTENSION; // ###
  }

  return Constants.DEFAULT_EXTENSION;
}

function ensureDotPrefixed(extension: string): string {
  if (extension.startsWith(".")) {
    return extension;
  }

  return extension ? `.${extension}` : ""; // ###
}

/**
 *
 * @param path string
 * @returns string: sub-folders of the path starting from 'less', to be then appended to the outputPath if
 *          'keepFolderStructure' is set to TRUE
 */
function getSubfolders(path: string): string {
  const parts = path.split("/");
  const lessIndex = parts.indexOf("less");

  if (lessIndex === -1 || lessIndex === parts.length - 1) {
    // If "less" folder doesn't exist or is the last part, return empty string
    return "";
  }

  // Get subfolders after "less"
  const subfolders = parts.slice(lessIndex + 1);

  // Join subfolders with '/' and add '/' to the last subfolder
  const concatenatedSubfolders = subfolders.join("/") + "/";

  return concatenatedSubfolders;
}
