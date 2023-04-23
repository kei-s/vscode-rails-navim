import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getPositionedMethodName } from './util';

export async function openRelatedFile() {
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
        const actionName = getPositionedMethodName(document, editor.selection.active);
        if (!actionName) {
            return;
        }
        const candidate = relativePath.replace(/^app\/controllers/, 'app/views').replace(/\_controller.rb$/, `/${actionName}`);
        const dirPath = path.dirname(path.join(workspaceRoot, candidate));
        if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
            // TODO: 複数ある場合は候補を出す
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
}
