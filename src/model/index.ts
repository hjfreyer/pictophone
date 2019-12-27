
import * as v0 from './v0'
import * as v1_1_0 from './v1.1.0'
import * as v1_2_0 from './v1.2.0'

export type Types = {
    '0': import('./v0').Index,
    'v1.1.0': import('./v1.1.0').Index,
    'v1.2.0': import('./v1.2.0').Index,
}

const MODULES = {
    '0': v0,
    'v1.1.0': v1_1_0,
    'v1.2.0': v1_2_0,
}

export type Version = (typeof MODULES)[keyof typeof MODULES]['VERSION']

export const NextVersion = {
    [v0.VERSION]: v1_1_0.VERSION,
    [v1_1_0.VERSION]: v1_2_0.VERSION,
}

export const PreviousVersion = {
    [v1_1_0.VERSION]: v0.VERSION,
    [v1_2_0.VERSION]: v1_1_0.VERSION,
}

export type UpgradeableVersion = keyof typeof NextVersion
export type DowngradeableVersion = keyof typeof PreviousVersion

export type Phase = 'PREVIOUS_PRIMARY' | 'CURRENT_PRIMARY' | 'CURRENT'

export const PHASE : Phase = 'CURRENT'

export const VERSIONS: Version[] = ['0', 'v1.1.0', 'v1.2.0']
export const FIRST_VERSION = v0.VERSION
export const CURRENT_VERSION = v1_2_0.VERSION

export type CurrentAction = Types[typeof CURRENT_VERSION]['Action']
export type CurrentState = Types[typeof CURRENT_VERSION]['State']
export type CurrentExport = Types[typeof CURRENT_VERSION]['Export']

export type AnyAction = Types[Version]['Action']
export type AnyState = Types[Version]['State']
export type AnyExport = Types[Version]['Export']

export type AnyRecord = AnyState | AnyExport