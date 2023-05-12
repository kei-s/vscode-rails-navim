import * as vscode from 'vscode';
import { showOrQuickOpen, getEditorInfo, EditorInfoError } from './util';

export async function openAlternateFile() {
    try {
        const { workspaceRoot, relativePath } = getEditorInfo();

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
    } catch (e) {
        if (e instanceof EditorInfoError) {
            vscode.window.showErrorMessage(e.message);
            return;
        }
    }
}
