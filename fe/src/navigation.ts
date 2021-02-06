
import * as watch from './watch';
import * as ixa from 'ix/asynciterable';
import * as ixaop from 'ix/asynciterable/operators';

export type Location = Homepage | Game | Unknown

export interface Homepage {
    page: 'home'
}

export interface Game {
    page: 'game'
    gameId: string,
    playerId: string,
}

export interface Unknown {
    page: 'unknown'
}

export class Nav {
    // public location : 
    // private current: Location = { page: 'home' };
    private sink = new ixa.AsyncSink<Location>();

    watch(): watch.Watchable<Location> {
        // let iter = ixa.fromEvent<PopStateEvent>(window, 'popstate').pipe(
        //     ixaop.map(e => ({
        //     }))
        // );
        return watch.fromIterator(this.sink, parseLocation(window.location.pathname));
    }

    push(location: Location) {
        // this.current = location;
        window.history.pushState({}, '', serializeLocation(location))
        this.sink.write(parseLocation(serializeLocation(location)));
    }
}

export function parseLocation(pathname : string): Location {
    const segments = pathname.split('/');
    console.log(segments)
    if (segments.length === 2 && segments[1] === '') {
        return {page: 'home'}
    }
    if (segments.length === 5 && segments[1] === 'games' && segments[3] === 'player') {
        return {page: 'game', gameId: segments[2], playerId: segments[4]}
    }
    return {page: 'unknown'}
}

export function serializeLocation(location : Location): string {
    switch (location.page) {
        case 'home':
            return '/'
        case 'game':
            return `/games/${location.gameId}/player/${location.playerId}`
        case 'unknown':
            return '/404'
    }
}