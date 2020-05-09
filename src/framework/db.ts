import { DocumentData, DocumentReference, FieldPath, Firestore, Transaction, Timestamp } from '@google-cloud/firestore'
import { strict as assert } from "assert"
import { basename, dirname, join } from "path"
import { Diff, Item , Change } from './base'

import { from } from 'ix/asynciterable';
import { map, tap } from 'ix/asynciterable/operators';
import { InputInfo } from './graph';
import { ItemIterable, Readable, OrderedKey } from '../flow/base';
import { Range } from '../flow/range';


interface Timestamped {
    ts: Timestamp
    value: unknown
}

export type TimestampedItem<V> = [string[], V, Timestamp]

export class DBHelper2 {
    constructor(private db: Firestore,
        private tx: Transaction) { }

    open<T>(info: InputInfo<T>): Dataspace<T> {
        return new Dataspace(this.db, this.tx, info);
    }
}

export class Dataspace<T> implements Readable<T> {
    constructor(private db: Firestore,
        private tx: Transaction,
        private info: InputInfo<T>) { }

    get schema(): string[] {
        return new DBHelper(this.db, this.tx, this.info.collectionId, this.info.schema).schema
    }

    sortedList(range : Range<OrderedKey>): ItemIterable<T> {
            console.log('SORTED LIST ', this.schema, range)

        return from(new DBHelper(this.db, this.tx, this.info.collectionId, this.info.schema).list(range))
            .pipe(tap(x=>console.log("sortedlist tap"), null, ()=>console.log("DONE")))
            .pipe(map(([k, v]) => {
console.log("in pipe", v);
                return [k, this.info.validator(v)]}));
    }

    commit(changes: Change<T>[]): void {
        new DBHelper(this.db, this.tx, this.info.collectionId, this.info.schema).commit(changes)
    }
}

class DBHelper {
    public schema: string[]
    constructor(private db: Firestore,
        private tx: Transaction,
        collectionId: string,
        schema: string[]) {
        this.schema = [
            ...schema.slice(0, schema.length - 1),
            `${schema[schema.length - 1]}-${collectionId}`
        ]
    }

    async* list(range : Range<OrderedKey>): AsyncIterable<Item<DocumentData>> {
        console.log('list ', this.schema, range)

        let q = this.db.collectionGroup(this.schema[this.schema.length - 1])
            .orderBy(FieldPath.documentId())

        // TODO: respect the range.
        const startAt : string[] = this.schema.map(()=>"");

        const path = this.getDocPath(startAt)
        if (path !== '') {
            q = q.startAt(path)
        }
        const subDocs = await this.tx.get(q)
        for (const doc of subDocs.docs) {
            console.log('doc ', doc.ref)

            yield [this.getKey(doc.ref), doc.data()]
        }
    }

    commit(changes: Change<DocumentData>[]): void {
        for (const change of changes) {
            const docRef = this.getDocReference(change.key)
            switch (change.kind) {
                case 'delete':
                    this.tx.delete(docRef)
                    break
                case 'set':
                    this.tx.set(docRef, change.value)
                    break
            }
        }
    }

    set(key: string[], value: DocumentData): void {
        this.tx.set(this.getDocReference(key), value)
    }

    private getDocReference(key: string[]): DocumentReference {
        assert.equal(key.length, this.schema.length)
        const pathlets: string[][] = key.map((_, idx) => [this.schema[idx], key[idx]])
        return this.db.doc(([] as string[]).concat(...pathlets).join('/'))
    }
    private getDocPath(key: string[]): string {
        assert.equal(key.length, this.schema.length)
        let path = ''
        for (let idx = 0; idx < key.length; idx++) {
            if (key[idx] === '') {
                return path
            }
            path = join(path, this.schema[idx], key[idx])
        }
        return path
    }

    private getKey(docRef: DocumentReference): string[] {
        const res: string[] = []
        const extractedSchema: string[] = []
        let docPath = docRef.path
        while (docPath !== '.') {
            res.push(basename(docPath))
            docPath = dirname(docPath)

            extractedSchema.push(basename(docPath))
            docPath = dirname(docPath)
        }
        res.reverse()
        extractedSchema.reverse()
        assert.deepEqual(this.schema, extractedSchema)
        return res
    }
}
