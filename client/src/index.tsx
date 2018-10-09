import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as firebase from 'firebase';
import registerServiceWorker from './registerServiceWorker';

var config = {
  apiKey: "AIzaSyCzMg7Q2ByK5UxUd_x730LT8TmOmbA61MU",
  authDomain: "pictophone-app.firebaseapp.com",
  databaseURL: "https://pictophone-app.firebaseio.com",
  projectId: "pictophone-app",
  storageBucket: "pictophone-app.appspot.com",
  messagingSenderId: "837882351009",
};
firebase.initializeApp(config);
firebase.firestore().settings({timestampsInSnapshots: true});

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
