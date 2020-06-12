import firebase from 'firebase/app'
import React, { useState, useEffect } from 'react';
import Config from './config'


export const app = firebase.initializeApp(Config().firebase)

// export const FirebaseContext : React.Context<firebase.Firebase> = React.createContext(app);