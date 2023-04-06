import * as vscode from 'vscode';
import * as path from 'path';
import { showOrQuickOpen } from './util';

export async function openAlternateFile() {
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
}
