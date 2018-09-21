import * as status from './status';

export type Id = {
  collection: string;
  id: string;
}

export interface DB {
  get(id: Id): any | null;
  update(updates: Update[]): status.Status;
}

export type Update = {
  collection: string;
  id: string;
  state: any;
}

type Graft = {
  kind: 'GRAFT';
  additionalIds: Id[];
  extra: any;
};

type Finish = {
  kind: 'FINISH';
  result: any;
  updates: any[];
};

export type ActorResult = Graft | Finish;
type Actor = (action: string, ids: Id[], states: any[], extra?: any) => ActorResult;

export function apply(db: DB, actor: Actor, action: string): any {
  let ids: Id[] = [];
  let states: any[] = [];
  let extra: any | undefined;

  while (true) {
    const res = actor(action, [...ids], [...states], extra);
    if (res.kind == "FINISH") {
      const updates: Update[] = ids.map((id, idx) => ({
        ...id,
        state: res.updates[idx],
      }));
      const s = db.update(updates);
      if (!status.isOk(s)) {
        throw 'errr what?';
      }
      return res.result;
    }

    ids = [...ids, ...res.additionalIds];
    states = [...states, ...res.additionalIds.map(id => db.get(id))];
    extra = res.extra;
  }
}
