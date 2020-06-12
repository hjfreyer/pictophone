
export type Key = string[]

export type Item<T> = [Key, T]

export type ItemIterable<T> = AsyncIterable<Item<T>>

export type Range = {
    kind: 'bounded'
    start: Key
    end: Key
} | {
    kind: 'unbounded'
    start: Key
}

export interface Readable<T> {
    schema: string[]
    read(range: Range): ItemIterable<T>
}
