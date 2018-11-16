import { Observable } from 'rxjs';

export type ActionWrapper<T, R> = {
  action: T
  predecessors: string[]
  timestampMillis: number
  nonce: string
  result: ActionResult<R>
};

export type ActionResult<R> = {
  state: 'PENDING'
} | {
  state: 'READY'
  result: R;
};

export type StateWrapper<T> = {
  lastAction: string;
  state: T;
}


export type Action = {
  action: string
  timeMillis: number
}

export type State = {
  value: string | null;
}

export type States = { [id: string]: string | null };

export interface DB {
  get(id: string): Promise<State>;
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

export type ApplyResult = {
  result: any;

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
