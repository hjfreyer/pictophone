
import * as base from './base';
import * as status from 'status';

import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';

type Item = {
  key: string;
  value: string;
}

export class Local implements base.System, base.DB {
  a: base.Actor;
  ls: rx.Observable<Item>
  loopback: rx.Subject<Item> = new rx.Subject();

  allItems: rx.Observable<Item>;

  constructor(a: base.Actor) {
    this.a = a;
    this.ls = rx.fromEvent<StorageEvent>(window, 'storage')
      .pipe(rxop.map(e => ({ key: e.key!, value: e.newValue! })));
    this.allItems = rx.merge(this.ls, this.loopback);
  }

  listen(id: string): rx.Observable<string> {
    let res = this.allItems.pipe(
      rxop.filter(e => e.key == id),
      rxop.map(e => e.value)
    );
    const current = window.localStorage.getItem(id);
    if (current) {
      res = res.pipe(rxop.startWith(current));
    } else {
      res = res.pipe(rxop.startWith('null'));
    }

    return res.pipe(rxop.tap(console.log));
  }

  enqueue(action: string): Promise<any> {
    const timeMillis = new Date().getTime();
    return Promise.resolve(base.apply(this, this.a, { action, timeMillis }));
  }

  update(updates: base.States): status.Status {
    for (const key in updates) {
      window.localStorage.setItem(key, JSON.stringify(updates[key]));
      this.loopback.next({ key, value: JSON.stringify(updates[key]) })
    }
    return status.ok();
  }

  get(id: string): any {
    const item = window.localStorage.getItem(id);
    return item ? JSON.parse(item) : null;
  }


  list(collectionId: string): rx.Observable<string[]> {
    const collectionRe = /([a-zA-Z]+\/[a-zA-Z0-9_]+\/)*[a-zA-Z]+\//;
    if (!collectionRe.test(collectionId)) {
      throw 'Baddd';
    }
    console.log('listing', collectionId)
    const initial = allKeys().filter(key => key.startsWith(collectionId))

    return this.allItems.pipe(
      rxop.map(({ key }) => key),
      rxop.filter(key => key.startsWith(collectionId)),
      rxop.mergeScan<string, string[]>((acc, val) => {
        if (acc.indexOf(val) != -1) {
          return rx.empty();
        } else {
          return rx.of([...acc, val])
        }
      }, initial),
      rxop.startWith(initial),
    );
  }
}

function allKeys(): string[] {
  const res: string[] = [];
  return [...Array(localStorage.length)].map((_, idx) => localStorage.key(idx)!);
}

}

export let LocalFactory: base.SystemFactory = (a: base.Actor) => new Local(a);
