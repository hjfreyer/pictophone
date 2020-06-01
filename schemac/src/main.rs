use serde::{Deserialize, Serialize};
use std::io::{self, Read};

#[derive(Deserialize, Debug)]
struct ConfigIn {
    primary_id: String,
    collections: Vec<CollectionIn>,
}

#[derive(Deserialize, Debug)]
struct CollectionIn {
    id: String,
    tables: Vec<TableIn>,
}

#[derive(Deserialize, Debug)]
struct TableIn {
    id: String,
    schema: Vec<String>,
    r#type: String,

    #[serde(default)]
    input: bool,
}

#[derive(Serialize, Debug)]
struct ConfigOut {
    collections: Vec<CollectionOut>,
}

#[derive(Serialize, Debug)]
struct CollectionOut {
    id: String,
    is_primary: bool,
    tables: Vec<TableOut>,
}

#[derive(Serialize, Debug)]
struct TableOut {
    id: String,
    schema: Vec<String>,
    r#type: String,
    is_input: bool,
}

fn convert(config: &ConfigIn) -> ConfigOut {
    ConfigOut {
        collections: config
            .collections
            .iter()
            .map(|collection| CollectionOut {
                id: collection.id.clone(),
                is_primary: collection.id == config.primary_id,
                tables: collection
                    .tables
                    .iter()
                    .map(|table| TableOut {
                        id: table.id.clone(),
                        r#type: table.r#type.clone(),
                        is_input: table.input,
                        schema: {
                            let mut res = table.schema.clone();
                            let last = res.last_mut().unwrap();
                            *last = format!(
                                "{segment}-{table_id}-{version}",
                                segment = *last,
                                table_id = table.id,
                                version = collection.id
                            );
                            res
                        },
                    })
                    .collect(),
            })
            .collect(),
    }
}

fn ident_formatter(
    value: &serde_json::Value,
    output: &mut String,
) -> tinytemplate::error::Result<()> {
    if let serde_json::Value::String(s) = value {
        tinytemplate::format_unescaped(&serde_json::Value::String(s.replace(".", "_")), output)
    } else {
        Err(tinytemplate::error::Error::GenericError {
            msg: "bad".to_string(),
        })
    }
}

fn json_formatter(
    value: &serde_json::Value,
    output: &mut String,
) -> tinytemplate::error::Result<()> {
    output.push_str(&value.to_string());
    Ok(())
}

static TEMPLATE : &'static str = "// DON'T EDIT THIS FILE, IT IS AUTO GENERATED

import * as db from '../db'
import * as util from '../util'
import \\{ Live, Diff, Change, Readable } from '../interfaces'
import * as model from '../model'
import \\{ validate as validateModel } from '../model/index.validator'
import \\{ validateLive, applyChanges, diffToChange } from '../base'
import * as readables from '../readables'
import \\{ deleteTable, deleteMeta, integrateLive, integrateReplay } from '.'

export type Tables = \\{
    actions: db.Table<model.SavedAction>
    actionTableMetadata: db.Table<model.ActionTableMetadata>
    {{- for collection in collections -}}
    {{ for table in collection.tables }}
    {table.id}_{ collection.id | ident}: db.Table<Live<model.{table.type}>>
    {{- endfor -}}
    {{- endfor }}
}

export function openAll(db: db.Database): Tables \\{
    return \\{
        actions: db.open(\\{
            schema: ['actions'],
            validator: validateModel('SavedAction')
        }),
        actionTableMetadata: db.open(\\{
            schema: ['actions', '_META_'],
            validator: validateModel('ActionTableMetadata')
        }),
        {{- for collection in collections -}}
        {{ for table in collection.tables }}
        {table.id}_{ collection.id | ident}: db.open(\\{
            schema: {table.schema | json},
            validator: validateLive(validateModel('{table.type}'))
        }),
        {{- endfor -}}
        {{ endfor }}
    }
}

export interface Integrators \\{
    {{- for collection in collections }}
    integrate{ collection.id | ident}(action: model.AnyAction, inputs: Inputs{ collection.id | ident}): Promise<util.Result<Outputs{ collection.id | ident}, model.AnyError>>
    {{- endfor }}
}

