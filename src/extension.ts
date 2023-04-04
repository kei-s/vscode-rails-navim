// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let openAlternateFile = vscode.commands.registerCommand('rails-navigation.openAlternateFile', async () => {
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

		let candidate!: string;
		if (relativePath.match(/^app\/models/)) {
			candidate = relativePath.replace(/^app/, 'spec').replace(/\.rb$/, '_spec.rb');
		}
		if (relativePath.match(/^app\/controllers/)) {
			candidate = relativePath.replace(/^app\/controllers/, 'spec/').replace(/\_controller.rb$/, '_spec.rb');
		}
		if (relativePath.match(/^app\/views/)) {
			candidate = relativePath.replace(/^app\/views/, 'spec/').replace(/\.[^.]+$/, '_spec.rb');
		}
		if (relativePath.match(/^spec\/models/)) {
			candidate = relativePath.replace(/^spec/, 'app').replace(/\_spec\.rb$/, '.rb');
		}
		if (relativePath.match(/^spec\/(controllers|requests|system)/)) {
			candidate = relativePath.replace(/^spec\/(controllers|requests|system)/, 'app/controllers').replace(/\_spec\.rb$/, '_controller.rb');
		}
		// TODO: else
		await showOrQuickOpen(workspaceRoot, candidate);
		return;
	});

	let openRelatedFile = vscode.commands.registerCommand('rails-navigation.openRelatedFile', async () => {
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
		const document = editor.document;

		const relativePath = path.relative(workspaceRoot, document.fileName);
		if (relativePath.match(/^app\/controllers/)) {
			const actionName = getMethodName(document, editor.selection.active);
			if (!actionName) {
				return;
			}
			const candidate = relativePath.replace(/^app\/controllers/, 'app/views').replace(/\_controller.rb$/, `/${actionName}`);
			const dirPath = path.dirname(path.join(workspaceRoot, candidate));
			if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
				const matchingFile = fs.readdirSync(dirPath).find(file => file.startsWith(actionName));
				if (matchingFile) {
					const openingDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(dirPath, matchingFile)));
					await vscode.window.showTextDocument(openingDocument, { preview: false });
					return;
				}
			}
			await vscode.commands.executeCommand('workbench.action.quickOpen', candidate);
			return;
		}
		if (relativePath.match(/^app\/views/)) {
			const candidate = relativePath.replace(/^app\/views/, 'app/controllers').replace(/\/([^/]+)\/[^/]+\..+$/, '/$1_controller.rb');
			const actionName = path.basename(relativePath).replace(/\..+$/, '');
			if (fs.existsSync(path.join(workspaceRoot, candidate))) {
				const openingDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(workspaceRoot, candidate)));
				vscode.window.showTextDocument(openingDocument, { preview: false }).then(editor => {
					let targetPosition = null;
					for (let line = 0; line < openingDocument.lineCount; line++) {
						const lineText = openingDocument.lineAt(line).text;
						if (lineText.match(new RegExp(`\\s*def\\s+${actionName}`))) {
							targetPosition = new vscode.Position(line, 0);
							break;
						}
					}
					if (targetPosition) {
						editor.selection = new vscode.Selection(targetPosition, targetPosition);
					}
				});
				return;
			} else {
				await vscode.commands.executeCommand('workbench.action.quickOpen', candidate);
				return;
			}
		}
	});

	context.subscriptions.push(openAlternateFile);
	context.subscriptions.push(openRelatedFile);
}

function getMethodName(document: vscode.TextDocument, position: vscode.Position): string | null {
	const methodDefinitionRegex = /^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*(\?|!)?)/;
	for (let line = position.line; line >= 0; line--) {
		const lineText = document.lineAt(line).text;
		const match = methodDefinitionRegex.exec(lineText);
		if (match) {
			return match[1];
		}
	}
	return null;
}

async function showOrQuickOpen(workspaceRoot: string, candidate: string) {
	const absolutePath = path.join(workspaceRoot, candidate);
	if (fs.existsSync(absolutePath)) {
		const openingDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(absolutePath));
		await vscode.window.showTextDocument(openingDocument, { preview: false });
	} else {
		await vscode.commands.executeCommand('workbench.action.quickOpen', candidate);
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
