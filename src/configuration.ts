import * as vscode from "vscode";
import * as path from "path";

export function getGlobalOptions(document: vscode.TextDocument): CompileLessEasyModeOptions {
  const lessFilenamePath: path.ParsedPath = path.parse(document.fileName);
  const defaultOptions: CompileLessEasyModeOptions = {
    plugins: [],
    rootFileInfo: getRootFileInfo(lessFilenamePath),
    relativeUrls: false,
  };

  const configuredOptions = vscode.workspace
    .getConfiguration("compileLessEasyMode", document.uri)
    .get<CompileLessEasyModeOptions>("compile");
  return { ...defaultOptions, ...configuredOptions };
}

export function getRootFileInfo(parsedPath: path.ParsedPath): Less.RootFileInfo {
  return {
    filename: `${parsedPath.name}.less`,
    currentDirectory: parsedPath.dir,
    relativeUrls: false,
    entryPath: `${parsedPath.dir}/`,
    rootpath: null!,
    rootFilename: null!,
    reference: undefined!,
  };
}

export interface CompileLessEasyModeOptions extends Less.Options {
  outputPath?: string | boolean;
  outputExtension?: string;
  sameBaseWithCssFolder?: boolean;
  keepFolderStructure?: boolean;
  sourceMap?: any;
  relativeUrls?: boolean;
  autoprefixer?: string | string[];
  javascriptEnabled?: boolean;
  rootFileInfo?: Less.RootFileInfo;
}

export type Preprocessor = (lessContent: string, ctx: Map<string, any>) => Promise<string> | string;
