import { Option, sortedMerge, batchStreamBy, Comparator, stringSuccessor, Result } from "./util"
import * as ixa from "ix/asynciterable"
import * as ixaop from "ix/asynciterable/operators"
import _ from 'lodash'
import { Range, singleValue, rangeContains, rangeContainsRange } from './range'
import { lexCompare } from "./util"
import deepEqual from "deep-equal"
import * as read from "./read"

export type Key = string[]

export type Item<V> = [Key, V]

// export interface Cursor<V> {
//     key: Key
//     value: V
//     cursor: Bound<OrderedKey>
// }

export type Change<V> = {
    key: string[]
    kind: 'set'
    value: V
} | {
    key: string[]
    kind: 'delete'
}

export type Diff<V> = {
    key: string[]
    kind: 'add' | 'delete'
    value: V
} | {
    key: string[]
    kind: 'replace'
    oldValue: V
    newValue: V
}

export type Diffs<Spec> = {
    [K in keyof Spec]: Diff<Spec[K]>[]
}

export type ItemIterable<V> = AsyncIterable<Item<V>>
//export type CursorIterable<V> = AsyncIterable<Cursor<V>>

export interface Readable<T> {
    schema: string[]
    seekTo(startAt: Key): ItemIterable<T>
}

export type Readables<Spec> = {
    [K in keyof Spec]: Readable<Spec[K]>
}

export function unscrambledSpace<T>(r: Readable<T>): ScrambledSpace<T> {
    return {
        schema: r.schema,
        seekTo(key: Key): SliceIterable<T> {
            return ixa.of({
                range: { kind: 'unbounded', start: r.schema.map(_ => '') },
                iter: r.seekTo(key)
            })
        }
    }
}


// For a key K of length N, returns the first N-length key J after it. That is,
// the unique key J such that N < J and there are no N-length keys between them.
export function keySuccessor(k: Key): Key {
    return [...k.slice(0, k.length - 1), stringSuccessor(k[k.length - 1])]
}


export type SliceIterable<T> = AsyncIterable<Slice<T>>

// A somewhat ordered collection of (Key, value) pairs. Rows are grouped
// into "Slices" which contain all the keys in some range of key space,
// in lexicographic order. However, the order of the slices themselves
// may or may not be mixed up.
//
// The slices returned from the iterator will always have disjoint ranges,
// though the union of these ranges won't necessarily cover all of key space.
export interface ScrambledSpace<T> {
    schema: string[]

    // Returns an iterator into the scrambled space starting from "key".
    // If the first returned slice's range doesn't include `key`, then `key`
    // does not exist in the collection. If the slice does include `key`,
    // then its iterable will begin with the first element of the slice
    // at or after `key`.
    seekTo(key: Key): SliceIterable<T>
}

// An ordered slice of key space.
export interface Slice<T> {
    range: Range
    // All records in "range" will be present in this iterable, in lexicographic
    // order, unless they've been skipped for being less than the "seekTo" key.
    iter: ItemIterable<T>
}

export interface MonoOp<I, O> {
    // Returns an input-space key such that a slice beginning with it
    // will map onto a slice containing the output key.
    preimage(outputKey: Key): Key

    schema(inputSchema: string[]): string[]
    // rewindInputKey(key: Key): Key
    // smallestImpactingInputKey(outputKey: Key): Key

    // impactedOutputRange(inputKey: Key): Range
    getSmallestInputRange(inputKey: Key): Range
    // apply(inputIter: ItemIterable<I>): ItemIterable<O>
    mapSlice(input: Slice<I>): SliceIterable<O>
    //map(input: ScrambledSpace<I>): ScrambledSpace<O>
}

export function diffToChange<T>(d: Diff<T>): Change<T> {
    switch (d.kind) {
        case 'add':
            return {
                kind: 'set',
                key: d.key,
                value: d.value,
            }
        case 'replace':
            return {
                kind: 'set',
                key: d.key,
                value: d.newValue,
            }
        case 'delete':
            return {
                kind: 'delete',
                key: d.key,
            }
    }
}
export type Graph<Inputs, Intermediates, Outputs> = {
    [K in keyof Outputs]: Collection<Inputs, Intermediates, Outputs[K]>
}

