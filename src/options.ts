
import { SchemaMap } from 'joi';

export type TableName = (() => string) | string;

export interface DynamoModelOptions {
    name: string
    tableName: TableName
    hashKey: DynamoModelKey
    rangeKey?: DynamoModelKey
    schema: SchemaMap
    updateSchema: SchemaMap
    indexes?: DynamoModelIndex[]
}

export type DynamoModelIndex = {
    name: string
    type: 'LOCAL' | 'GLOBAL'
    hashKey: DynamoModelKey
    rangeKey?: DynamoModelKey
    projection?: DynamoModelIndexProjection
    throughput?: ProvisionedThroughput
}

export type ProvisionedThroughput = {
    read: number
    write: number
}

export type DynamoModelIndexProjection = {
    include?: string[]
    type: 'KEYS_ONLY' | 'INCLUDE' | 'ALL'
}

export type DynamoModelKey = {
    name: string
    type: 'S' | 'N'
}
