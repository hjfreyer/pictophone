
import * as base from './base';

export class Tester {
  data: Map<string, string> = new Map();
  actor: base.Actor;
  timeMillis: number = 1000;

  constructor(actor: base.Actor) {
    this.actor = actor;
  }

  do(actionStr: string) {
    this.timeMillis++;
    const action: base.Action = {
      timeMillis: this.timeMillis,
      action: actionStr,
    };

    const states: base.States = {};

    while (true) {
      const res = this.actor(action, { ...states });
      if (res.kind == "FINISH") {
        for (const key in res.updates) {
          const value = res.updates[key];
          if (value) {
            this.data.set(key, value);
          } else {
            this.data.delete(key);
          }
        }
        return res.result;
      }

      for (const id of res.additionalIds) {
        states[id] = this.data.get(id) || null;
      }
    }
  }

  get(id: string): any {
    const val = this.data.get(id);
    return val ? JSON.parse(val) : null;
  }
}
