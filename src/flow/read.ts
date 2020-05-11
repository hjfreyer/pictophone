import { Item,  Readable, Key, ScrambledSpace, ItemIterable } from "./base";
import deepEqual from "deep-equal";
import { Range, rangeContains, rangeContainsRange, singleValue, compareRangeEndpoints } from "./range";
import { from, first, of, create } from "ix/asynciterable";
import { filter, takeWhile, take, flatMap, tap } from "ix/asynciterable/operators";
import { lexCompare } from "./util";

export async function get<T>(source: Readable<T>, key: Key): Promise<T | null> {
    return getOrDefault(source, key, null)
}

export async function getOrDefault<T, D>(source: Readable<T>, key: Key, def: D): Promise<T | D> {
    for await (const [k, value] of list(source, singleValue(key))) {
        if (deepEqual(k, key)) {
            return value
        } else {
            return def
        }
    }
    return def
}

export function list<T>(source: Readable<T>, range: Range): AsyncIterable<Item<T>> {
    return from(source.seekTo(range.start))
        .pipe(takeWhile(([key, _value])=> rangeContains(range, key)))
}

export function readAll<T>(source: Readable<T>): AsyncIterable<Item<T>> {
    return source.seekTo(source.schema.map(_=>''));
}

export function unsortedListAll<T>(source: ScrambledSpace<T>): ItemIterable<T> {
    return from(source.seekTo(source.schema.map(_=>'')))
        .pipe(flatMap(slice => slice.iter))
}

export function readRangeFromSingleSlice<T>(input : ScrambledSpace<T>, range : Range): ItemIterable<T> {
    return from(input.seekTo(range.start))
        .pipe(take(1),
            flatMap(slice => {
                console.log("want range "+JSON.stringify(range));
                console.log("first slice had range "+JSON.stringify(slice.range));
                if (rangeContains(slice.range, range.start) &&
                    compareRangeEndpoints(slice.range, range) < 0) {
                    throw new Error(`range spans multiple slices. range: ${JSON.stringify(range)}; 
                    first slice: ${JSON.stringify(slice.range)}`)
                }
                return from(slice.iter)
                    .pipe(takeWhile(([key, _value])=> rangeContains(range, key)))
            }));
}

export async function getFromScrambledOrDefault<T, D>(input : ScrambledSpace<T>, key : Key, def : D): Promise<T | D> {
    const slice = await first(input.seekTo(key));
    if (slice === undefined) {
        return def;
    }
    const firstItem = await first(slice.iter);
    if (firstItem === undefined) {
        return def;
    }
    const [firstKey, firstValue] = firstItem;
    if (lexCompare(key, firstKey) !== 0) {
        return def;
    }
    return firstValue;
}