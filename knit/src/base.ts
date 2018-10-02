import * as status from 'status';
import { Observable } from 'rxjs';

export type Action = {
  action: string
  timeMillis: number
}

export type States = { [id: string]: any };

export interface DB {
  get(id: string): any | null;
  update(updates: States): status.Status;
}

type Graft = {
  kind: 'GRAFT';
  additionalIds: string[];
};

export function graft(...additionalIds: string[]): Graft {
  return { kind: 'GRAFT', additionalIds };
}

type Finish = {
  kind: 'FINISH';
  result: any;
  updates: States;
};

export type ActorResult = Graft | Finish;
export type Actor = (action: Action, states: States) => ActorResult;

export function apply(db: DB, actor: Actor, action: Action): any {
  const states: States = {};

  while (true) {
    const res = actor(action, { ...states });
    if (res.kind == "FINISH") {
      const s = db.update(res.updates);
      if (!status.isOk(s)) {
        throw 'errr what?';
      }
      return res.result;
    }

    res.additionalIds.forEach(id => {
      states[id] = db.get(id)
    });
  }
}

export type SystemFactory = (a: Actor) => System

export interface System {
  enqueue(action: string): Promise<any>
}

export type DocumentRef = { docId: string };
export type CollectionRef = { collectionId: string };

const _collectionNameRe = /[a-zA-Z]+/;
const _docNameRe = /[a-zA-Z0-9_]+/;

const _documentPartRe = new RegExp(`(${_collectionNameRe.source}/${_docNameRe.source}/)*${_collectionNameRe.source}/${_docNameRe.source}`)
const _documentRe = new RegExp(`^${_documentPartRe.source}\$`)
const _collectionRe = new RegExp(`^(${_documentPartRe.source}/)*${_collectionNameRe.source}\$`)

export function newDocumentRef(id: string): DocumentRef {
  if (!_documentRe.test(id)) {
    throw `bad doc id: ${id}`;
  }
  return { docId: id };
}

export function newCollectionRef(id: string): CollectionRef {
  console.log(_collectionRe.source)
  if (!_collectionRe.test(id)) {
    throw `bad collection id: ${id}`;
  }
  return { collectionId: id };
}

export function getCollection(doc: DocumentRef): CollectionRef {
  const docSplit = doc.docId.split('/');
  return { collectionId: docSplit.slice(0, docSplit.length - 1).join('/') }
}

export type DocumentSnapshot = {
  documentRef: DocumentRef;
  value: string;
}

export interface Viewer {
  get(ref: DocumentRef): Observable<string>
  list(ref: CollectionRef): Observable<DocumentSnapshot[]>
}
