import * as actions from '../src/actions';
import * as status from '../src/status';
import * as streams from '../src/streams';
import * as states from '../src/states';

function idToStr(id: states.Id<states.Kind>): string {
  return id.kind + '/' + id.id;
}

export class Datastore implements streams.DB {
  data: Map<string, any> = new Map();

  get<K extends states.State>(id: states.Id<K['kind']>): K | null {
    const res = this.data.get(idToStr(id)) || null;
    return res as (K | null);
  }

  update(action: actions.Action, updates: states.Update<states.State>[]): status.Status {
    for (const update of updates) {
      this.data.set(idToStr(update.id), update.state);
    }
    return status.ok();
  }
};
