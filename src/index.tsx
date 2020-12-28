import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { PictophoneClient } from './gen/pictophone/V1_1ServiceClientPb';

// (async () => {
//     const root = document.getElementById('root');
//     const config = {};
//     for await (const view of App(config)) {
//         ReactDOM.render(view, root);        
//     }
// })();

(async () => {
    const root = document.getElementById('root');
    const config = {
        server: new PictophoneClient("http://localhost:8080")
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
