import {Action} from "./model/1.1"
import { Upload, UploadResponse } from "./model/rpc"

export type Dispatch = {
    action(a: Action): Promise<void>
    upload(u: Upload): Promise<UploadResponse>
}

export const MODEL_VERSION = '1.1'

export type ReferenceGroup = {
    kind: 'single'
    actionId: string
} | {
    kind: 'collection'
    id: string
    members: Record<string, ReferenceGroup>
} | {
    kind: 'none'
}
