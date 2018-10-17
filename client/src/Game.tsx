import * as React from 'react';

import * as pictophone from '@hjfreyer/pictophone';

type BodyProps = {
  view: pictophone.gameplay.PlayerView;
  reply: (s: string) => void
}

type BodyState = {
  input: string;
};

class Body extends React.Component<BodyProps, BodyState> {
  state: BodyState = { input: '' };

  render(): JSX.Element {
    switch (this.props.view.state) {
      case "FIRST_PROMPT":
        return (
          <div>
            <b>Come up with a thing!</b><br />
            <input value={this.state.input}
              onChange={e => this.setState({ input: e.target.value })} />
            <button onClick={() => this.props.reply(this.state.input)}>Loggit</button>
          </div>);
      case "WAITING_FOR_OTHERS":
      case "RESPOND_TO_PROMPT":
      case "GAME_OVER":
        return <pre>{JSON.stringify(this.props.view)}</pre>;
    }
  }
};

type GameProps = {
  name: string;
  view: pictophone.gameplay.PlayerView;
  dispatch: (a: pictophone.actions.Action) => void
}

function gameFromName(name:string) {
  return name.split('/').slice(2).join('/');
}

function playerFromName(name:string) {
  return name.split('/').slice(0, 2).join('/');
}

function Game({ name, view, dispatch }: GameProps): JSX.Element {
  const reply = (word: string) => dispatch({
    kind: "MAKE_MOVE",
    game: gameFromName(name),
    player: playerFromName(name),
    word,
  });

  return (
    <section>
      <h4>Game: {name}</h4>
      <Body {...{ view, reply }} />
    </section>
  );
}

export default Game;
