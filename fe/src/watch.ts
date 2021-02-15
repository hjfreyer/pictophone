
export type Operator<A, B> = (a: A) => B;
export type WatchableOperator<A, B> = Operator<Watchable<A>, Watchable<B>>;

export interface Watchable<T> {
    value: T,
    next: Promise<Watchable<T>>
}

export function fromConstant<T>(value: T): Watchable<T> {
    return {
        value,
        next: Promise.race([]),
    }
}

export function fromIterable<T>(iter: AsyncIterable<T>, init: T): Watchable<T> {
    return fromIterator(iter[Symbol.asyncIterator](), init);
}

export function fromPromise<T>(promise: Promise<T>, init: T): Watchable<T> {
    return {
        value: init,
        next: promise.then(fromConstant),
    }
}


export function fromIterator<T>(iter: AsyncIterator<T>, init: T): Watchable<T> {
    return {
        value: init,
        next: (async (): Promise<Watchable<T>> => {
            let next = await iter.next();
            if (next.done) {
                return { value: init, next: Promise.race([]) }
            } else {
                return fromIterator(iter, next.value);
            }
        })(),
    }
}
export function map<A, B>(fn: (a: A) => B): WatchableOperator<A, B> {
    return outer => ({
        value: fn(outer.value),
        next: (async () => {
            return map(fn)(await outer.next);
        })(),
    })
}


export function switchMap<A, B>(fn: (a: A) => Watchable<B>): WatchableOperator<A, B> {
    const helper = (outer: Watchable<A>, inner: Watchable<B>): Watchable<B> => ({
        value: inner.value,
        next: (async () => {
            type LR = { side: 'outer', value: Watchable<A> } | { side: 'inner', value: Watchable<B> };

            let next: LR = await Promise.race([
                (async () => ({ side: 'outer', value: await outer.next } as LR))(),
                (async () => ({ side: 'inner', value: await inner.next } as LR))()]);
            if (next.side === 'outer') {
                return helper(next.value, fn(next.value.value));
            } else {
                return helper(outer, next.value);
            }

        })()
    });
    return outer => helper(outer, fn(outer.value));
    // let inner = fn(outer.value);
    // return {
    //     value: inner.value,
    //     next: (async()=>{
    //         type LR = { side: 'outer', value: Watchable<A> } | { side: 'inner', value: Watchable<B> };

    //         let next: LR = await Promise.race([
    //             (async () => ({ side: 'outer', value: await outer.next } as LR))(),
    //             (async () => ({ side: 'inner', value: await inner.next } as LR))()]);
    //         if (next.side === 'outer') {
    //             return switchMap(next.value, fn);
    //         } else {

    //         }

    //     })()
    // }

    // type LR<L, R> = { side: 'left', value: L } | { side: 'right', value: R };
    // type LRT = LR<IteratorResult<A>, IteratorResult<B>>;
    // let outerIter = iter[Symbol.asyncIterator]();
    // let innerIter: AsyncIterator<B> | null = null;
    // let outerNext: Promise<IteratorResult<A>> = outerIter.next();
    // let innerNext: Promise<IteratorResult<B>> = Promise.race([]);

    // while (true) {
    //     let next: LRT = await Promise.race([
    //         (async () => ({ side: 'left', value: await outerNext } as LRT))(),
    //         (async () => ({ side: 'right', value: await innerNext } as LRT))()]);
    //     if (next.side === 'left') {
    //         if (next.value.done) {
    //             return;
    //         } else {
    //             outerNext = outerIter.next();
    //             innerIter = fn(next.value.value)[Symbol.asyncIterator]();
    //             innerNext = innerIter.next();
    //         }
    //     } else {
    //         if (next.value.done) {
    //             innerIter = null;
    //             innerNext = Promise.race([]);
    //         } else {
    //             innerNext = innerIter!.next();
    //             yield next.value.value;
    //         }
    //     }
    // }
}

// export function scan<Acc, Val>(fn: (acc: Acc, val:Val) => Acc, seed: Acc): WatchableOperator<Val, Acc> {
//     const helper = (values : Watchable<Val>, acc: Acc): Watchable<Acc> => {
//         return  {
//             value: acc,
//             next: (async()=>{
//                 let nextVal = await values.next;
//                 return helper(nextVal, fn(acc, ))
//             })(),
//         }
//     };

//     return outer=>{
//         return
//     };
// }

export function combine<A, B>(a: Watchable<A>, b: Watchable<B>): Watchable<[A, B]> {
    const next = Promise.race([
        a.next.then(a => ({ a })),
        b.next.then(b => ({ b }))
    ]);

    return {
        value: [a.value, b.value],
        next: next.then(next => 'a' in next ? combine(next.a, b) : combine(a, next.b))
    }
}

export function mapFold<Source, Result, Action>(
    foldFn: (acc: Source, action: Action) => Watchable<Source>,
    mapFn: (input: Source) => [Result, Promise<Action>]): WatchableOperator<Source, Result> {
    return function mapFoldImpl(input: Watchable<Source>): Watchable<Result> {
        const [mapped, nextAction] = mapFn(input.value);

        type NextState = { source: Watchable<Source> } | { action: Action };
        const nextState: Promise<NextState> = Promise.race([
            input.next.then((source: Watchable<Source>): NextState => ({ source })),
            nextAction.then((action: Action): NextState => ({ action })),
        ]);

        return {
            value: mapped,
            next: nextState.then(ns => {
                if ('source' in ns) {
                    return mapFoldImpl(ns.source);
                } else {
                    return mapFoldImpl(foldFn(input.value, ns.action));
                }
            })
        }
    };
}

export function inspect<T>(func: (t:T)=>void): WatchableOperator<T, T> {
    return function inspectImpl(t : Watchable<T>): Watchable<T> {
        func(t.value);
        return {
            value: t.value,
            next: t.next.then(inspectImpl)
        }
    }
}