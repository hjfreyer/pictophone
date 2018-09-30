import * as knit from 'knit';
import * as status from 'status';

export class Datastore implements knit.DB {
  data: Map<string, any> = new Map();

  get(id: string): any | null {
    return this.data.get(id) || null;
  }

  update(mutations: knit.States): status.Status {
    for (const id in mutations) {
      this.data.set(id, mutations[id]);
    }
    return status.ok();
  }
};
