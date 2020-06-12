
import firebase from 'firebase/app'
import 'firebase/firestore'
import React, { useState, useEffect } from 'react';
import {Range, Item} from './interfaces';
import * as context from './context';

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
    const [value, setValue] = useState<Value<T>>({state: 'loading'});
    useEffect(()=>{
        const [playerId, gameId] = key;

        const db = context.app.firestore();

        const unsubscribe = db.collection('players').doc(playerId)
            .collection('games-gamesByPlayer-1.1')
            .doc(gameId)
            .onSnapshot((snap : firebase.firestore.DocumentSnapshot) => {
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

export type Collection<T> = {
    state: 'loading'
} | {
    state: 'ready',
    items: Item<T>[]
}

export function useCollection<T>(table: TableSpec<T>, prefix: string[]): Collection<T> {
    const [collection, setCollection] = useState<Collection<T>>({state: 'loading'});
    useEffect(()=>{
        const [playerId] = prefix;

        const db = context.app.firestore();

        const unsubscribe = db.collection('players').doc(playerId)
            .collection('games-gamesByPlayer-1.1')
            .onSnapshot((snap : firebase.firestore.QuerySnapshot) => {
                setCollection({
                state: 'ready',
                items: snap.docs.map(d => [[...prefix, d.ref.id], table.validator(d.data()['value'])])
            })});

        return unsubscribe;
    }, [table, JSON.stringify(prefix)])
    return collection
}