export function getSecondaryLiveIntegrators(integrators: Integrators):
    ((ts: Tables, actionId: string, savedAction: model.SavedAction) => Promise<void>)[] \\{
    return [
        {{- for collection in collections }}
        {{ if collection.is_primary -}}
        {{ else -}}
        (ts: Tables, actionId: string, savedAction: model.SavedAction) =>
            integrateReplay(
                '{collection.id}',
                getTrackedInputs{collection.id | ident},
                integrators.integrate{collection.id | ident},
                applyOutputs{collection.id | ident},
                emptyOutputs{collection.id | ident},
                ts, actionId, savedAction),
        {{- endif }}
        {{- endfor }}
    ]
}

export function getAllReplayers(integrators: Integrators, actionId: string, savedAction: model.SavedAction):
    ((ts: Tables) => Promise<void>)[] \\{
    return [
        {{- for collection in collections }}
        (ts: Tables) =>
            integrateReplay(
                '{collection.id}',
                getTrackedInputs{collection.id | ident},
                integrators.integrate{collection.id | ident},
                applyOutputs{collection.id | ident},
                emptyOutputs{collection.id | ident},
                ts, actionId, savedAction),
        {{- endfor }}
    ]
}

{{ for collection in collections }}
// BEGIN {collection.id}

{{ if collection.is_primary -}}
export function getPrimaryLiveIntegrator(integrators: Integrators):
    (ts: Tables, action: model.AnyAction) => Promise<[string, model.SavedAction, model.AnyError | null]> \\{
    return (ts, action) => integrateLive(
        getTrackedInputs{collection.id | ident},
        integrators.integrate{collection.id | ident},
        applyOutputs{collection.id | ident},
        emptyOutputs{collection.id | ident},
        ts, action);
}
{{- endif -}}

export type Inputs{collection.id | ident} = \\{
{{- for table in collection.tables -}}
    {{- if table.is_input }}
    { table.id }: Readable<model.{ table.type }>
    {{- endif -}}
{{ endfor }}
}

export function getTrackedInputs{collection.id | ident}(ts: Tables): [Set<string>, Inputs{collection.id | ident}] \\{
    const parentSet = new Set<string>();
    const track = (actionId: string) => \\{ parentSet.add(actionId) };
    const inputs: Inputs{collection.id | ident} = \\{
    {{- for table in collection.tables -}}
        {{- if table.is_input }}
        { table.id }: readables.tracked(ts.{table.id}_{collection.id | ident}, track),
        {{- endif -}}
    {{ endfor }}
    }
    return [parentSet, inputs]
}

export type Outputs{collection.id | ident} = \\{
{{- for table in collection.tables }}
    { table.id }: Diff<model.{ table.type }>[]
{{- endfor }}
}

export function emptyOutputs{collection.id | ident}(): Outputs{collection.id | ident} \\{
    return \\{
{{- for table in collection.tables }}
        { table.id }: [],
{{- endfor }}
    }
}

export function applyOutputs{collection.id | ident}(ts: Tables, actionId: string, outputs: Outputs{collection.id | ident}): void \\{
    ts.actionTableMetadata.set([actionId, '{collection.id}'], getChangelog{collection.id | ident}(outputs));
{{- for table in collection.tables }}
    applyChanges(ts.{table.id}_{collection.id | ident}, actionId, outputs.{table.id}.map(diffToChange))
{{- endfor }}
}

function getChangelog{collection.id | ident}(outputs: Outputs{collection.id | ident}): model.ActionTableMetadata \\{
    return \\{
        tables: [
        {{- for table in collection.tables }}
            \\{
                schema: {table.schema | json},
                diffs: outputs.{table.id},
            },
        {{- endfor }}
        ]
    }
}

// END {collection.id}
{{ endfor }}

export async function deleteCollection(runner: db.TxRunner, collectionId: string): Promise<void> \\{
    switch (collectionId) \\{
    {{ for collection in collections }}
        case '{collection.id}':
            await deleteMeta(runner, '{collection.id}')
        {{ for table in collection.tables }}
            await deleteTable(runner, '{table.id}_{collection.id | ident}')
        {{- endfor }}
            break;
    {{- endfor }}
        default:
            throw new Error('invalid option')
    }
}";

fn main() {
    let mut buffer = String::new();
    io::stdin().read_to_string(&mut buffer).unwrap();

    let config: ConfigIn = serde_yaml::from_str(&buffer).unwrap();
    let mut tt = tinytemplate::TinyTemplate::new();
    tt.add_template("hello", TEMPLATE).unwrap();
    tt.add_formatter("ident", ident_formatter);
    tt.add_formatter("json", json_formatter);

    let rendered = tt.render("hello", &convert(&config)).unwrap();
    println!("{}", rendered);
}
