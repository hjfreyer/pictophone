import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});


export const createUser = functions.firestore
  .document('ping/{userId}')
  .onCreate((snap, context) => {

    snap.ref.firestore.doc(`pong/${context.params.userId}`).set({ 'ya': 'ponged' });
  });
