
import * as base from './base';
import * as firebaseClient from 'firebase';
import * as functions from 'firebase-functions';
import * as firestore from '@google-cloud/firestore';

import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';

type Transform = {
  action: string,
};

export type CreateHandler = (s: firestore.DocumentSnapshot, context: functions.EventContext) => Promise<any>;


export function makeHandler(actor: base.Actor): CreateHandler {
  return (s: functions.firestore.DocumentSnapshot, context: functions.EventContext): Promise<any> => {
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
  private db: firebaseClient.firestore.Firestore;

  constructor(db: firebaseClient.firestore.Firestore) {
    this.db = db;
  }

  get(ref: base.DocumentRef): rx.Observable<string> {
    const obs = rx.fromEventPattern<firebaseClient.firestore.DocumentSnapshot>((x: Function) =>
      this.db.doc(ref.docId).onSnapshot(x as Handler<firebaseClient.firestore.DocumentSnapshot>));
    return obs.pipe(
      rxop.tap(x => console.log('snapshot', ref, x)),
      rxop.map((snap: firebaseClient.firestore.DocumentSnapshot) =>
        snap.exists ? snap.data()!['value'] : null)
    );
  }

  list(ref: base.CollectionRef): rx.Observable<base.DocumentSnapshot[]> {
    const obs = rx.fromEventPattern<firebaseClient.firestore.QuerySnapshot>((x: Function) =>
      this.db.collection(ref.collectionId).onSnapshot(x as Handler<firebaseClient.firestore.QuerySnapshot>));

    return obs.pipe(
      rxop.map((snap: firebaseClient.firestore.QuerySnapshot) => snap.docs.map(doc => ({
        documentRef: { docId: doc.id },
        value: doc.data()!['value'],
      }))));
  }
}
