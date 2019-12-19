import { DocumentReference, Firestore, Transaction } from '@google-cloud/firestore'
import { Storage } from '@google-cloud/storage'
import cors from 'cors'
import express from 'express'
import { Dictionary, Request } from 'express-serve-static-core'
import admin from 'firebase-admin'
import produce from 'immer'
import uuid from 'uuid/v1'
import batch from './batch'
import GetConfig from './config'
import { applyExportDiff } from './exports'
import * as logic from './logic'
import { VERSIONS } from './model'
import validateAction, { AnyAction as Action } from './model/AnyAction.validator'
import Export, { VERSIONS as EXPORT_VERSIONS } from './model/AnyExport'
import State from './model/AnyState'
import { Drawing, UploadResponse } from './model/rpc'
import { validate as validateRpc } from './model/rpc.validator'
import { ExportStateMap } from './types'
import * as types from './types.validator'

admin.initializeApp({
    credential: admin.credential.applicationDefault()
})

const storage = new Storage()
const db = admin.firestore()

// Create a new express application instance
const app: express.Application = express()
app.set('json spaces', 2)
app.use(express.json())

const port = process.env.PORT || 3000
app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
})

function upgradeExportMap(esm: ExportStateMap): ExportStateMap {
    const known = new Set<string>(EXPORT_VERSIONS)

    return produce(esm, esm => {
        // Fill in any missing gaps in esm.
        for (const version of EXPORT_VERSIONS) {
            if (!(version in esm)) {
                esm[version] = 'NOT_EXPORTED'
            }
        }

        // Mark any unknown exported as dirty.
        for (const version in esm) {
            if (!known.has(version) && esm[version] === 'EXPORTED') {
                esm[version] = 'DIRTY'
            }
        }
    })
}

// Algorithm for applying an action:
//
// 1. Upgrade the state until it's at least as new as the action. Call it PS.
// 2. Upgrade the action until it's at least as new as the state. Call it A.
// 3. Integrate the A into PS. Call the result NS.
// 4. Produce prevStates[v] for all known versions by upgrading and downgrading from PS.
// 5. Produce nextStates[v] for all known versions by upgrading and downgrading from NS.
// 6. Export prevStates[v] for all known versions IFF v is exported (according to 
//    the export map).
// 7. Export nextStates[v] for all known versions IFF v is exported (according to 
//    the export map).
// 8. Apply the diff of the given exports.
//
// TODO: Monitor whether redundant upgrade/downgrade paths all agree with each other.
type ActionInput = {
    prevState: State
    prevExportMap: ExportStateMap
    action: Action
}

type ActionOutput = {
    nextState: State
    exportMap: ExportStateMap
    prevExports: Export[]
    nextExports: Export[]
}

function firstAction(action: Action): ActionOutput {
    // Steps 1+2 are trivial in this case.
    const prevState = logic.initState(action.version, action.gameId)

    // 3
    const nextState = logic.integrate(prevState, action)

    // 4 and 6 are unnecessary, as initial states can't have export.

    // 5 + 7
    const exportMap: ExportStateMap = {}
    const exports: Export[] = []
    for (const version of VERSIONS) {
        exportMap[version] = 'EXPORTED'
        const migrated = logic.migrateState(action.gameId, nextState, version)
        exports.push(...logic.exportState(action.gameId, migrated))
    }

    // Step 8 is handled by the caller.
    return {
        nextState,
        exportMap,
        prevExports: [],
        nextExports: exports,
    }
}

