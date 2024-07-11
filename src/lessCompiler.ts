import * as path from "path";

import less from "less";

import * as Configuration from "./configuration";
import * as Function from "./functions";
import * as FileOptionsParser from "./fileOptionParser";
import { LessDocumentResolverPlugin } from "./lessDocumentResolverPlugin";

export async function compile(
  lessFile: string,
  content: string,
  defaults: Configuration.CompileLessEasyModeOptions,
  preprocessors: Configuration.Preprocessor[] = [],
): Promise<void> {
  const options: Configuration.CompileLessEasyModeOptions = FileOptionsParser.parse(
    content,
    defaults,
  );
  const lessPath: string = path.dirname(lessFile);

  // No output.
  if (options.outputPath === false) {
    return;
  }

  // Option `out`
  const cssFilepath = Function.chooseOutputFilename(options, lessFile, lessPath);
  delete options.outputPath;

  // Option `sourceMap`.
  let sourceMapFile: string | undefined;
  if (options.sourceMap) {
    options.sourceMap = Function.configureSourceMap(lessFile, cssFilepath);
  }

  // Option `autoprefixer`.
  options.plugins = [];
  if (options.autoprefixer) {
    const LessPluginAutoPrefix = require("less-plugin-autoprefix");
    const browsers: string[] = Function.cleanBrowsersList(options.autoprefixer);
    const autoprefixPlugin = new LessPluginAutoPrefix({ browsers });

    options.plugins.push(autoprefixPlugin);
  }

  options.plugins.push(new LessDocumentResolverPlugin());

  if (preprocessors.length > 0) {
    // Clear options.rootFileInfo to ensure that less will not reload the content from the filepath again.
    delete options.rootFileInfo;

    // Used to cache some variables for use by other preprocessors.
    const ctx = new Map<string, any>();
    for await (const p of preprocessors) {
      content = await p(content, ctx);
    }
  }

  // Render to CSS.
  const output = await less.render(content, options);
  await Function.writeFileContents(cssFilepath, output.css);
  if (output.map && sourceMapFile) {
    await Function.writeFileContents(sourceMapFile, output.map);
  }
}
