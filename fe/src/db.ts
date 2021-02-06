
import firebase from 'firebase/app'
import 'firebase/firestore'
import React, { useState, useEffect } from 'react';
import { Range, Item } from './interfaces';
import * as context from './context';
import { Upload } from './model/rpc';
import { validate } from './model/rpc.validator';
import * as base from './base'
import { dirname } from 'path';

export interface TableSpec<T> {
    schema: string[]
    validator: (u: unknown) => T
}

export type Value<T> = {
    state: 'loading'
} | {
    state: 'ready',
    value: T
} | {
    state: 'not_found'
}

export function useValue<T>(table: TableSpec<T>, key: string[]): Value<T> {
    const [value, setValue] = useState<Value<T>>({ state: 'loading' });
    useEffect(() => {
        const [playerId, gameId] = key;

        const db = context.app.firestore();

        const unsubscribe = db.collection('players').doc(playerId)
            .collection('games-gamesByPlayer-1.1')
            .doc(gameId)
            .onSnapshot((snap: firebase.firestore.DocumentSnapshot) => {
                if (snap.exists) {
                    setValue({
                        state: 'ready',
                        value: table.validator(snap.data()!['value'])
                    })
                } else {
                    setValue({
                        state: 'not_found',
                    })
                }
            });

        return unsubscribe;
    }, [table, JSON.stringify(key)])
    return value
}

// export type Collection<T> = {
//     state: 'loading'
// } | {
//     state: 'ready',
//     items: Item<T>[]
// }

// export function useCollection<T>(table: TableSpec<T>, prefix: string[]): Collection<T> {
//     const [collection, setCollection] = useState<Collection<T>>({ state: 'loading' });
//     useEffect(() => {
//         const [playerId] = prefix;

//         const db = context.app.firestore();

//         const unsubscribe = db.collection('players').doc(playerId)
//             .collection('games-gamesByPlayer-1.1')
//             .onSnapshot((snap: firebase.firestore.QuerySnapshot) => {
//                 setCollection({
//                     state: 'ready',
//                     items: snap.docs.map(d => [[...prefix, d.ref.id], table.validator(d.data()['value'])])
//                 })
//             });

//         return unsubscribe;
//     }, [table, JSON.stringify(prefix)])
//     return collection
// }

export function useConsistencyToken(refId: string): string {
    const rg = useCurrentRefGroup(refId);
    if (rg.state !== 'ready') {
        return ''
    }
    return JSON.stringify(rg)
}


export function useCurrentRefGroup(refId: string): Value<base.ReferenceGroup> {
    const [refGroup, setRefGroup] = useState<Value<base.ReferenceGroup>>({ state: 'loading' });

    useEffect(() => {
        const db = context.app.firestore();
        setRefGroup({ state: 'loading' });


        if (refId.endsWith("/*")) {
            const unsubscribe = db.collection(dirname(refId))
                .onSnapshot((snap: firebase.firestore.QuerySnapshot) => {
                    const res: base.ReferenceGroup = {
                        kind: 'collection',
                        id: dirname(refId),
                        members: {},
                    }
                    for (const doc of snap.docs) {
                        const ptr = validate('Pointer')(doc.data())
                        res.members[doc.id] = {
                            kind: 'single',
                            actionId: ptr.actionId,
                        }
                    }
                    setRefGroup({ state: 'ready', value: res })
                });

            return unsubscribe;
        } else {
            const unsubscribe = db.doc(refId)
                .onSnapshot((snap: firebase.firestore.DocumentSnapshot) => {
                    setRefGroup(((): Value<base.ReferenceGroup> => {
                        if (!snap.exists) {
                            return {
                                state: 'ready',
                                value: { kind: 'none' }
                            }
                        }
                        const ptr = validate('Pointer')(snap.data())
                        return {
                            state: 'ready',
                            value: {
                                kind: 'single',
                                actionId: ptr.actionId,
                            }
                        }

                    }
                    )())
                });
        }
    }, [refId])

    return refGroup
}