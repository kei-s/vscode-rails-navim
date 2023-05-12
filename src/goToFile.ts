import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getEditorInfo, EditorInfoError, showOrQuickOpen } from './util';

export async function goToFile() {
    try {
        const { workspaceRoot, editor, document, relativePath } = getEditorInfo();
        const lineText = document.lineAt(editor.selection.active.line).text;
        if (relativePath.match(/^app\/views/)) {
            const match = lineText.match(/render\s+['"](.+)['"]/);
            if (match) {
                const renderTarget = match[1];
                const candidate = path.join(
                    renderTarget.startsWith('/')
                        ? path.join('app/views', path.dirname(renderTarget))
                        : path.join(path.dirname(relativePath), path.dirname(renderTarget)),
                    '_' + path.basename(renderTarget)
                );
                const dirPath = path.dirname(path.join(workspaceRoot, candidate));
                // TODO: 複数ある場合は候補を出す
                const matchingFile = fs.readdirSync(dirPath).find(file => file.startsWith(path.basename(candidate)));
                if (matchingFile) {
                    const openingDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(path.join(dirPath, matchingFile)));
                    await vscode.window.showTextDocument(openingDocument, { preview: false });
                    return;
                }
                await showOrQuickOpen(workspaceRoot, candidate);
            }
        }
    } catch (e) {
        if (e instanceof EditorInfoError) {
            vscode.window.showErrorMessage(e.message);
            return;
        }
    }
}
