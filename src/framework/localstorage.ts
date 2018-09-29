
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

  constructor(a: base.Actor) {
    this.a = a;
    this.ls = rx.fromEvent<StorageEvent>(window, 'storage')
      .pipe(rxop.map(e => ({ key: e.key!, value: e.newValue! })));
  }

  listen(id: string): rx.Observable<string> {
    let res = rx.merge(this.ls, this.loopback).pipe(
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
}

export let LocalFactory: base.SystemFactory = (a: base.Actor) => new Local(a);
