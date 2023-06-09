// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { openAlternateFile } from './openAlternateFile';
import { openRelatedFile } from './openRelatedFile';
import { goToFile } from './goToFile';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('rails-navim.openAlternateFile', openAlternateFile)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('rails-navim.openRelatedFile', openRelatedFile)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('rails-navim.goToFile', goToFile)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
