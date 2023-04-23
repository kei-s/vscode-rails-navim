import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export class EditorInfoError extends Error { }

export function getEditorInfo() {
	const workspace = vscode.workspace.workspaceFolders;
	if (!workspace) {
		throw new EditorInfoError('No workspace found.');
	}
	const workspaceRoot = workspace![0].uri.fsPath;
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		throw new EditorInfoError('No active editor found.');
	}
	const document = editor.document;
	const relativePath = path.relative(workspaceRoot, document.fileName);

	return { workspace, workspaceRoot, editor, document, relativePath };
}

export async function showOrQuickOpen(workspaceRoot: string, candidate: string) {
	const absolutePath = path.join(workspaceRoot, candidate);
	if (fs.existsSync(absolutePath)) {
		const openingDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(absolutePath));
		await vscode.window.showTextDocument(openingDocument, { preview: false });
	} else {
		await vscode.commands.executeCommand('workbench.action.quickOpen', candidate);
	}
}

export function getPositionedMethodName(document: vscode.TextDocument, position: vscode.Position): string | null {
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
