import * as vscode from "vscode";
import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { getFirestore, doc, getDoc, Firestore } from "firebase/firestore";

let firestore: Firestore;

function initializeFirebase() {
  const config = vscode.workspace.getConfiguration("codenotes");

  const firebaseConfig: FirebaseOptions = {
    apiKey: config.get("firebaseApiKey"),
    authDomain: config.get("fire baseAuthDomain"),
    projectId: config.get("firebaseProjectId"),
    storageBucket: config.get("firebaseStorageBucket"),
    messagingSenderId: config.get("firebaseMessagingSenderId"),
    appId: config.get("firebaseAppId"),
  };

  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
  } else {
    firestore = getFirestore();
  }
}

class NotesViewProvider implements vscode.TreeDataProvider<NoteItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    NoteItem | undefined | void
  > = new vscode.EventEmitter<NoteItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<NoteItem | undefined | void> =
    this._onDidChangeTreeData.event;

  async getChildren(): Promise<NoteItem[]> {
    const docRef = doc(firestore, "notes", "tab1");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const content = docSnap.data().content;
      const lines = content.split("\\n");
      console.log(lines);
      return lines.map((line: any, index: any) => new NoteItem(line, index));
    } else {
      return [new NoteItem("No notes found.", 0)];
    }
  }

  getTreeItem(element: NoteItem): vscode.TreeItem {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class NoteItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly lineIndex: number
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = label;
  }
}

export function activate(context: vscode.ExtensionContext) {
  initializeFirebase();
  const notesProvider = new NotesViewProvider();
  vscode.window.registerTreeDataProvider("notesView", notesProvider);
  vscode.commands.registerCommand("notesView.refresh", () =>
    notesProvider.refresh()
  );
}

export function deactivate() {}
