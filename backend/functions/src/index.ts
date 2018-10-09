import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as pictophone from '@hjfreyer/pictophone';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});


export const createUser = functions.firestore
  .document('actions/{actionId}')
  .onCreate(pictophone.fsHandler);
