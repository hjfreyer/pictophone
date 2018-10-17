import * as pictophone from '@hjfreyer/pictophone';
import { model, knit } from '@hjfreyer/pictophone';
import * as React from 'react';
import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';
import './App.css';
import Game from './Game';
import * as firebase from 'firebase';

interface Params {
  player: string;
  room: string;
}

interface Named<T> {
  name: string;
  value: T;
}

interface State {
  p: Params;

  player: Loadable<model.PlayerState>;
  room: Loadable<pictophone.model.RoomState>;
  games: Named<pictophone.gameplay.PlayerView>[];
}

type Loadable<T> = {
  state: 'EMPTY' | 'LOADING',
} | {
  state: 'READY',
  value: T,
};

type Transform = (s: State) => State;

const initParamsJson = window.sessionStorage.getItem('params');
const initParams = initParamsJson ? JSON.parse(initParamsJson) as Params : { player: '', room: '' };

const initialState: State = {
  p: initParams,
  games: [],
  player: { state: 'EMPTY' },
  room: { state: 'EMPTY' },
};

type SubjectToHandler<T> = T extends rx.Subject<infer U> ? U : never;

const actions = {
  setParams: new rx.Subject<Partial<Params>>(),
  joinRoom: new rx.Subject<{}>(),
  createGame: new rx.Subject<{}>(),
}

type Dispatchers = { [K in keyof typeof actions]: (k: SubjectToHandler<(typeof actions)[K]>) => void }

const dispatchers = Object.keys(actions).reduce((acc, key) => ({
  ...acc,
  [key]: (val: any) => actions[key].next(val)
}), {}) as Dispatchers;
console.log(dispatchers)

export function taplog<T>(label: string): rx.MonoTypeOperatorFunction<T> {
  return rxop.tap(t => console.log(label, t));
}

function viewerGetUnlessEmpty<T>(viewer: knit.Viewer,
  docTransform: (s: string) => string): rx.OperatorFunction<string, Loadable<T>> {
  return rxop.switchMap((id: string) => {
    if (id == "") {
      return rx.of<Loadable<T>>({ state: 'EMPTY' });
    }
    const immed = rx.of<Loadable<T>>({ state: "LOADING" });
    const stream = viewer.get(knit.newDocumentRef(docTransform(id))).pipe(
      taplog('foo'),
      rxop.map((serialized: string): Loadable<T> => {
        if (serialized == '') {
          return { state: 'EMPTY' };
        }
        return { state: 'READY', value: JSON.parse(serialized) as T };
      })
    )
    return rx.concat(immed, stream);
  });
}

const LIVE = true;

function setPropertyReducer<P extends keyof State>(p: P): rx.OperatorFunction<State[P], Transform> {
  return rxop.map((v: State[P]) => (s: State) => ({ ...s, [p]: v }));
}

class App extends React.Component<{}, State> {
  local?: knit.local.Local
  viewer: knit.Viewer

  public componentWillMount() {
    if (LIVE) {
      this.viewer = new knit.firestore.Viewer(firebase.firestore());
    } else {
      const events = rx.fromEvent(window, 'storage') as rx.Observable<StorageEvent>;
      const wrapper = new knit.local.StorageWrapper(window.localStorage, events);
      this.local = new knit.local.Local(pictophone.streams.actor2, wrapper, 'pictophone');
      this.viewer = this.local.viewer;
    }

    const paramsLive: rx.Observable<Params> = actions.setParams.pipe(
      rxop.scan<Partial<Params>, Params>((acc, up) => ({ ...acc, ...up }), initParams),
      rxop.startWith(initParams));

    const setParamsReducer: rx.Observable<Transform> = paramsLive.pipe(
      rxop.map((newParams) => {
        window.sessionStorage.setItem('params', JSON.stringify(newParams));
        return (s: State) => ({ ...s, p: newParams });
      }),
    );

    const playerId = actions.setParams.pipe(
      rxop.filter(p => 'player' in p),
      rxop.map(p => p.player || ''),
      rxop.startWith(initParams.player),
    );

    const playerObj: rx.Observable<Loadable<model.PlayerState>> = playerId.pipe(
      viewerGetUnlessEmpty(this.viewer, id => `players/${id}`),
    );
    const roomObj: rx.Observable<Loadable<model.RoomState>> = actions.setParams.pipe(
      rxop.filter(p => 'room' in p),
      rxop.map(p => p.room || ''),
      viewerGetUnlessEmpty(this.viewer, id => `rooms/${id}`),
    );

    const joinRoomReducer: rx.Observable<Transform> = actions.joinRoom.pipe(
      rxop.mergeMap(() =>
        this.doAction({
          kind: 'JOIN_ROOM',
          room: 'rooms/' + this.state.p.room,
          player: 'players/' + this.state.p.player,
        }).pipe(
          taplog('join response'),
          rxop.mapTo((x: State) => x)
        )
      ),
    );
    const createGameReducer: rx.Observable<Transform> = actions.createGame.pipe(
      rxop.mergeMap(() =>
        this.doAction({
          kind: 'CREATE_GAME',
          room: 'rooms/' + this.state.p.room,
        }).pipe(
          taplog('create response'),
          rxop.mapTo((x: State) => x)
        )
      ),
    );

    const getGames: rx.Observable<Transform> = playerId.pipe(
      rxop.switchMap(id => {
        if (id == "") {
          return rx.of([]);
        }
        return this.viewer.list(knit.newCollectionRef(`players/${id}/games`))
      }),
      rxop.map(docs => docs.map(doc => {
        const view = JSON.parse(doc.value) as model.PlayerGameView;
        return { name: doc.documentRef.docId, value: view.view };
      })),
      rxop.startWith([]),
      setPropertyReducer('games')
    );

    const reducer: rx.Observable<Transform> = rx.merge(setParamsReducer,
      joinRoomReducer,
      createGameReducer,
      getGames,
      playerObj.pipe(setPropertyReducer('player')),
      roomObj.pipe(setPropertyReducer('room')));

    const state: rx.Observable<State> = reducer.pipe(
      rxop.scan<Transform, State>((acc, act) => act(acc), initialState),
      rxop.startWith(initialState),
      rxop.tap(x => console.log('STATE', x)),
    );

    state.subscribe(s => this.setState(s));
  }

  doAction(action: pictophone.actions.Action): rx.Observable<any> {
    console.log('ACTION', action);
    const actionStr = JSON.stringify(action);
    if (LIVE) {
      return rx.from(firebase.firestore().collection('actions').add({ action: actionStr }));
    } else {
      return rx.from(this.local!.enqueue(actionStr));
    }
  }

  public render() {
    return (
      <div className="App">
        <h1>Pictophone!</h1>
        <section>
          <label>Player Id:
            <input value={this.state.p.player} onChange={u => dispatchers.setParams({ player: u.target.value })} />
          </label>
          <br />
          <label>Room Id:
            <input value={this.state.p.room} onChange={u => dispatchers.setParams({ room: u.target.value })} />
          </label>
          <br />
          <button onClick={_e => dispatchers.joinRoom({})}>Join Room {this.state.p.room}</button>
          <button onClick={_e => dispatchers.createGame({})}>Create Game from {this.state.p.room}</button>
        </section>
        <section>
          <pre>{JSON.stringify(this.state.player)}</pre>
          <pre>{JSON.stringify(this.state.room)}</pre>
        </section>
        <section>
          <h3>Da games</h3>
          {this.state.games.map(g =>
            <Game key={g.name} name={g.name} view={g.value} dispatch={(a) => this.doAction(a)} />
          )}
        </section>
      </div>
    );
  }
}

export default App;
