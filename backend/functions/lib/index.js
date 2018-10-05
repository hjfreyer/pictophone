"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});
exports.createUser = functions.firestore
    .document('ping/{userId}')
    .onCreate((snap, context) => {
    snap.ref.firestore.doc(`pong/${context.params.userId}`).set({ 'ya': 'ponged' });
});
//# sourceMappingURL=index.js.map