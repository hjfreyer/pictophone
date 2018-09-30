import * as React from 'react';

import * as pictophone from 'pictophone';

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
            <button onClick={() => console.log(this.state.input)}>Loggit</button>
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

function Game({ name, view, dispatch }: GameProps): JSX.Element {
  return (
    <section>
      <h4>Game: {name}</h4>
      <Body {...{ view, reply: (s: string) => console.log(s) }} />
    </section>
  );
}

export default Game;
