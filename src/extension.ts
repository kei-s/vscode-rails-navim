// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('rails-navigation.openSpecFile', async () => {
		const workspace = vscode.workspace.workspaceFolders;
		if (!workspace) {
			vscode.window.showErrorMessage('No workspace found.');
			return;
		}
		const workspaceRoot = workspace![0].uri.fsPath;
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found.');
			return;
		}
		const relativePath = path.relative(workspaceRoot, editor.document.fileName);

		let specCandidate!: string;
		if (relativePath.match(/^app\/controllers/)) {
			specCandidate = relativePath.replace(/^app\/controllers/, 'spec/').replace(/\_controller.rb$/, '_spec.rb');
		}
		if (relativePath.match(/^app\/models/)) {
			specCandidate = relativePath.replace(/^app/, 'spec').replace(/\.rb$/, '_spec.rb');
		}
		await vscode.commands.executeCommand('workbench.action.quickOpen', specCandidate);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
