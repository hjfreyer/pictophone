
import * as actions from './actions';
import * as model from './model';
import * as streams from './streams';
import * as gameplay from './gameplay';
import * as knit from './knit';

export let fsHandler: knit.firestore.CreateHandler = knit.firestore.makeHandler(streams.actor2);

export { actions, knit, model, streams, gameplay };
