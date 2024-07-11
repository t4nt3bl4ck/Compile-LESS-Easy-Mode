import * as vscode from "vscode";
import { StatusBarMessageTypes } from "./statusBarMessageTypes";
import * as Constants from "./constantVariables";

let errorMessage: vscode.StatusBarItem | null;

export function hideError() {
  if (errorMessage) {
    errorMessage.hide();
    errorMessage = null;
  }
}

export function show(message: string, type: StatusBarMessageTypes) {
  hideError();

  switch (type) {
    case StatusBarMessageTypes.SUCCESS:
      return vscode.window.setStatusBarMessage(message, Constants.SUCCESS_DURATION_MS);

    case StatusBarMessageTypes.INDEFINITE:
      return vscode.window.setStatusBarMessage(message);

    case StatusBarMessageTypes.ERROR:
      errorMessage = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
      errorMessage.text = message;
      errorMessage.command = "workbench.action.showErrorsWarnings";
      errorMessage.color = Constants.ERROR_COLOR_CSS;
      errorMessage.show();
      setTimeout(hideError, Constants.ERROR_DURATION_MS);

      return errorMessage;
  }
}
