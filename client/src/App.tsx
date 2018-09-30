import * as knit from 'knit';
import { local } from 'knit';
import * as pictophone from 'pictophone';
import { model } from 'pictophone';
import * as React from 'react';
import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';
import './App.css';
import Game from './Game';
import logo from './logo.svg';

interface State {
  playerId: string;
  roomId: string;

  player?: pictophone.model.PlayerState;
  room?: pictophone.model.RoomState;
  game?: model.GameState;
  games: { name: string, view: pictophone.gameplay.PlayerView }[];
};

interface Ids {
  player: string;
  room: string;
  game: string;
}

type IdSubjs = {
  [k in keyof Ids]: rx.BehaviorSubject<Ids[k]>
}
//
// type StateSubjs = {
//   [k in keyof Ids]: rx.Observable<State[k]>
// }

class App extends React.Component<{}, State> {
  local: knit.System
  ids: IdSubjs
  //  stateSubjs: StateSubjs

  public componentWillMount() {
    this.local = local.LocalFactory(pictophone.streams.actor2);
    this.ids = {
      player: new rx.BehaviorSubject(window.sessionStorage.getItem('playerId') || ''),
      room: new rx.BehaviorSubject(window.sessionStorage.getItem('roomId') || ''),
      game: new rx.BehaviorSubject(window.sessionStorage.getItem('gameId') || ''),
    }
    this.ids.player.subscribe(i => {
      window.sessionStorage.setItem('playerId', i);
      this.setState({ playerId: i });
    });
    this.ids.room.subscribe(i => {
      window.sessionStorage.setItem('roomId', i);
      this.setState({ roomId: i });
    });
    this.ids.game.subscribe(i => {
      window.sessionStorage.setItem('gameId', i);
      //      this.setState({ gameId: i });
    });

    const player: rx.Observable<model.PlayerState> = this.ids.player.pipe(
      rxop.switchMap(id => this.local.listen('players/' + id)),
      rxop.map(x => JSON.parse(x) as model.PlayerState),
    )
    const room: rx.Observable<model.RoomState> = this.ids.room.pipe(
      rxop.switchMap(id => this.local.listen('rooms/' + id)),
      rxop.map(x => JSON.parse(x) as model.RoomState),
    )
    const game: rx.Observable<model.GameState> = this.ids.game.pipe(
      rxop.switchMap(id => this.local.listen(id)),
      rxop.map(x => JSON.parse(x) as model.GameState),
    )
    this.ids.player.pipe(
      rxop.switchMap(id => this.local.list(`players/${id}/games/`)),
      rxop.switchMap(
        gids => rx.combineLatest(gids.map(gid =>
          this.local.listen(gid).pipe(
            rxop.map(gstate => JSON.parse(gstate) as model.PlayerGameView),
            rxop.tap(x => console.log('view', typeof (x))),
            rxop.map(gstate => ({ name: gid, view: gstate.view }))
          )))
      )
    ).subscribe(games => this.setState({ games }));

    //    this.stateSubjs = { player, room };
    player.subscribe(player => this.setState({ player }));
    room.subscribe(room => this.setState({ room }))
    game.subscribe(game => this.setState({ game }))
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React, {this.ids.player.getValue()}</h1>
          <label>Player Id:
            <input value={this.ids.player.getValue()} onChange={u => this.setId('player', u.target.value)} />
          </label>

        </header>
        <section>
          <h3>PlayerInfo</h3>
          <pre>{JSON.stringify(this.state.player)}</pre>
        </section>
        <section>
          <h3>RoomInfo</h3>
          <pre>{JSON.stringify(this.state.room)}</pre>
          <input value={this.ids.room.getValue()} onChange={u => this.setId('room', u.target.value)} />
          <button onClick={_e => this.mkRoom()}>Join Room {this.state.roomId}</button>
          <button onClick={_e => this.createGame()}>Create Game from {this.state.roomId}</button>
        </section>
        <section>
          <pre>{JSON.stringify(this.state.game)}</pre>
        </section>
        <section>
          <h3>Da games</h3>
          {this.state.games.map(g =>
            <Game key={g.name} name={g.name} view={g.view} dispatch={() => null} />
          )}
        </section>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
      </div>
    );
  }
  mkRoom() {
    this.local.enqueue(JSON.stringify({
      kind: 'JOIN_ROOM',
      room: 'rooms/' + this.state.roomId,
      player: 'players/' + this.state.playerId,
    })).then(console.log);
  }
  createGame() {
    this.local.enqueue(JSON.stringify({
      kind: 'CREATE_GAME',
      room: 'rooms/' + this.state.roomId,
    })).then(res => {
      this.ids.game.next(res.gameId)
    });
  }
  setId<K extends keyof Ids>(key: K, value: Ids[K]) {
    this.ids[key].next(value);
    //    this.setState({ ...this.state, [key]: value });
    // window.sessionStorage.setItem(key, value);
    // this.setState({ ...this.state, [key]: value });
  }
}

export default App;