export type IntermediateCollections<Inputs, Intermediates> = {
    [K in keyof Intermediates]?: Collection<Inputs, Intermediates, Intermediates[K]>
}

export type Collection<Inputs, Intermediates, T> =// SortedCollection<Inputs, Intermediates, T> | 
    OpNode<Inputs, Intermediates, T>
    | LoadNode<Inputs, T>
    | SortNode<Inputs, Intermediates, T>
    | MergeNode<Inputs, Intermediates, T>;

interface OpNode<Inputs, Intermediates, O> {
    kind: 'op'
    visit<R>(go: <I>(input: Collection<Inputs, Intermediates, I>, op: MonoOp<I, O>) => R): R
}

interface LoadNode<Inputs, T> {
    kind: 'load'
    schema: string[]
    visit<R>(go: <K extends keyof Inputs>(k: K, cast: (t: Inputs[K]) => T) => R): R
}

export function load<Inputs, Intermediates, K extends keyof Inputs>(k: K, schema: string[]):
    Collection<Inputs, Intermediates, Inputs[K]> {
    return {
        kind: 'load',
        schema,
        visit: (go) => go(k, x => x)
    }
}

interface SortNode<Inputs, Intermediates, T> {
    kind: 'sort'
    input: Collection<Inputs, Intermediates, T>,
    visit<R>(go: <K extends keyof Intermediates>(k: K, cast: (t: Intermediates[K]) => T) => R): R
}

interface MergeNode<Inputs, Intermediates, T> {
    kind: 'merge'
    inputs: Collection<Inputs, Intermediates, T>[],
}

export async function isKeyExpected<Inputs, Intermediates, T>(
    collection: Collection<Inputs, Intermediates, T>,
    inputs: Readables<Inputs>,
    intermediates: Readables<Intermediates>,
    key: Key): Promise<boolean> {
    const output = enumerate(collection, inputs, intermediates);
    return (await read.getFromScrambledOrDefault(output, key, null)) === null;
}

export function enumerate<Inputs, Intermediates, T>(
    collection: Collection<Inputs, Intermediates, T>,
    inputs: Readables<Inputs>,
    intermediates: Readables<Intermediates>): ScrambledSpace<T> {
    switch (collection.kind) {
        case "load":
            return collection.visit((key, _cast): ScrambledSpace<T> => {
                // Assumes that _cast will be the identity function. I could change 
                // this to explicitly cast each row.
                const readable = inputs[key] as any as Readable<T>;
                return unscrambledSpace(readable);
            });
        case "sort":
            return collection.visit((key, _cast): ScrambledSpace<T> => {
                // Assumes that _cast will be the identity function. I could change 
                // this to explicitly cast each row.
                const readable = intermediates[key] as any as Readable<T>;
                return unscrambledSpace(readable);
            })
        case "merge": {
            const enumeratedInputs = collection.inputs.map(i => enumerate(i, inputs, intermediates));
            for (const eInput of enumeratedInputs) {
                if (!deepEqual(eInput.schema, enumeratedInputs[0].schema)) {
                    throw new Error("merged spaces must have the same schema");
                }
            }
            return new MergedScrambedSpace(enumeratedInputs);
        }
        case "op":
            return collection.visit((input, op) => {
                const enumeratedInput = enumerate(input, inputs, intermediates);
                const schema = op.schema(enumeratedInput.schema);

                return {
                    schema,
                    seekTo(outputStartAt: Key): SliceIterable<T> {
                        // console.log("seeking from:", outputStartAt, op)
                        const inputStartAt = op.preimage(outputStartAt);
                        const inputSliceIter = enumeratedInput.seekTo(inputStartAt);
                        const outputSliceIter = ixa.from(inputSliceIter)
                            .pipe(
                                // tap(slice=> console.log("into op", slice.range, op)),
                                ixaop.flatMap(slice => op.mapSlice(slice)))


                        return outputSliceIter.pipe(
                            ixaop.map((slice: Slice<T>, idx: number): Slice<T> => {
                                if (idx !== 0) {
                                    return slice;
                                }
                                // The first slice of outputSliceIter will necessarily
                                // contain "outputStartAt" (by definition of preimage), but
                                // won't necessarily start there. Skip ahead.
                                return seekSliceTo(slice, outputStartAt);
                            })
                        )
                    }
                }
            })
    }
}