function act({ prevState, prevExportMap, action }: ActionInput): ActionOutput {
    // 1
    prevState = logic.upgradeState(action.gameId, prevState, action.version)

    // 2
    action = logic.upgradeAction(action, prevState.version)

    // 3
    const nextState = logic.integrate(prevState, action)

    // 4, 5, 6, 7
    const exportMap = upgradeExportMap(prevExportMap)
    const prevExports: Export[] = []
    const nextExports: Export[] = []
    for (const version of VERSIONS) {
        if (exportMap[version] !== 'EXPORTED') {
            continue
        }
        const prevMigrated = logic.migrateState(action.gameId, prevState, version)
        prevExports.push(...logic.exportState(action.gameId, prevMigrated))
        const nextMigrated = logic.migrateState(action.gameId, nextState, version)
        nextExports.push(...logic.exportState(action.gameId, nextMigrated))
    }

    // Step 8 is handled by the caller.
    return {
        nextState,
        exportMap,
        prevExports,
        nextExports,
    }
}

async function doAction(db: FirebaseFirestore.Firestore, body: unknown): Promise<void> {
    const action = validateAction(body)
    console.log(action)

    const gameId = action.gameId
    await db.runTransaction(async (tx: Transaction): Promise<void> => {
        const prevStateEntry = await gameState.get(tx, gameId)

        if (prevStateEntry === null) {
            const { nextState, exportMap, nextExports } = firstAction(action)
            gameState.set(tx, gameId, {
                generation: 0,
                iteration: 1,
                exports: exportMap,
                lastModified: admin.firestore.FieldValue.serverTimestamp(),
                state: nextState,
            })
            applyExportDiff(db, tx, [], nextExports)
        } else {
            const { nextState, exportMap, prevExports, nextExports } = act({
                prevState: prevStateEntry.state,
                prevExportMap: prevStateEntry.exports,
                action,
            })

            gameState.set(tx, gameId, {
                generation: 0,
                iteration: prevStateEntry.iteration + 1,
                exports: exportMap,
                lastModified: admin.firestore.FieldValue.serverTimestamp(),
                state: nextState,
            })
            applyExportDiff(db, tx, prevExports, nextExports)
        }
    })
}

type DPL<K, V> = {
    get(tx: Transaction, k: K): Promise<V | null>
    set(tx: Transaction, k: K, v: V): void
    delete(tx: Transaction, k: K): void
}
type Reffer<KeyType> = (db: Firestore, k: KeyType) => DocumentReference
type Parser<ValueType> = (v: unknown) => ValueType

function mkDpl<K, V>(
    db: Firestore,
    reffer: Reffer<K>,
    parser: Parser<V>): DPL<K, V> {
    return {
        get: async (tx, k) => {
            const data = await tx.get(reffer(db, k))
            if (!data.exists) {
                return null
            }
            return parser(data.data())
        },
        set: (tx, k, v) => {
            tx.set(reffer(db, k), v)
        },
        delete: (tx, k) => {
            tx.delete(reffer(db, k))
        }
    }
}

function gameStateRef(db: Firestore, gameId: string): FirebaseFirestore.DocumentReference {
    return db.collection('state').doc(`game:${gameId}`)
}

const gameState = mkDpl(db, gameStateRef, types.validate('StateEntry'))

const MAX_POINTS = 50_000

async function doUpload(body: unknown): Promise<UploadResponse> {
    const upload = validateRpc('Upload')(body)

    if (MAX_POINTS < numPoints(upload)) {
        throw new Error('too many points in drawing')
    }

    const id = `uuid/${uuid()}`
    await storage.bucket(GetConfig().gcsBucket).file(id).save(JSON.stringify(upload))

    return { id }
}

function numPoints(drawing: Drawing): number {
    let res = 0
    for (const path of drawing.paths) {
        res += path.length / 2
    }
    return res
}

app.options('/action', cors())
app.post('/action', cors(), function(req: Request<Dictionary<string>>, res, next) {
    doAction(db, req.body).then(() => {
        res.status(200)
        res.json({})
    }).catch(next)
})

app.options('/upload', cors())
app.post('/upload', cors(), function(req: Request<Dictionary<string>>, res, next) {
    doUpload(req.body).then(resp => {
        res.status(200)
        res.json(resp)
    }).catch(next)
})

app.use('/batch', batch(db))
