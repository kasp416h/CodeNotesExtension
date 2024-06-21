import * as vscode from "vscode";
import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  Firestore,
} from "firebase/firestore";

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
    const collectionRef = await collection(firestore, "notes");
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map((doc) => new NoteItem(doc.data().content));
  }

  getTreeItem(element: NoteItem): vscode.TreeItem {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class NoteItem extends vscode.TreeItem {
  constructor(public readonly label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
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