function seekSliceTo<T>(slice: Slice<T>, start: Key): Slice<T> {
    return {
        range: slice.range,
        iter: ixa.from(slice.iter).pipe(
            ixaop.skipWhile(([k,]) => lexCompare(k, start) < 0)
        )
    }
}

class MergedScrambedSpace<T> implements ScrambledSpace<T> {
    constructor(private inputs: ScrambledSpace<T>[]) { }

    get schema(): string[] { return this.inputs[0].schema; }

    seekTo(key: Key): SliceIterable<T> {
        return ixa.zip(...this.inputs.map(i => i.seekTo(key)))
            .pipe(ixaop.map((slices: Slice<T>[]): Slice<T> => {
                for (const slice of slices) {
                    if (!deepEqual(slice.range, slices[0].range)) {
                        throw new Error("merged spaces must emit identical slice ranges");
                    }
                }
                return {
                    range: slices[0].range,
                    iter: sortedMerge(slices.map(slice => slice.iter), (a, b) => lexCompare(a[0], b[0]))
                }
            }))
    }
}

export class CollectionBuilder<Inputs, Intermediates, T>{
    constructor(public collection: Collection<Inputs, Intermediates, T>) { }

    pipe<O>(op: MonoOp<T, O>): CollectionBuilder<Inputs, Intermediates, O> {
        return new CollectionBuilder({
            kind: 'op',
            visit: (go) => go(this.collection, op)
        })
    }
}

export function getIntermediates<Inputs, Intermediates, Outputs>(
    graph: Graph<Inputs, Intermediates, Outputs>): IntermediateCollections<Inputs, Intermediates> {
    let res: IntermediateCollections<Inputs, Intermediates> = {};
    for (const untypedCollectionId in graph) {
        const collectionId = untypedCollectionId as keyof typeof graph;
        res = { ...res, ...getIntermediatesForCollection(graph[collectionId]) }
    }
    return res;
}

function getIntermediatesForCollection<Inputs, Intermediates, T>(
    collection: Collection<Inputs, Intermediates, T>): IntermediateCollections<Inputs, Intermediates> {
    switch (collection.kind) {
        case "load":
            return {}
        case "sort":
            return collection.visit(
                <K extends keyof Intermediates>(
                    k: K, _cast: any): IntermediateCollections<Inputs, Intermediates> => {
                    const res: IntermediateCollections<Inputs, Intermediates> = {};
                    res[k] = collection.input as any as Collection<Inputs, Intermediates, Intermediates[K]>

                    //                    [k as K]: (collection.input as any as Collection<Inputs, Intermediates, Intermediates[K]>)
                    return res
                });
        case "merge":
            const res: IntermediateCollections<Inputs, Intermediates> = {};
            for (const input of collection.inputs) {
                const subIntermeds = getIntermediatesForCollection(input);
                for (const untypedIntermedId in subIntermeds) {
                    const intermedId = untypedIntermedId as keyof typeof subIntermeds;
                    res[intermedId] = subIntermeds[intermedId];
                }
            }
            return res;
        case "op":
            return collection.visit((input, _op) => getIntermediatesForCollection(input))
    }
}

