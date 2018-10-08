
import * as base from './base';
import * as functions from 'firebase-functions';
import { firestore } from 'firebase';
import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';

type Transform = {
  action: string,
};

type CreateHandler = (s: firestore.DocumentSnapshot, context: functions.EventContext) => Promise<any>;


export function makeHandler(actor: base.Actor): CreateHandler {
  return (s: firestore.DocumentSnapshot, context: functions.EventContext): Promise<any> => {
    return s.ref.firestore.runTransaction(async (transaction: firestore.Transaction): Promise<any> => {
      const action = { action: s.data()!['action'], timeMillis: new Date().getTime() };

      const states: base.States = {};

      while (true) {
        const res = actor(action, { ...states });
        if (res.kind == "FINISH") {
          transaction.update(s.ref, { complete: true });
          for (const key in res.updates) {
            transaction.set(s.ref.firestore.doc(key), {
              value: res.updates[key]
            });
          }
          return res.result;
        }

        for (const id of res.additionalIds) {
          const doc = await transaction.get(s.ref.firestore.doc(id));
          states[id] = doc.exists ? doc.data()!['value'] : null;
        }
      }
    });
  };
}

type Handler<T> = (t: T) => void;

export class Viewer implements base.Viewer {
  private db: firestore.Firestore;

  constructor(db: firestore.Firestore) {
    this.db = db;
  }

  get(ref: base.DocumentRef): rx.Observable<string> {
    const obs = rx.fromEventPattern<firestore.DocumentSnapshot>((x: Function) =>
      this.db.doc(ref.docId).onSnapshot(x as Handler<firestore.DocumentSnapshot>));
    return obs.pipe(
      rxop.tap(x => console.log('snapshot', ref, x)),
      rxop.map((snap: firestore.DocumentSnapshot) =>
        snap.exists ? snap.data()!['value'] : null)
    );
  }

  list(ref: base.CollectionRef): rx.Observable<base.DocumentSnapshot[]> {
    const obs = rx.fromEventPattern<firestore.QuerySnapshot>((x: Function) =>
      this.db.collection(ref.collectionId).onSnapshot(x as Handler<firestore.QuerySnapshot>));

    return obs.pipe(
      rxop.map((snap: firestore.QuerySnapshot) => snap.docs.map(doc => ({
        documentRef: { docId: doc.id },
        value: doc.data()!['value'],
      }))));
  }
}
