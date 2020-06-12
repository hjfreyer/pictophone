import {TableSpec, useCollection} from './db';
import {PlayerGame1_1} from './model/Export';
import {validate} from './model/Export.validator';

export const GAMES_BY_PLAYER : TableSpec<PlayerGame1_1> = {
    schema: ['players', 'games-gamesByPlayer-1.0'],
    validator: validate('PlayerGame1_1'),
}