export async function getDiffs<Inputs, Intermediates, Outputs>(
    graph: Graph<Inputs, Intermediates, Outputs>,
    inputs: Readables<Inputs>,
    intermediates: Readables<Intermediates>,
    inputDiffs: Diffs<Inputs>): Promise<[Partial<Diffs<Intermediates>>, Diffs<Outputs>]> {
    const intermeds: Partial<Diffs<Intermediates>> = {};
    const intermedCollections = getIntermediates(graph);
    for (const untypedCollectionId in intermedCollections) {
        const collectionId = untypedCollectionId as keyof typeof intermedCollections;
        intermeds[collectionId] = await collectionDiffs(
            intermedCollections[collectionId]!, inputs, intermediates, inputDiffs);
    }

    const outs: Partial<Diffs<Outputs>> = {};
    for (const untypedCollectionId in graph) {
        const collectionId = untypedCollectionId as keyof typeof graph;
        outs[collectionId] = await collectionDiffs(graph[collectionId], inputs, intermediates, inputDiffs);
    }
    return [intermeds, outs as Diffs<Outputs>];
}


async function collectionDiffs<Inputs, Intermediates, T>(
    collection: Collection<Inputs, Intermediates, T>,
    inputs: Readables<Inputs>,
    intermediates: Readables<Intermediates>,
    inputDiffs: Diffs<Inputs>): Promise<Diff<T>[]> {
    switch (collection.kind) {
        case "load":
            return collection.visit((key, _cast): Diff<T>[] => {
                // Assumes that _cast will be the identity function. I could change 
                // this to explicitly cast each diff.
                return inputDiffs[key] as any as Diff<T>[];
            })
        case "sort":
            return collectionDiffs(collection.input, inputs, intermediates, inputDiffs);
        case "merge":
            return _.flatten(await Promise.all(collection.inputs.map(i => collectionDiffs(i, inputs, intermediates, inputDiffs))));
        case "op":
            return ixa.toArray(collection.visit((input, op) => collectionDiffsOp(input, op, inputs, intermediates, inputDiffs)))
    }
}



async function* collectionDiffsOp<Inputs, Intermediates, I, O>(input: Collection<Inputs, Intermediates, I>,
    op: MonoOp<I, O>,
    inputs: Readables<Inputs>,
    intermediates: Readables<Intermediates>,
    sourceDiffs: Diffs<Inputs>): AsyncIterable<Diff<O>> {
    const inputSpace = enumerate(input, inputs, intermediates);
    const inputDiffs = await collectionDiffs(input, inputs, intermediates, sourceDiffs);
    let inputRanges = inputDiffs.map(d => op.getSmallestInputRange(d.key));

    // TODO: dedup this better.
    inputRanges = _.uniq(inputRanges);

    for (const inputRange of inputRanges) {
        // console.log('update from input range', inputRange)
        // const inputStartAt = op.smallestImpactingInputKey(outputRange.start.value.key);
        // const inputEnum = await first(enumerate(input, inputs, intermediates, inputStartAt));

        // if (inputEnum === undefined) {
        //     throw new Error("enumerate must always output at least one slice");
        // }
        const inputSlice = read.subslice(inputSpace, inputRange);

        const oldOutput = op.mapSlice(inputSlice);
        const newOutput = op.mapSlice(patchSlice(inputSlice, inputDiffs));

        type AgedItem = { age: 'old' | 'new', key: Key, value: O };
        const agedItemCmp: Comparator<AgedItem> =
            (a, b) => lexCompare(a.key, b.key);
        const toTagged = async (age: 'old' | 'new', slices: SliceIterable<O>): Promise<AgedItem[]> => {
            const items = ixa.from(slices)
                .pipe(ixaop.flatMap(slice => ixa.from(slice.iter).pipe(ixaop.map(([key, value]) => ({ age, key, value })))))
            const itemArray = await ixa.toArray(items);
            itemArray.sort(agedItemCmp)
            return itemArray;
        }

        const oldItems = await toTagged('old', oldOutput);
        const newItems = await toTagged('new', newOutput);

        const merged = ixa.from(sortedMerge([ixa.of(...oldItems), ixa.of(...newItems)], agedItemCmp)).pipe(
            //            tap(([age, [key,]]) => console.log('TAP ', age, key))
        );
        for await (const batch of batchStreamBy(merged, agedItemCmp)) {
            if (2 < batch.length) {
                throw new Error("batch too big!")
            }
            if (batch.length == 2) {
                const oldValue = batch[0].age === 'old' ? batch[0] : batch[1];
                const newValue = batch[0].age === 'new' ? batch[0] : batch[1];
                const key = oldValue.key;

                if (!deepEqual(oldValue.value, newValue.value)) {
                    console.log("  doing", {
                        kind: 'replace',
                        key,
                        oldValue: oldValue.value,
                        newValue: newValue.value,
                    })
                    yield {
                        kind: 'replace',
                        key,
                        oldValue: oldValue.value,
                        newValue: newValue.value,
                    }
                }
            } else {
                // Else, batch.length == 1.
                const { age, key, value } = batch[0];
                console.log("  doing", {
                    kind: age === 'old' ? 'delete' : 'add',
                    key,
                    value,
                })
                yield {
                    kind: age === 'old' ? 'delete' : 'add',
                    key,
                    value,
                }
            }
        }
    }

}


