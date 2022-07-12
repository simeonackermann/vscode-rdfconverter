// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from "fs";
import { cursorTo } from 'readline';
const cp = require('child_process')


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Track currently webview panel
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from HelloWorld!');
		// https://code.visualstudio.com/api/references/vscode-api#commands
		// https://code.visualstudio.com/api/extension-guides/webview
	});
	context.subscriptions.push(disposable);

	// change handler
	const onChangeHandler = vscode.workspace.onDidChangeTextDocument(async (e) => {
			if (!currentPanel) return

			const raptorResult = await runRaptor(vscode.window.activeTextEditor?.document.getText())
			currentPanel.webview.html = getWebviewContent(raptorResult)
	})
	context.subscriptions.push(onChangeHandler);

	// rdf converter action
	let rdfConvert = vscode.commands.registerCommand('helloworld.rdfConvert', async () => {
		const editor = vscode.window.activeTextEditor
		const text = editor?.document.getText()
		const columnToShowIn = vscode.window.activeTextEditor
				? vscode.window.activeTextEditor.viewColumn
				: undefined;

		console.log('currentPanel', currentPanel);
		console.log('columnToShowIn', columnToShowIn);

		// TODO use text of current document
		// TODO try catch
		const raptorResult = await runRaptor(text)
		// console.log('raptorResult', raptorResult);

		if (currentPanel) {
			// currentPanel.reveal(2) ;
			currentPanel.webview.html = getWebviewContent(raptorResult)
			return
		}

		currentPanel = vscode.window.createWebviewPanel(
			'openWebview', // Identifies the type of the webview. Used internally
			'Example Page', // Title of the panel displayed to the user,
			{
				preserveFocus: true,
				viewColumn: vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.

			},
			{ // Enable scripts in the webview
				enableScripts: false //Set this to true if you want to enable Javascript.
			}
		);
		currentPanel.webview.html = getWebviewContent(raptorResult)

		currentPanel.onDidDispose(() => {
			  // When the panel is closed, cancel any future updates to the webview content
			  // clearInterval(interval);
			  currentPanel = undefined
			},
			null,
			context.subscriptions
		  );
	})
	context.subscriptions.push(rdfConvert);
}

// const runRaptor = async (filePath: string | undefined) => {
// TODO: use rdflib instead!!!
const runRaptor = async (text: string | undefined) => {
	return new Promise<string>((resolve, reject) => {
        // cp.exec(`rapper -q -i guess -o ntriples "${filePath}"`, (err: any, out: string) => {
		cp.exec(`echo \'${text}\' | rapper -q -i turtle -o ntriples - /`, (err: any, out: string) => {
			// echo "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n<http://foo.bar/> a owl:Class ." | rapper -q -i turtle -o ntriples - /
            if (err) return reject(err)

			return resolve(out)
        });
    });
}

function getWebviewContent(cnt: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Example Webview</title>
</head>
<body>
	<xmp>${cnt}</xmp>
</body>
</html>`;
  }

// this method is called when your extension is deactivated
export function deactivate() {}
