import * as vscode from "vscode";

import * as Constants from "./constantVariables";
import * as Function from "./functions";
import { Preprocessor } from "./configuration";
import CompileLessEasyModeCommand from "./compileLessEasyModeCommand";

let lessDiagnosticCollection: vscode.DiagnosticCollection;

/**
 * This method is called when your extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
  lessDiagnosticCollection = vscode.languages.createDiagnosticCollection();

  const preprocessors: Preprocessor[] = [];

  /**
   * Compile 'compileLessEasyMode' command
   */
  const compileLessEasyMode = vscode.commands.registerCommand(Constants.COMPILE_COMMAND, () => {
    const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

    if (activeEditor) {
      const document: vscode.TextDocument = activeEditor.document;

      if (Function.isLessFile(document)) {
        document.save();
        new CompileLessEasyModeCommand(document, lessDiagnosticCollection)
          .setPreprocessors(preprocessors)
          .execute();
      } else {
        vscode.window.showWarningMessage(Constants.MSG_WRONG_EXTENSION);
      }
    } else {
      vscode.window.showInformationMessage(Constants.MSG_NO_EDITOR);
    }
  });

  /**
   * Compile less on save when file is dirty
   *
   * By compiling only when the file is saved and dirty,
   * the extension avoids unnecessary processing and compilation steps.
   * This ensures that compilation occurs only
   * when the user has finished making changes and explicitly saves the file.
   */
  const didSaveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
    if (Function.isLessFile(document)) {
      new CompileLessEasyModeCommand(document, lessDiagnosticCollection)
        .setPreprocessors(preprocessors)
        .execute();
    }
  });

  /**
   * Compile less on save when file is clean
   *
   * Normally, the onDidSaveTextDocument event
   * does not trigger for clean saves (when there are no unsaved changes).
   * This event (onWillSaveTextDocument) is used as a fallback to catch clean saves
   * and still trigger the compilation process for .less files.
   */
  const willSaveEvent = vscode.workspace.onWillSaveTextDocument((e) => {
    if (Function.isLessFile(e.document) && !e.document.isDirty) {
      new CompileLessEasyModeCommand(e.document, lessDiagnosticCollection)
        .setPreprocessors(preprocessors)
        .execute();
    }
  });

  /**
   * Dismiss less errors on file close
   *
   * When a .less file is closed, there's no need to keep displaying error or warning indicators
   * related to that file because the user is no longer actively editing it.
   */
  const didCloseEvent = vscode.workspace.onDidCloseTextDocument((doc: vscode.TextDocument) => {
    if (Function.isLessFile(doc)) {
      lessDiagnosticCollection.delete(doc.uri);
    }
  });

  context.subscriptions.push(compileLessEasyMode);
  context.subscriptions.push(willSaveEvent);
  context.subscriptions.push(didSaveEvent);
  context.subscriptions.push(didCloseEvent);

  /**
   * Return an API so that other extensions can build upon LESSEasyCompile.
   */
  return {
    registerPreprocessor: (processor: Preprocessor): void => void preprocessors.push(processor),
  };
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  if (lessDiagnosticCollection) {
    lessDiagnosticCollection.dispose();
  }
}
