import * as vscode from "vscode";
import { firestore } from "./config/firebase";
import { collection, getDocs } from "firebase/firestore";

import { Note } from "./types/Note";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "codenotes" is now active!');

  let disposable = vscode.commands.registerCommand(
    "codenotes.showNotes",
    async () => {
      const collectionRef = await collection(firestore, "notes");
      const snapshot = await getDocs(collectionRef);
      const notes: Note[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return { content: data.content || "" };
      });

      const panel = vscode.window.createWebviewPanel(
        "notes",
        "Notes",
        vscode.ViewColumn.One,
        {}
      );

      panel.webview.html = getWebviewContent(notes);
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(notes: { content: string }[]) {
  return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Notes</title>
	  </head>
	  <body>
		<h1>Notes</h1>
		<ul>
		  ${notes.map((note) => `<li>${note.content}</li>`).join("")}
		</ul>
	  </body>
	  </html>
	`;
}

export function deactivate() {}
