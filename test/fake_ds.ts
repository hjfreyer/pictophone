import * as base from '../src/base';
import * as status from '../src/status';

export class Datastore implements base.DB {
  data: Map<string, any> = new Map();

  get({ collection, id }: base.Id): any | null {
    const key = `${collection}/${id}`;
    return this.data.get(key) || null;
  }

  update(mutations: base.Update[]): status.Status {
    for (const mutation of mutations) {
      const key = `${mutation.collection}/${mutation.id}`;
      this.data.set(key, mutation.state);
    }
    return status.ok();
  }
};