async function* toStream<T>(v: T[]): AsyncIterable<T> {
    yield* v
}

async function* patch<T>(input: ItemIterable<T>,
    diffs: Diff<T>[]): ItemIterable<T> {

    const sortedDiffs = [...diffs]
    sortedDiffs.sort((a, b) => lexCompare(a.key, b.key))

    const merged = merge(input, toStream(sortedDiffs))

    for await (const [key, inputValue, diff] of merged) {
        if (diff === null) {
            if (inputValue === null) {
                throw new Error('bad code')
            }
            yield [key, inputValue]
            continue
        }
        switch (diff.kind) {
            case 'add':
                yield [diff.key, diff.value]
                break
            case 'delete':
                break
            case 'replace':
                yield [diff.key, diff.newValue]
                break
        }
    }
}

function patchSlice<T>(input: Slice<T>, diffs: Diff<T>[]): Slice<T> {
    const diffsInRange = diffs.filter(d => rangeContains(input.range, d.key));
    return {
        range: input.range,
        iter: patch(input.iter, diffsInRange)
    }
}
// function transformScrambled<A, B>(input: ScrambledSpace<A>,
//     fn: (a: ItemIterable<A>) => ItemIterable<B>): ScrambledSpace<B> {
//     return {
//         schema: input.schema,
//         seekTo(key: Key): SliceIterable<B> {
//             return from(input.seekTo(key))
//                 .pipe(map((slice: Slice<A>): Slice<B> => ({
//                     range: slice.range,
//                     iter: fn(slice.iter)
//                 })));
//         }
//     }
// }

async function* merge<T>(input: ItemIterable<T>, diffs: AsyncIterable<Diff<T>>):
    AsyncIterable<[string[], T | null, Diff<T> | null]> {

    const iteri = input[Symbol.asyncIterator]()
    const iterd = diffs[Symbol.asyncIterator]()
    let i = await iteri.next()
    let d = await iterd.next()

    while (true) {
        if (i.done && d.done) {
            return
        }
        if (i.done && !d.done) {
            yield [d.value.key, null, d.value]
            d = await iterd.next()
        }
        if (!i.done && d.done) {
            const [key, value] = i.value
            yield [key, value, null]
            i = await iteri.next()
        }
        if (!i.done && !d.done) {
            const [ikey, ivalue] = i.value
            const dkey = d.value.key

            if (lexCompare(ikey, dkey) < 0) {
                // ikey < dkey
                yield [ikey, ivalue, null]
                i = await iteri.next()
            }
            if (lexCompare(ikey, dkey) > 0) {
                // ikey > dkey
                yield [dkey, null, d.value]
                d = await iterd.next()
            }
            if (lexCompare(ikey, dkey) === 0) {
                // ikey === dkey
                yield [ikey, ivalue, d.value]
                i = await iteri.next()
                d = await iterd.next()
            }
        }
    }
}
