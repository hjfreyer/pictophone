
import * as rx from 'rxjs';

export interface DB {
  get<T>(path: string[]): rx.Observable<T | null>;
  list<T>(path: string[]): rx.Observable<T[]>;
  update<T>(updater: (tc: TransactionContext) => T): T;
};

interface TransactionContext {
  get<T>(path: string[]): T | null;
  set<T>(path: string[], value: T | null): void;
};

export function newSimpleDB(): DB {
  return new SimpleDB();
}

class SimpleDB implements DB {
  map: Map<string, any> = new Map();
  subject: rx.Subject<Update> = new rx.Subject();

  get<T>(path: string[]): rx.Observable<T | null> {

  }
  list<T>(path: string[]): rx.Observable<T[]> {

  }
  update<T>(updater: (tc: TransactionContext) => T): T {

  }
}

type Update = {
  path: string[]
  value: any
};

class SimpleTransactionContext implements TransactionContext {
  db: SimpleDB

  constructor(db: SimpleDB) {
    this.db = db;
  }
}
