import ReactDOM from 'react-dom';
import App from './App';
import { PictophoneClient } from './gen/pictophone/V0_1ServiceClientPb';
import './index.css';
import * as serviceWorker from './serviceWorker';

(async () => {
    const root = document.getElementById('root');
    const config = {
        server: new PictophoneClient("https://envoy-f2dxgbokta-uc.a.run.app"),
        // server: new PictophoneClient("http://localhost:8080")
    };


    let watchable = App(config);
    while (true) {
        ReactDOM.render(watchable.value, root);
        watchable = await watchable.next;
    }
})();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
