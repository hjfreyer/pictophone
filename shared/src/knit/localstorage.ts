
import * as base from './base';
import * as status from '@hjfreyer/status';

import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';

type Item = {
  key: string;
  value: string;
}

type Stash = {
  [id: string]: string
}

export class StorageWrapper {
  s: Storage;
  events: rx.Subject<Item> = new rx.Subject();

  constructor(s: Storage, storageEvents: rx.Observable<StorageEvent>) {
    this.s = s;
    storageEvents
      .pipe(rxop.map(e => ({ key: e.key!, value: e.newValue! })))
      .subscribe(this.events);
  }

  setItem(key: string, value: string) {
    this.s.setItem(key, value);
    this.events.next({ key, value });
  }
}

export class StorageViewer implements base.Viewer {
  private wrapper: StorageWrapper;
  namespace: string;

  constructor(wrapper: StorageWrapper, namespace: string) {
    this.wrapper = wrapper;
    this.namespace = namespace;
  }

  get(ref: base.DocumentRef): rx.Observable<string> {
    const myKey = `${this.namespace}/${ref.docId}`;
    return this.wrapper.events.pipe(
      rxop.filter(({ key }) => key == myKey),
      rxop.map(({ value }) => value),
      rxop.startWith(this.wrapper.s.getItem(myKey) || ''),
    );
  }

  list(ref: base.CollectionRef): rx.Observable<base.DocumentSnapshot[]> {
    return this.wrapper.events.pipe(
      rxop.filter(({ key }) => key.startsWith(`${this.namespace}/`)),
      rxop.map(({ key, value }) => ({ key: key.slice(`${this.namespace}/`.length), value })),
      rxop.filter(({ key }) => ref.collectionId == base.getCollection({ docId: key }).collectionId),
      rxop.scan<Item, Stash>((acc: Stash, { key, value }: Item) => {
        return { ...acc, [key]: value }
      }, {}),
      rxop.map(saved => {
        const res: base.DocumentSnapshot[] = [];
        for (const key in saved) {
          res.push({
            documentRef: { docId: key },
            value: saved[key] as string,
          })
        }
        return res;
      }),
      rxop.startWith([]),
    )
  }
}

export class Local implements base.System, base.DB {
  a: base.Actor;
  wrapper: StorageWrapper;
  storageNamespace: string;
  viewer: base.Viewer;

  constructor(a: base.Actor, wrapper: StorageWrapper, storageNamespace: string) {
    this.a = a;
    this.wrapper = wrapper;
    this.storageNamespace = storageNamespace;
    this.viewer = new StorageViewer(wrapper, storageNamespace);
  }

  async enqueue(action: string): Promise<any> {
    const states: base.States = {};

    while (true) {
      const actionObj = { action, timeMillis: new Date().getTime() };

      const res = this.a(actionObj, { ...states });
      if (res.kind == "FINISH") {
        for (const key in res.updates) {
          // TODO: properly handle null.
          this.wrapper.setItem(`${this.storageNamespace}/${key}`, res.updates[key]!);
        }
        return Promise.resolve(res.result);
      }

      for (const id of res.additionalIds) {
        const doc = this.wrapper.s.getItem(`${this.storageNamespace}/${id}`);
        states[id] = doc;
      }
    }
  }

  update(updates: base.States): Promise<status.Status> {
    for (const key in updates) {
      this.wrapper.setItem(`${this.storageNamespace}/${key}`,
        JSON.stringify(updates[key]));
    }
    return Promise.resolve(status.ok());
  }

  get(id: string): Promise<base.State> {
    return Promise.resolve({
      value: this.wrapper.s.getItem(`${this.storageNamespace}/${id}`),
    });
  }
}

function allKeys(s: Storage): string[] {
  return [...Array(s.length)].map((_, idx) => s.key(idx)!);
}
