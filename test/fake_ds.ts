import * as status from '../src/status';
import * as streams from '../src/streams';


export class Datastore implements streams.DB {
  data: Map<string, any> = new Map();

  get({ collection, id }: streams.Id): any | null {
    const key = `${collection}/${id}`;
    return this.data.get(key) || null;
  }

  update(mutations: streams.Update[]): status.Status {
    for (const mutation of mutations) {
      const key = `${mutation.collection}/${mutation.id}`;
      this.data.set(key, mutation.state);
    }
    return status.ok();
  }
};
