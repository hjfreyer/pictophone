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
  listen(id: string): Observable<any>
}
